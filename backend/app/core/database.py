# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings  # adjust if your config path is different

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Use SQLite-specific args only for SQLite, not Postgres
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    # For Postgres (Render / Supabase)
    # Add connection args to prefer IPv4 and improve reliability
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={
            "options": "-c search_path=public",
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# 👇 This is what FastAPI expects to import in auth.py, trades.py, etc.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
