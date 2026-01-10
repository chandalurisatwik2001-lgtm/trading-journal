from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.endpoints import auth, analytics, trades, users, exchanges
from app.core.database import engine, Base
from app.models import Trade, User, UserOnboarding, ExchangeConnection, PasswordResetToken  # Add all models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    from sqlalchemy import text, exc
    
    try:
        Base.metadata.create_all(bind=engine)
        
        # Run schema migrations for existing tables
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE trades ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'manual'"))
                conn.execute(text("ALTER TABLE trades ADD COLUMN IF NOT EXISTS asset_type VARCHAR DEFAULT 'stock'"))
                conn.execute(text("ALTER TABLE trades ADD COLUMN IF NOT EXISTS commission FLOAT DEFAULT 0.0"))
                conn.execute(text("ALTER TABLE exchange_connections ADD COLUMN IF NOT EXISTS account_type VARCHAR DEFAULT 'spot'"))
                conn.commit()
                print("Schema migration completed successfully")
            except Exception as e:
                print(f"Schema migration warning: {e}")

    except exc.OperationalError as e:
        if "Tenant or user not found" in str(e):
            print("\n" + "="*80)
            print("CRITICAL DATABASE CONNECTION ERROR: Tenant or user not found")
            print("="*80)
            print("You are likely connecting to the Supabase Transaction Pooler (port 6543).")
            print("For the Transaction Pooler, your database username must include the project prefix.")
            print("Example: 'postgres.yourprojectid' instead of just 'postgres'.")
            print("Please update your DATABASE_URL environment variable in Render.")
            print("="*80 + "\n")
        raise e
            
    print("Database tables created successfully")
    yield
    # Shutdown: cleanup if needed
    pass

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


@app.get("/")
async def root():
    return {"message": "TradeZella API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

# Trigger reload - v4 (with exchangeInfo fix)
