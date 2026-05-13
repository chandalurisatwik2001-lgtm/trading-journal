# Test Credentials

## Test User
- Email: test@trader.com
- Password: Test1234
- Username: testtrader
- Full Name: Test Trader

## Auth Endpoints
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- GET /api/v1/auth/me

## Real-time Endpoints
- WS /api/v1/ws/prices (WebSocket for live prices)
- GET /api/v1/prices/live (REST fallback for live prices)
- GET /api/v1/notifications (Recent notifications)

## Key API Endpoints
- GET /api/v1/trades/ (list trades)
- POST /api/v1/trades/ (create trade)
- GET /api/v1/metrics/performance (analytics)
- GET /api/v1/exchanges/status (exchange connections)
