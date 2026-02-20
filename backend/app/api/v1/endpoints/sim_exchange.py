from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
import requests
from datetime import datetime

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.trade import Trade

router = APIRouter()

class MarketOrderRequest(BaseModel):
    symbol: str  # e.g., "BTCUSDT"
    side: str    # "BUY" or "SELL"
    quantity: float

class WalletResponse(BaseModel):
    id: int
    asset: str
    balance: float
    locked_balance: float

    class Config:
        orm_mode = True

def get_live_price(symbol: str) -> float:
    """Fetch live price from Binance Public API"""
    try:
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return float(data['price'])
        else:
            raise Exception(f"Binance API returned {response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch live price: {str(e)}")

@router.get("/wallet", response_model=List[WalletResponse])
def get_wallets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all user wallets. Creates a default USDT wallet if none exists."""
    wallets = db.query(Wallet).filter(Wallet.user_id == current_user.id).all()
    
    if not wallets:
        # Seed initial virtual funds
        default_wallet = Wallet(
            user_id=current_user.id,
            asset="USDT",
            balance=100000.0,  # $100k starting balance
            locked_balance=0.0
        )
        db.add(default_wallet)
        db.commit()
        db.refresh(default_wallet)
        wallets = [default_wallet]
        
    return wallets

@router.post("/order/market")
def place_market_order(
    order: MarketOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute a virtual market order against real live prices."""
    
    # Simple symbol parsing (e.g., BTCUSDT -> Base: BTC, Quote: USDT)
    if not order.symbol.endswith("USDT"):
        raise HTTPException(status_code=400, detail="Only USDT pairs are supported for now")
    
    base_asset = order.symbol[:-4]  # e.g., "BTC"
    quote_asset = "USDT"            # e.g., "USDT"
    
    if order.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    # 1. Fetch exact live price
    current_price = get_live_price(order.symbol)
    total_cost = current_price * order.quantity
    
    # 2. Get/Create User Wallets
    quote_wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id, Wallet.asset == quote_asset).first()
    base_wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id, Wallet.asset == base_asset).first()
    
    if not quote_wallet:
        quote_wallet = Wallet(user_id=current_user.id, asset=quote_asset, balance=0.0)
        db.add(quote_wallet)
    
    if not base_wallet:
        base_wallet = Wallet(user_id=current_user.id, asset=base_asset, balance=0.0)
        db.add(base_wallet)

    # 3. Execute Trade Logic
    if order.side.upper() == "BUY":
        if quote_wallet.balance < total_cost:
            raise HTTPException(status_code=400, detail=f"Insufficient {quote_asset} balance")
        
        quote_wallet.balance -= total_cost
        base_wallet.balance += order.quantity
        direction = "LONG"

    elif order.side.upper() == "SELL":
        if base_wallet.balance < order.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient {base_asset} balance")
        
        base_wallet.balance -= order.quantity
        quote_wallet.balance += total_cost
        direction = "SHORT"
        
    else:
        raise HTTPException(status_code=400, detail="Side must be BUY or SELL")

    # 4. Record Trade in Journal
    new_trade = Trade(
        user_id=current_user.id,
        symbol=f"{base_asset}/{quote_asset}",
        asset_type="crypto",
        direction=direction,
        entry_date=datetime.utcnow(),
        entry_price=current_price,
        quantity=order.quantity,
        status="CLOSED", # Instant market execution
        source="simulated_exchange"
    )
    db.add(new_trade)
    db.commit()

    return {
        "message": "Order executed successfully",
        "symbol": order.symbol,
        "side": order.side.upper(),
        "quantity": order.quantity,
        "price": current_price,
        "total": total_cost,
        "trade_id": new_trade.id
    }
