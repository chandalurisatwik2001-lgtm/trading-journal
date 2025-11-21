from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.endpoints import auth, analytics, trades, users
from app.core.database import engine, Base
from app.models import Trade, User, UserOnboarding  # Add all models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
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
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(trades.router, prefix="/api/v1/trades", tags=["trades"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])


@app.get("/")
async def root():
    return {"message": "TradeZella API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

# Trigger reload
