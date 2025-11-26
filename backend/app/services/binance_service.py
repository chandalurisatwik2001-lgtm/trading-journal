import ccxt
from datetime import datetime
from typing import List, Dict, Any

class BinanceService:
    def __init__(self, api_key: str, api_secret: str, is_testnet: bool = False, account_type: str = "spot"):
        """
        Initialize Binance service
        :param api_key: Binance API key
        :param api_secret: Binance API secret
        :param is_testnet: Whether to use testnet
        :param account_type: "spot" or "future"
        """
        self.client = ccxt.binance({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
            'options': {
                'defaultType': account_type,  # 'spot' or 'future'
                'adjustForTimeDifference': True,  # Crucial for remote servers
                'loadMarkets': False,  # Disable automatic market loading to prevent margin endpoint calls
            },
            'has': {
                'fetchCurrencies': False,  # Disable fetching currencies to avoid hitting sapi endpoints
                'fetchMarginMode': False,  # Disable margin mode fetch to avoid hitting sapi endpoints
                'fetchMarginModes': False, # Disable margin modes fetch to avoid hitting sapi endpoints
                'fetchMarkets': False,     # Disable market fetch which might call margin endpoints
                'fetchTradingFees': False, # Disable trading fees fetch
                'fetchFundingRates': False, # Disable funding rates
            }
        })
        
        if is_testnet:
            # Use testnet.binancefuture.com which is the official Futures Testnet
            testnet_urls = {
                # Redirect Spot URLs to Futures domain to avoid geo-blocking
                'public': 'https://testnet.binancefuture.com/fapi/v1',
                'private': 'https://testnet.binancefuture.com/fapi/v1',
                'v1': 'https://testnet.binancefuture.com/fapi/v1',
                
                # Official Futures Testnet Endpoints
                'fapiPublic': 'https://testnet.binancefuture.com/fapi/v1',
                'fapiPrivate': 'https://testnet.binancefuture.com/fapi/v1',
                'fapiPublicV2': 'https://testnet.binancefuture.com/fapi/v2',
                'fapiPrivateV2': 'https://testnet.binancefuture.com/fapi/v2',
                'dapiPublic': 'https://testnet.binancefuture.com/dapi/v1',
                'dapiPrivate': 'https://testnet.binancefuture.com/dapi/v1',
                
                # Redirect SAPI (Spot) to Futures to satisfy validation without hitting blocked endpoints
                'sapi': 'https://testnet.binancefuture.com/fapi/v1',
                'sapiV2': 'https://testnet.binancefuture.com/fapi/v1',
                'sapiV3': 'https://testnet.binancefuture.com/fapi/v1',
                'sapiV4': 'https://testnet.binancefuture.com/fapi/v1',
            }
            self.client.urls['api'] = testnet_urls
            # Also set test URLs to the same endpoints
            self.client.urls['test'] = testnet_urls
        
        # Monkey-patch to prevent margin API calls
        # Override the method that calls /fapi/v1/margin/allPairs
        def dummy_fetch_margin_modes(*args, **kwargs):
            return []
        
        self.client.fetch_margin_modes = dummy_fetch_margin_modes
        
        # Debug logging
        print(f"Binance Service Initialized: Testnet={is_testnet}, Account={account_type}")
        print(f"API URLs: {self.client.urls.get('api', {})}")
        print(f"Test URLs: {self.client.urls.get('test', {})}")


    def validate_connection(self) -> tuple[bool, str]:
        try:
            # Use fetch_balance for validation - it works for both spot and futures
            # and avoids hitting problematic margin endpoints
            self.client.fetch_balance()
            return True, ""
        except Exception as e:
            error_msg = str(e)
            print(f"Connection validation failed: {error_msg}")
            
            if "451" in error_msg or "Service unavailable from a restricted location" in error_msg:
                return False, (
                    "Connection Blocked: The Render server is located in the US, which Binance blocks. "
                    "Please use the 'Use Testnet' option with Testnet keys, or host your backend in a non-US region."
                )
            
            return False, f"Connection failed: {error_msg}"

    def fetch_trades(self, symbol: str = None, limit: int = 1000) -> List[Dict[str, Any]]:
        try:
            # If symbol is provided, fetch for that symbol
            # Otherwise, we might need to fetch all orders (more complex)
            # For now, let's assume we fetch 'myTrades' which usually requires a symbol
            # Or we can fetch all open orders
            
            # Note: fetch_my_trades usually requires a symbol in Binance
            # To fetch ALL trades, we'd need to iterate over all symbols with balances
            # For this MVP, let's try to fetch for a few major pairs if no symbol is given
            
            trades = []
            symbols_to_check = [symbol] if symbol else ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
            
            for sym in symbols_to_check:
                try:
                    symbol_trades = self.client.fetch_my_trades(sym, limit=limit)
                    trades.extend(symbol_trades)
                except Exception as e:
                    print(f"Error fetching trades for {sym}: {str(e)}")
                    continue
                    
            return self._normalize_trades(trades)
        except Exception as e:
            print(f"Error fetching trades: {str(e)}")
            raise e

    def _normalize_trades(self, raw_trades: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized = []
        for trade in raw_trades:
            # Convert ccxt trade format to our app's Trade format
            normalized.append({
                'symbol': trade['symbol'],
                'asset_type': 'crypto',
                'direction': trade['side'].upper(), # 'buy' -> 'LONG', 'sell' -> 'SHORT' (simplified)
                'entry_date': datetime.fromtimestamp(trade['timestamp'] / 1000),
                'entry_price': float(trade['price']),
                'quantity': float(trade['amount']),
                'commission': float(trade['fee']['cost']) if trade.get('fee') else 0,
                'status': 'CLOSED', # Individual fills are technically closed transactions
                'external_id': str(trade['id']),
                'source': 'binance'
            })
        return normalized
