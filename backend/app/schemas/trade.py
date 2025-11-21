from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TradeDirection(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"


class TradeStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class TradeBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)
    direction: TradeDirection
    entry_date: datetime
    entry_price: float = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    exit_date: Optional[datetime] = None
    exit_price: Optional[float] = None
    pnl: Optional[float] = None
    status: TradeStatus = TradeStatus.OPEN
    notes: Optional[str] = None


class TradeCreate(TradeBase):
    pass


class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    direction: Optional[TradeDirection] = None
    entry_date: Optional[datetime] = None
    entry_price: Optional[float] = None
    quantity: Optional[int] = None
    exit_date: Optional[datetime] = None
    exit_price: Optional[float] = None
    pnl: Optional[float] = None
    status: Optional[TradeStatus] = None
    notes: Optional[str] = None


class TradeResponse(TradeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
