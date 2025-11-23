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
    # Force IPv4 by resolving hostname and adding connection args
    import re
    
    # Extract host from DATABASE_URL
    match = re.search(r'@([^:/]+)', SQLALCHEMY_DATABASE_URL)
    if match:
        hostname = match.group(1)
        # Resolve to IPv4 address
        import socket
        try:
            ipv4_addr = socket.getaddrinfo(hostname, None, socket.AF_INET)[0][4][0]
            # Replace hostname with IPv4 address in connection string
            database_url_ipv4 = SQLALCHEMY_DATABASE_URL.replace(hostname, ipv4_addr)
            engine = create_engine(
                database_url_ipv4,
                pool_pre_ping=True,
                pool_recycle=300,
            )
        except socket.gaierror:
            # Fallback to original URL if resolution fails
            engine = create_engine(
                SQLALCHEMY_DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=300,
            )
    else:
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
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
