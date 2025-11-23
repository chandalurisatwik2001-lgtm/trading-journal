from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.api import deps
from app.models.user import User
from app.models.exchange import ExchangeConnection
from app.models.trade import Trade
from app.core.security_utils import encrypt_string, decrypt_string
from app.services.binance_service import BinanceService

router = APIRouter()

class ExchangeConnectRequest(BaseModel):
    exchange_name: str = "binance"
    api_key: str
    api_secret: str
    is_testnet: bool = False

class ExchangeStatus(BaseModel):
    id: int
    exchange_name: str
    is_active: bool
    is_testnet: bool
    last_synced_at: Optional[str]

@router.post("/connect", response_model=ExchangeStatus)
def connect_exchange(
    data: ExchangeConnectRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # 1. Validate keys with Binance
    service = BinanceService(data.api_key, data.api_secret, data.is_testnet)
    if not service.validate_connection():
        raise HTTPException(status_code=400, detail="Invalid API Key or Secret, or connection failed")

    # 2. Check if already exists
    existing = db.query(ExchangeConnection).filter(
        ExchangeConnection.user_id == current_user.id,
        ExchangeConnection.exchange_name == data.exchange_name
    ).first()

    if existing:
        # Update existing
        existing.api_key = encrypt_string(data.api_key)
        existing.api_secret = encrypt_string(data.api_secret)
        existing.is_testnet = data.is_testnet
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing
    
    # 3. Create new
    new_conn = ExchangeConnection(
        user_id=current_user.id,
        exchange_name=data.exchange_name,
        api_key=encrypt_string(data.api_key),
        api_secret=encrypt_string(data.api_secret),
        is_testnet=data.is_testnet
    )
    db.add(new_conn)
    db.commit()
    db.refresh(new_conn)
    return new_conn

@router.get("/status", response_model=List[ExchangeStatus])
def get_exchange_status(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    connections = db.query(ExchangeConnection).filter(
        ExchangeConnection.user_id == current_user.id,
        ExchangeConnection.is_active == True
    ).all()
    return connections

@router.post("/sync/{exchange_id}")
def sync_trades(
    exchange_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    conn = db.query(ExchangeConnection).filter(
        ExchangeConnection.id == exchange_id,
        ExchangeConnection.user_id == current_user.id
    ).first()
    
    if not conn:
        raise HTTPException(status_code=404, detail="Exchange connection not found")

    # Decrypt keys
    api_key = decrypt_string(conn.api_key)
    api_secret = decrypt_string(conn.api_secret)
    
    # Fetch trades
    service = BinanceService(api_key, api_secret, conn.is_testnet)
    try:
        # Fetching for major pairs for demo purposes
        # In a real app, we'd iterate known symbols or fetch all orders
        fetched_trades = service.fetch_trades()
        
        count = 0
        for t_data in fetched_trades:
            # Check if trade already exists (simple check by external_id if we had it, 
            # but for now we'll just add them. In prod, need deduplication)
            
            # Map direction: 'buy' -> LONG, 'sell' -> SHORT
            direction = "LONG" if t_data['direction'] == "BUY" else "SHORT"
            
            trade = Trade(
                user_id=current_user.id,
                symbol=t_data['symbol'],
                asset_type=t_data['asset_type'],
                direction=direction,
                entry_date=t_data['entry_date'],
                entry_price=t_data['entry_price'],
                quantity=t_data['quantity'],
                status="CLOSED",
                commission=t_data['commission'],
                source="binance"
            )
            db.add(trade)
            count += 1
            
        db.commit()
        return {"message": f"Synced {count} trades successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
