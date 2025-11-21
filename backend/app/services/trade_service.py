# trade service
from sqlalchemy.orm import Session
from app.models.trade import Trade, TradeStatus
from app.schemas.trade import TradeCreate, TradeUpdate
from typing import List, Optional

class TradeService:
    
    @staticmethod
    def calculate_pnl(trade: Trade) -> tuple:
        """Calculate P&L and P&L percentage"""
        if not trade.exit_price:
            return None, None
        
        if trade.direction == "LONG":
            pnl = (trade.exit_price - trade.entry_price) * trade.quantity
        else:  # SHORT
            pnl = (trade.entry_price - trade.exit_price) * trade.quantity
        
        pnl = pnl - trade.commission - trade.fees
        
        cost_basis = trade.entry_price * trade.quantity
        pnl_percent = (pnl / cost_basis) * 100 if cost_basis > 0 else 0
        
        return round(pnl, 2), round(pnl_percent, 2)
    
    @staticmethod
    def create_trade(db: Session, trade_data: TradeCreate, user_id: int) -> Trade:
        trade = Trade(**trade_data.dict(), user_id=user_id)
        db.add(trade)
        db.commit()
        db.refresh(trade)
        return trade
    
    @staticmethod
    def get_trade(db: Session, trade_id: int, user_id: int) -> Optional[Trade]:
        return db.query(Trade).filter(
            Trade.id == trade_id,
            Trade.user_id == user_id
        ).first()
    
    @staticmethod
    def get_trades(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Trade]:
        return db.query(Trade).filter(
            Trade.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_trade(db: Session, trade_id: int, user_id: int, trade_update: TradeUpdate) -> Optional[Trade]:
        trade = TradeService.get_trade(db, trade_id, user_id)
        if not trade:
            return None
        
        update_data = trade_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(trade, key, value)
        
        # Calculate P&L if trade is closed
        if trade.exit_price:
            pnl, pnl_percent = TradeService.calculate_pnl(trade)
            trade.pnl = pnl
            trade.pnl_percent = pnl_percent
            trade.status = TradeStatus.CLOSED
        
        db.commit()
        db.refresh(trade)
        return trade
    
    @staticmethod
    def delete_trade(db: Session, trade_id: int, user_id: int) -> bool:
        trade = TradeService.get_trade(db, trade_id, user_id)
        if not trade:
            return False
        db.delete(trade)
        db.commit()
        return True
