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
        """
        Validate API credentials. 
        For testnet, Binance's public endpoints are geo-blocked on many server IPs.
        We attempt validation but allow saving keys even if the public ping fails,
        since the real validation happens on the first data fetch.
        """
        try:
            import requests
            import hmac
            import hashlib
            import time
            
            account_type = self.client.options.get('defaultType', 'spot')
            
            if account_type == 'future':
                base_domain = self.client.urls['api']['fapiPrivate'].split('/fapi')[0]
                # Use a lightweight private endpoint that requires auth — this proves keys are valid
                timestamp = int(time.time() * 1000)
                params = f'timestamp={timestamp}'
                signature = hmac.new(
                    self.client.secret.encode('utf-8'),
                    params.encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()
                url = f"{base_domain}/fapi/v2/balance?{params}&signature={signature}"
                headers = {'X-MBX-APIKEY': self.client.apiKey}
                print(f"Validating connection via balance endpoint: {url}")
                response = requests.get(url, headers=headers, timeout=15)
            else:
                base_domain = self.client.urls['api']['private'].split('/api')[0]
                timestamp = int(time.time() * 1000)
                params = f'timestamp={timestamp}'
                signature = hmac.new(
                    self.client.secret.encode('utf-8'),
                    params.encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()
                url = f"{base_domain}/api/v3/account?{params}&signature={signature}"
                headers = {'X-MBX-APIKEY': self.client.apiKey}
                print(f"Validating connection via account endpoint: {url}")
                response = requests.get(url, headers=headers, timeout=15)
            
            print(f"Validation response: HTTP {response.status_code}: {response.text[:300]}")
            
            if response.status_code == 200:
                print("Connection validation successful!")
                return True, ""
            elif response.status_code in [401, 403]:
                return False, "Invalid API key or secret. Please check your credentials."
            else:
                # For geo-blocks (451) or other server-side errors, allow the connection
                # The keys will be tested on the next sync
                print(f"Validation returned HTTP {response.status_code}. Allowing connection.")
                return True, ""
                
        except Exception as e:
            error_msg = str(e)
            print(f"Connection validation exception: {error_msg}")
            # Don't block the user if there's a network-level failure — allow saving keys
            return True, ""

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

    def fetch_balance(self) -> Dict[str, Any]:
        """Fetch account balance using direct HTTP request"""
        try:
            import requests
            import hmac
            import hashlib
            import time
            
            if self.client.options['defaultType'] == 'future':
                # Extract base domain from URL (remove path)
                base_domain = self.client.urls['api']['fapiPrivate'].split('/fapi')[0]
                endpoint = '/fapi/v2/balance'
            else:
                base_domain = self.client.urls['api']['private'].split('/api')[0]
                endpoint = '/api/v3/account'
            
            # Prepare request
            timestamp = int(time.time() * 1000)
            params = f'timestamp={timestamp}'
            
            # Sign the request
            signature = hmac.new(
                self.client.secret.encode('utf-8'),
                params.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Make the request
            url = f"{base_domain}{endpoint}?{params}&signature={signature}"
            headers = {'X-MBX-APIKEY': self.client.apiKey}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data
            else:
                raise Exception(f"Failed to fetch balance: {response.text}")
                
        except Exception as e:
            print(f"Error fetching balance: {str(e)}")
            raise e
    
    def fetch_positions(self) -> List[Dict[str, Any]]:
        """Fetch open positions (futures only) using direct HTTP request"""
        try:
            import requests
            import hmac
            import hashlib
            import time
            
            if self.client.options['defaultType'] != 'future':
                return []  # Positions only exist for futures
            
            # Extract base domain from URL (remove path)
            base_domain = self.client.urls['api']['fapiPrivate'].split('/fapi')[0]
            endpoint = '/fapi/v2/positionRisk'
            
            # Prepare request
            timestamp = int(time.time() * 1000)
            params = f'timestamp={timestamp}'
            
            # Sign the request
            signature = hmac.new(
                self.client.secret.encode('utf-8'),
                params.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Make the request
            url = f"{base_domain}{endpoint}?{params}&signature={signature}"
            headers = {'X-MBX-APIKEY': self.client.apiKey}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                positions = response.json()
                # Filter out positions with 0 quantity
                open_positions = [p for p in positions if float(p.get('positionAmt', 0)) != 0]
                return open_positions
            else:
                raise Exception(f"Failed to fetch positions: {response.text}")
                
        except Exception as e:
            print(f"Error fetching positions: {str(e)}")
            raise e
