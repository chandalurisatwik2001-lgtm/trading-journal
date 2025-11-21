from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.trade import TradeCreate, TradeUpdate, TradeResponse
from app.services.trade_service import TradeService
from app.api.v1.endpoints.auth import oauth2_scheme, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt

router = APIRouter()


# Get current user from token
from app.models.user import User

# Get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return {"id": user.id, "email": user.email, "username": user.username}


@router.post("/", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(
    trade: TradeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new trade"""
    return TradeService.create_trade(db, trade, current_user["id"])


@router.get("/", response_model=List[TradeResponse])
async def get_trades(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all trades for current user"""
    return TradeService.get_trades(db, current_user["id"], skip, limit)


@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get specific trade by ID"""
    trade = TradeService.get_trade(db, trade_id, current_user["id"])
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.put("/{trade_id}", response_model=TradeResponse)
async def update_trade(
    trade_id: int,
    trade_update: TradeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a trade"""
    trade = TradeService.update_trade(db, trade_id, current_user["id"], trade_update)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.delete("/{trade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a trade"""
    success = TradeService.delete_trade(db, trade_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Trade not found")


# Add analytics endpoint
@router.get("/analytics/performance")
async def get_performance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get performance metrics for current user"""
    trades = TradeService.get_trades(db, current_user["id"], 0, 1000)
    
    if not trades:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "total_pnl": 0,
            "average_win": 0,
            "average_loss": 0,
            "profit_factor": 0,
            "largest_win": 0,
            "largest_loss": 0
        }
    
    closed_trades = [t for t in trades if t.status == 'CLOSED' and t.pnl is not None]
    
    if not closed_trades:
        return {
            "total_trades": len(trades),
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "total_pnl": 0,
            "average_win": 0,
            "average_loss": 0,
            "profit_factor": 0,
            "largest_win": 0,
            "largest_loss": 0
        }
    
    winning = [t for t in closed_trades if t.pnl > 0]
    losing = [t for t in closed_trades if t.pnl < 0]
    
    total_pnl = sum(t.pnl for t in closed_trades)
    avg_win = sum(t.pnl for t in winning) / len(winning) if winning else 0
    avg_loss = sum(t.pnl for t in losing) / len(losing) if losing else 0
    
    total_wins = sum(t.pnl for t in winning)
    total_losses = abs(sum(t.pnl for t in losing))
    profit_factor = total_wins / total_losses if total_losses > 0 else 0
    
    return {
        "total_trades": len(closed_trades),
        "winning_trades": len(winning),
        "losing_trades": len(losing),
        "win_rate": (len(winning) / len(closed_trades) * 100) if closed_trades else 0,
        "total_pnl": total_pnl,
        "average_win": avg_win,
        "average_loss": avg_loss,
        "profit_factor": profit_factor,
        "largest_win": max((t.pnl for t in winning), default=0),
        "largest_loss": min((t.pnl for t in losing), default=0)
    }
