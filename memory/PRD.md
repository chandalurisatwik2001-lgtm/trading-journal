# TradeZella - Real-time Trading Journal PRD

## Original Problem Statement
User had an existing Trading Journal (TradeZella) app and wanted to make it a "realtime project" with:
- Live cryptocurrency/stock price feeds
- Real-time P&L tracking
- Live trade notifications
- Real-time market data charts
- Working authentication
- Everything accessible from anywhere

## Architecture
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + TypeScript + Tailwind CSS + Recharts
- **Real-time**: WebSocket (FastAPI native) + CoinGecko API
- **Auth**: JWT Bearer tokens + localStorage

## User Personas
- **Trader**: Logs trades, monitors performance, views real-time prices
- **Analyst**: Reviews analytics, drawdown, P&L curves

## Core Requirements (Static)
1. User authentication (signup/login/logout)
2. Trade management (CRUD)
3. Performance analytics (win rate, P&L, profit factor, streaks, drawdown)
4. Dashboard with customizable widgets
5. Calendar view
6. Exchange connectivity (Binance)
7. Simulated trading

## What's Been Implemented (Jan 2026)
- [x] Fixed login by rewiring REACT_APP_API_URL to local backend
- [x] Reset SQLite database for correct schema
- [x] Built WebSocket server in backend (app/websocket.py)
- [x] Integrated CoinGecko API for live crypto prices (8 coins: BTC, ETH, BNB, SOL, XRP, ADA, DOGE, DOT)
- [x] Created useRealtimeData React hook for WebSocket data
- [x] Built Live Market Ticker widget (real-time prices with 24h change)
- [x] Built Live Price Chart widget (interactive chart with coin selectors)
- [x] Built Live Notifications widget (real-time alerts)
- [x] Added trade creation notifications via WebSocket
- [x] Integrated all real-time widgets into Dashboard widget system
- [x] Fixed onboarding schema (created_at/updated_at made optional)

## Test Results
- Backend: 100% (19/19 tests passed)
- Frontend: 95% (all core flows working, minor WebSocket intermittency)

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (Important)
- Fix WebSocket intermittent connection through Kubernetes ingress
- Add stock price feeds (Finnhub integration)
- Real-time P&L calculation based on open positions + live prices

### P2 (Nice to Have)
- Price alerts (set threshold, get notified)
- Trade replay feature
- Portfolio heat map
- Multi-currency support
- Google OAuth domain configuration for preview environment
- Fix Recharts TypeScript errors in Reports charts

## Next Tasks
1. Add price alert system (user sets price threshold, gets WebSocket notification)
2. Add real-time P&L calculation combining open positions with live prices
3. Add more stock data sources beyond CoinGecko
4. Implement trade journal/notebook feature
