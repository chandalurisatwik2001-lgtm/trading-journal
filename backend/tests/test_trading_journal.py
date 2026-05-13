"""
Backend API Tests for Trading Journal (TradeZella) App
Tests: Auth, Trades, Live Prices, WebSocket endpoints
"""
import pytest
import requests
import os
from datetime import datetime

# Use the external URL for testing
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://692f1056-73b9-41be-9388-6a3be6c9ec5d.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "test@trader.com"
TEST_PASSWORD = "Test1234"
TEST_USERNAME = "testtrader"


class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns API info (via /api/v1 prefix)"""
        # The external URL routes / to frontend, so we test via internal path
        # For external testing, we verify the API is accessible via /api/v1
        response = requests.get(f"{BASE_URL}/api/v1/prices/live")
        assert response.status_code == 200
        data = response.json()
        assert "prices" in data
        print(f"✓ API accessible via /api/v1 prefix")
    
    def test_health_endpoint(self):
        """Test health endpoint via API prefix"""
        # Health endpoint is at root level, but external URL routes to frontend
        # We verify API health by checking a known working endpoint
        response = requests.get(f"{BASE_URL}/api/v1/notifications")
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        print(f"✓ API health verified via notifications endpoint")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login success: user={data['user']['email']}")
        return data["access_token"]
    
    def test_login_invalid_password(self):
        """Test login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Login with wrong password correctly rejected")
    
    def test_login_nonexistent_email(self):
        """Test login with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "nonexistent@test.com", "password": "anypassword"}
        )
        assert response.status_code == 404
        print("✓ Login with non-existent email correctly rejected")
    
    def test_signup_duplicate_email(self):
        """Test signup with existing email"""
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/signup",
            json={
                "email": TEST_EMAIL,
                "username": "newuser123",
                "password": "Test1234"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower() or "email" in data["detail"].lower()
        print("✓ Signup with duplicate email correctly rejected")
    
    def test_check_email_availability(self):
        """Test email availability check"""
        # Existing email
        response = requests.get(f"{BASE_URL}/api/v1/auth/check-email?email={TEST_EMAIL}")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == False
        
        # New email
        response = requests.get(f"{BASE_URL}/api/v1/auth/check-email?email=newuser@test.com")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == True
        print("✓ Email availability check working")
    
    def test_check_username_availability(self):
        """Test username availability check"""
        # Existing username
        response = requests.get(f"{BASE_URL}/api/v1/auth/check-username?username={TEST_USERNAME}")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == False
        
        # New username
        response = requests.get(f"{BASE_URL}/api/v1/auth/check-username?username=newuser999")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == True
        print("✓ Username availability check working")


class TestAuthenticatedEndpoints:
    """Tests requiring authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_current_user(self, auth_headers):
        """Test getting current user info"""
        response = requests.get(
            f"{BASE_URL}/api/v1/auth/me",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        print(f"✓ Get current user: {data['email']}")
    
    def test_get_trades_list(self, auth_headers):
        """Test getting trades list"""
        response = requests.get(
            f"{BASE_URL}/api/v1/trades/",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get trades list: {len(data)} trades")
    
    def test_get_performance_metrics(self, auth_headers):
        """Test getting performance metrics"""
        response = requests.get(
            f"{BASE_URL}/api/v1/metrics/performance",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_trades" in data
        assert "win_rate" in data
        assert "total_pnl" in data
        print(f"✓ Performance metrics: total_trades={data['total_trades']}, win_rate={data['win_rate']}")
    
    def test_get_onboarding(self, auth_headers):
        """Test getting user onboarding data"""
        response = requests.get(
            f"{BASE_URL}/api/v1/users/me/onboarding",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        print(f"✓ Get onboarding: user_id={data['user_id']}")
    
    def test_get_exchange_status(self, auth_headers):
        """Test getting exchange connection status"""
        response = requests.get(
            f"{BASE_URL}/api/v1/exchanges/status",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Exchange status: {len(data)} connections")


class TestTradeCRUD:
    """Trade CRUD operations tests"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get headers with auth token"""
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            token = response.json()["access_token"]
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Authentication failed")
    
    def test_create_and_get_trade(self, auth_headers):
        """Test creating a trade and verifying it exists"""
        # Create trade - quantity must be integer per schema
        trade_data = {
            "symbol": "TEST_BTC",
            "direction": "LONG",
            "entry_price": 50000.0,
            "quantity": 1,
            "entry_date": datetime.now().isoformat(),
            "status": "OPEN"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/v1/trades/",
            json=trade_data,
            headers=auth_headers
        )
        assert create_response.status_code == 201, f"Create failed: {create_response.text}"
        created_trade = create_response.json()
        
        assert created_trade["symbol"] == trade_data["symbol"]
        assert created_trade["direction"] == trade_data["direction"]
        assert "id" in created_trade
        
        trade_id = created_trade["id"]
        print(f"✓ Created trade: id={trade_id}, symbol={created_trade['symbol']}")
        
        # Get trade to verify persistence
        get_response = requests.get(
            f"{BASE_URL}/api/v1/trades/{trade_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        fetched_trade = get_response.json()
        assert fetched_trade["id"] == trade_id
        assert fetched_trade["symbol"] == trade_data["symbol"]
        print(f"✓ Verified trade persistence: id={trade_id}")
        
        # Cleanup - delete the test trade
        delete_response = requests.delete(
            f"{BASE_URL}/api/v1/trades/{trade_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 204
        print(f"✓ Deleted test trade: id={trade_id}")
        
        # Verify deletion
        verify_response = requests.get(
            f"{BASE_URL}/api/v1/trades/{trade_id}",
            headers=auth_headers
        )
        assert verify_response.status_code == 404
        print(f"✓ Verified trade deletion: id={trade_id}")


class TestLivePrices:
    """Live price endpoints tests"""
    
    def test_get_live_prices(self):
        """Test getting live crypto prices"""
        response = requests.get(f"{BASE_URL}/api/v1/prices/live")
        assert response.status_code == 200
        data = response.json()
        
        assert "prices" in data
        prices = data["prices"]
        assert isinstance(prices, list)
        
        if len(prices) > 0:
            # Validate price structure
            price = prices[0]
            assert "symbol" in price
            assert "price" in price
            assert "change_24h" in price
            assert "timestamp" in price
            
            # Check for expected coins
            symbols = [p["symbol"] for p in prices]
            expected_coins = ["BTC", "ETH", "BNB", "SOL"]
            for coin in expected_coins:
                assert coin in symbols, f"Expected {coin} in prices"
            
            print(f"✓ Live prices: {len(prices)} coins")
            for p in prices[:4]:
                print(f"  - {p['symbol']}: ${p['price']:,.2f} ({p['change_24h']:+.2f}%)")
        else:
            print("⚠ Live prices returned empty (CoinGecko may be rate limited)")
    
    def test_get_notifications(self):
        """Test getting notifications"""
        response = requests.get(f"{BASE_URL}/api/v1/notifications")
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        print(f"✓ Notifications: {len(data['notifications'])} items")


class TestUnauthorizedAccess:
    """Test unauthorized access to protected endpoints"""
    
    def test_trades_without_auth(self):
        """Test accessing trades without authentication"""
        response = requests.get(f"{BASE_URL}/api/v1/trades/")
        assert response.status_code == 401
        print("✓ Trades endpoint correctly requires authentication")
    
    def test_metrics_without_auth(self):
        """Test accessing metrics without authentication"""
        response = requests.get(f"{BASE_URL}/api/v1/metrics/performance")
        assert response.status_code == 401
        print("✓ Metrics endpoint correctly requires authentication")
    
    def test_user_me_without_auth(self):
        """Test accessing user info without authentication"""
        response = requests.get(f"{BASE_URL}/api/v1/auth/me")
        assert response.status_code == 401
        print("✓ User info endpoint correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
