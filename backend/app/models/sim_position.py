from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class SimPosition(Base):
    __tablename__ = "sim_positions"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol           = Column(String, nullable=False)          # e.g. "BTCUSDT"
    base_asset       = Column(String, nullable=False)          # e.g. "BTC"
    trade_type       = Column(String, default="futures")       # "spot" | "futures"
    side             = Column(String, nullable=False)           # "LONG" | "SHORT"
    quantity         = Column(Float, nullable=False)
    entry_price      = Column(Float, nullable=False)
    leverage         = Column(Integer, default=1)
    margin_used      = Column(Float, nullable=False)           # USDT locked
    liquidation_price= Column(Float, nullable=True)
    take_profit      = Column(Float, nullable=True)
    stop_loss        = Column(Float, nullable=True)
    status           = Column(String, default="OPEN")          # "OPEN" | "CLOSED"
    journal_trade_id = Column(Integer, ForeignKey("trades.id"), nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sim_positions")
