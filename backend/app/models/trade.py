from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class TradeDirection(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"


class TradeStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String, nullable=False, index=True)
    direction = Column(Enum(TradeDirection), nullable=False)
    entry_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    entry_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    exit_date = Column(DateTime, nullable=True)
    exit_price = Column(Float, nullable=True)
    pnl = Column(Float, nullable=True)
    status = Column(Enum(TradeStatus), nullable=False, default=TradeStatus.OPEN)
    notes = Column(String, nullable=True)
    asset_type = Column(String, default="stock")
    commission = Column(Float, default=0.0)
    source = Column(String, default="manual") # 'manual', 'binance', etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="trades")
