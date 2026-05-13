import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.endpoints import auth, analytics, trades, users, exchanges, sim_exchange, portfolio
from app.core.database import engine, Base
from app.models import Trade, User, UserOnboarding, ExchangeConnection, PasswordResetToken, Wallet, SimPosition
from app.websocket import manager, price_broadcast_loop, get_initial_data, send_notification, price_cache, notifications_log

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    from sqlalchemy import text, exc
    
    try:
        Base.metadata.create_all(bind=engine)
        
        # Run schema migrations for existing tables
        with engine.connect() as conn:
            # Try each migration individually (SQLite doesn't support IF NOT EXISTS)
            migrations = [
                "ALTER TABLE trades ADD COLUMN source VARCHAR DEFAULT 'manual'",
                "ALTER TABLE trades ADD COLUMN asset_type VARCHAR DEFAULT 'stock'",
                "ALTER TABLE trades ADD COLUMN commission FLOAT DEFAULT 0.0",
                "ALTER TABLE exchange_connections ADD COLUMN account_type VARCHAR DEFAULT 'spot'",
            ]
            for migration in migrations:
                try:
                    conn.execute(text(migration))
                    conn.commit()
                except Exception:
                    pass  # Column already exists
            print("Schema migration completed successfully")

    except exc.OperationalError as e:
        if "Tenant or user not found" in str(e):
            print("CRITICAL DATABASE CONNECTION ERROR: Tenant or user not found")
            print("Update your DATABASE_URL with the correct project prefix.")
        raise e
            
    print("Database tables created successfully")

    # Start real-time price broadcast
    broadcast_task = asyncio.create_task(price_broadcast_loop())
    print("Real-time WebSocket price feed started")

    yield

    # Shutdown
    broadcast_task.cancel()
    print("WebSocket broadcast stopped")

app = FastAPI(title="TradeZella API", version="1.0.0", lifespan=lifespan)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(analytics.router, prefix="/api/v1/metrics", tags=["analytics"])
app.include_router(trades.router, prefix="/api/v1/trades", tags=["trades"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(exchanges.router, prefix="/api/v1/exchanges", tags=["exchanges"])
app.include_router(sim_exchange.router, prefix="/api/v1/sim_exchange", tags=["simulated_exchange"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])


@app.get("/")
async def root():
    return {"message": "TradeZella API is running", "version": "2.0.0", "realtime": True}


@app.get("/health")
async def health():
    return {"status": "healthy", "ws_connections": len(manager.active_connections)}


# ─── WebSocket Endpoint ───
@app.websocket("/api/v1/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial snapshot
        await websocket.send_json(get_initial_data())
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# ─── Live Price REST endpoints (fallback for non-WS clients) ───
@app.get("/api/v1/prices/live")
async def get_live_prices():
    from app.websocket import price_cache as pc
    return {"prices": list(pc.values())}


@app.get("/api/v1/notifications")
async def get_notifications():
    from app.websocket import notifications_log as nl
    return {"notifications": nl[:30]}
