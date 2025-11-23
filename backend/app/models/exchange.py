from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ExchangeConnection(Base):
    __tablename__ = "exchange_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exchange_name = Column(String, index=True)  # e.g., "binance"
    api_key = Column(String)  # Encrypted
    api_secret = Column(String)  # Encrypted
    is_testnet = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_synced_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="exchanges")
