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
            },
            'has': {
                'fetchCurrencies': False,  # Disable fetching currencies to avoid hitting sapi endpoints
            }
        })
        
        if is_testnet:
            # Use demo.binance.com URLs instead of testnet.binance.vision
            # demo.binance.com has less strict geo-restrictions
            demo_urls = {
                # Redirect Spot URLs to Futures domain because demo-api (Spot) is geo-blocked
                'public': 'https://demo-fapi.binance.com/fapi/v1',
                'private': 'https://demo-fapi.binance.com/fapi/v1',
                'v1': 'https://demo-fapi.binance.com/fapi/v1',
                'fapiPublic': 'https://demo-fapi.binance.com/fapi/v1',
                'fapiPrivate': 'https://demo-fapi.binance.com/fapi/v1',
                'fapiPublicV2': 'https://demo-fapi.binance.com/fapi/v2',
                'fapiPrivateV2': 'https://demo-fapi.binance.com/fapi/v2',
                'dapiPublic': 'https://demo-dapi.binance.com/dapi/v1',
                'dapiPrivate': 'https://demo-dapi.binance.com/dapi/v1',
                # Add dummy sapi URLs to satisfy ccxt validation
                'sapi': 'https://demo-api.binance.com/sapi/v1',
                'sapiV2': 'https://demo-api.binance.com/sapi/v2',
                'sapiV3': 'https://demo-api.binance.com/sapi/v3',
                'sapiV4': 'https://demo-api.binance.com/sapi/v4',
            }
            self.client.urls['api'] = demo_urls
            # Also set test URLs to the same demo endpoints
            self.client.urls['test'] = demo_urls
            
        # Debug logging
        print(f"Binance Service Initialized: Testnet={is_testnet}, Account={account_type}")
        print(f"API URLs: {self.client.urls.get('api', {})}")
        print(f"Test URLs: {self.client.urls.get('test', {})}")

    def validate_connection(self) -> tuple[bool, str]:
        try:
            # Use fetch_positions for futures to avoid sapi endpoints
            # This is strictly a futures endpoint (fapi) and shouldn't hit restricted spot APIs
            if self.client.options['defaultType'] == 'future':
                self.client.fetch_positions()
            else:
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
