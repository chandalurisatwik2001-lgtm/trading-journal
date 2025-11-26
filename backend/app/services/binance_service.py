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
        config = {
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
            'options': {
                'defaultType': account_type,  # 'spot' or 'future'
                'adjustForTimeDifference': True,  # Crucial for remote servers
            }
        }
        
        # Configure testnet URLs manually - set_sandbox_mode doesn't work reliably
        if is_testnet:
            if account_type == 'future':
                # Binance Futures Testnet (demo.binance.com)
                config['urls'] = {
                    'api': {
                        'public': 'https://testnet.binancefuture.com/fapi/v1',
                        'private': 'https://testnet.binancefuture.com/fapi/v1',
                    }
                }
            else:
                # Binance Spot Testnet
                config['urls'] = {
                    'api': {
                        'public': 'https://testnet.binance.vision/api/v3',
                        'private': 'https://testnet.binance.vision/api/v3',
                    }
                }
        
        self.client = ccxt.binance(config)

    def validate_connection(self) -> tuple[bool, str]:
        try:
            # Fetch balance to verify keys
            self.client.fetch_balance()
            return True, ""
        except Exception as e:
            error_msg = str(e)
            print(f"Connection validation failed: {error_msg}")
            return False, error_msg

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
