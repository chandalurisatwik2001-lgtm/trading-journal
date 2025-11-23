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
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# 👇 This is what FastAPI expects to import in auth.py, trades.py, etc.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
