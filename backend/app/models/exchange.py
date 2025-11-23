from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ExchangeConnection(Base):
    __tablename__ = "exchange_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exchange_name = Column(String, nullable=False)  # e.g., "binance", "coinbase"
    
    # Encrypted API credentials
    api_key_encrypted = Column(Text, nullable=False)
    api_secret_encrypted = Column(Text, nullable=False)
    
    # Connection metadata
    is_active = Column(Boolean, default=True)
    is_testnet = Column(Boolean, default=False)
    account_type = Column(String, default="spot")  # "spot" or "future"
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="exchanges")
    
    def __repr__(self):
        return f"<ExchangeConnection(id={self.id}, exchange={self.exchange_name}, user_id={self.user_id})>"
