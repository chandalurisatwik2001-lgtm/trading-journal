"""
Simulated Exchange Endpoint
Supports:  Spot (BUY/SELL)  +  Futures (LONG/SHORT with leverage)
Every executed order is automatically logged to the Trading Journal.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import requests as req_lib
from datetime import datetime

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.trade import Trade, TradeDirection, TradeStatus
from app.models.sim_position import SimPosition

router = APIRouter()

def get_live_price(symbol: str) -> float:
    try:
        resp = req_lib.get(f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}", timeout=5)
        resp.raise_for_status()
        return float(resp.json()["price"])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Cannot fetch live price for {symbol}: {e}")

def get_or_create_wallet(db: Session, user_id: int, asset: str) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id, Wallet.asset == asset).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, asset=asset, balance=0.0, locked_balance=0.0)
        db.add(wallet)
        db.flush()
    return wallet

def calc_liquidation_price(side: str, entry_price: float, leverage: int) -> float:
    if leverage <= 1:
        return 0.0
    if side == "LONG":
        return round(entry_price * (1 - 1 / leverage), 4)
    return round(entry_price * (1 + 1 / leverage), 4)

# Schemas
class WalletResponse(BaseModel):
    id: int
    asset: str
    balance: float
    locked_balance: float
    class Config:
        orm_mode = True

class SpotOrderRequest(BaseModel):
    symbol: str
    side: str
    quantity: float

class FuturesOrderRequest(BaseModel):
    symbol: str
    side: str
    quantity: float
    leverage: int = 10
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None

class ClosePositionRequest(BaseModel):
    position_id: int

class PositionResponse(BaseModel):
    id: int
    symbol: str
    base_asset: str
    trade_type: str
    side: str
    quantity: float
    entry_price: float
    leverage: int
    margin_used: float
    liquidation_price: Optional[float]
    take_profit: Optional[float]
    stop_loss: Optional[float]
    status: str
    journal_trade_id: Optional[int]
    created_at: datetime
    class Config:
        orm_mode = True

# Wallet
@router.get("/wallet", response_model=List[WalletResponse])
def get_wallets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wallets = db.query(Wallet).filter(Wallet.user_id == current_user.id).all()
    if not wallets:
        default = Wallet(user_id=current_user.id, asset="USDT", balance=100_000.0, locked_balance=0.0)
        db.add(default)
        db.commit()
        db.refresh(default)
        wallets = [default]
    return wallets

@router.post("/wallet/reset")
def reset_wallet(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(SimPosition).filter(SimPosition.user_id == current_user.id, SimPosition.status == "OPEN").update({"status": "CLOSED"})
    db.query(Wallet).filter(Wallet.user_id == current_user.id).delete()
    db.add(Wallet(user_id=current_user.id, asset="USDT", balance=100_000.0, locked_balance=0.0))
    db.commit()
    return {"message": "Wallet reset to $100,000 USDT"}

# Spot
@router.post("/order/spot")
def place_spot_order(order: SpotOrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not order.symbol.endswith("USDT"):
        raise HTTPException(400, "Only USDT pairs supported")
    if order.quantity <= 0:
        raise HTTPException(400, "Quantity must be > 0")

    base_asset = order.symbol[:-4]
    price = get_live_price(order.symbol)
    total_cost = round(price * order.quantity, 4)
    usdt_wallet = get_or_create_wallet(db, current_user.id, "USDT")
    base_wallet = get_or_create_wallet(db, current_user.id, base_asset)

    if order.side.upper() == "BUY":
        if usdt_wallet.balance < total_cost:
            raise HTTPException(400, f"Insufficient USDT (need {total_cost:.2f}, have {usdt_wallet.balance:.2f})")
        usdt_wallet.balance -= total_cost
        base_wallet.balance += order.quantity
        journal = Trade(user_id=current_user.id, symbol=f"{base_asset}/USDT", asset_type="crypto",
                        direction=TradeDirection.LONG, entry_date=datetime.utcnow(), entry_price=price,
                        quantity=order.quantity, status=TradeStatus.OPEN, source="simulated_spot",
                        notes=f"Sim spot BUY {order.quantity} {base_asset} @ ${price:,.2f}")
        db.add(journal)
        db.commit()
        return {"message": f"Bought {order.quantity} {base_asset} @ ${price:,.2f}", "symbol": order.symbol,
                "side": "BUY", "quantity": order.quantity, "price": price, "total": total_cost, "trade_id": journal.id}

    elif order.side.upper() == "SELL":
        if base_wallet.balance < order.quantity:
            raise HTTPException(400, f"Insufficient {base_asset} (need {order.quantity}, have {base_wallet.balance:.4f})")
        open_trades = db.query(Trade).filter(Trade.user_id == current_user.id, Trade.symbol == f"{base_asset}/USDT",
            Trade.status == TradeStatus.OPEN, Trade.direction == TradeDirection.LONG,
            Trade.source == "simulated_spot").order_by(Trade.entry_date).all()
        avg_entry = (sum(t.entry_price * t.quantity for t in open_trades) / sum(t.quantity for t in open_trades)) if open_trades else price
        pnl = round((price - avg_entry) * order.quantity, 4)
        base_wallet.balance -= order.quantity
        usdt_wallet.balance += total_cost
        remaining = order.quantity
        for t in open_trades:
            if remaining <= 0: break
            close_qty = min(t.quantity, remaining)
            t.exit_price = price; t.exit_date = datetime.utcnow()
            t.status = TradeStatus.CLOSED; t.pnl = round((price - t.entry_price) * close_qty, 4)
            remaining -= close_qty
        db.commit()
        return {"message": f"Sold {order.quantity} {base_asset} @ ${price:,.2f} | PnL: ${pnl:+.2f}",
                "symbol": order.symbol, "side": "SELL", "quantity": order.quantity, "price": price, "total": total_cost, "pnl": pnl}
    else:
        raise HTTPException(400, "Side must be BUY or SELL")

# Futures
@router.post("/order/futures")
def place_futures_order(order: FuturesOrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not order.symbol.endswith("USDT"):
        raise HTTPException(400, "Only USDT-margined futures supported")
    if order.quantity <= 0:
        raise HTTPException(400, "Quantity must be > 0")
    if order.leverage < 1 or order.leverage > 125:
        raise HTTPException(400, "Leverage must be between 1 and 125")
    side = order.side.upper()
    if side not in ("LONG", "SHORT"):
        raise HTTPException(400, "Side must be LONG or SHORT")

    base_asset = order.symbol[:-4]
    price = get_live_price(order.symbol)
    notional = price * order.quantity
    margin = round(notional / order.leverage, 4)
    liq_price = calc_liquidation_price(side, price, order.leverage)

    usdt_wallet = get_or_create_wallet(db, current_user.id, "USDT")
    if usdt_wallet.balance < margin:
        raise HTTPException(400, f"Insufficient USDT margin (need {margin:.2f}, have {usdt_wallet.balance:.2f})")

    usdt_wallet.balance -= margin
    usdt_wallet.locked_balance += margin
    direction = TradeDirection.LONG if side == "LONG" else TradeDirection.SHORT

    journal = Trade(user_id=current_user.id, symbol=f"{base_asset}/USDT PERP", asset_type="crypto",
                    direction=direction, entry_date=datetime.utcnow(), entry_price=price,
                    quantity=order.quantity, status=TradeStatus.OPEN, source="simulated_futures",
                    stop_loss=order.stop_loss, take_profit=order.take_profit,
                    notes=f"Sim futures {side} {order.quantity} {base_asset} @ ${price:,.2f} | {order.leverage}x leverage")
    db.add(journal)
    db.flush()

    position = SimPosition(user_id=current_user.id, symbol=order.symbol, base_asset=base_asset,
                           trade_type="futures", side=side, quantity=order.quantity, entry_price=price,
                           leverage=order.leverage, margin_used=margin, liquidation_price=liq_price,
                           take_profit=order.take_profit, stop_loss=order.stop_loss,
                           status="OPEN", journal_trade_id=journal.id)
    db.add(position)
    db.commit()
    return {"message": f"Opened {side} {order.quantity} {base_asset} @ ${price:,.2f} ({order.leverage}x)",
            "position_id": position.id, "journal_trade_id": journal.id, "symbol": order.symbol, "side": side,
            "quantity": order.quantity, "entry_price": price, "leverage": order.leverage,
            "margin_used": margin, "notional_value": notional, "liquidation_price": liq_price}

@router.post("/position/close")
def close_position(req: ClosePositionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    position = db.query(SimPosition).filter(SimPosition.id == req.position_id,
        SimPosition.user_id == current_user.id, SimPosition.status == "OPEN").first()
    if not position:
        raise HTTPException(404, "Open position not found")

    exit_price = get_live_price(position.symbol)
    pnl = ((exit_price - position.entry_price) if position.side == "LONG" else (position.entry_price - exit_price)) * position.quantity
    pnl = round(pnl, 4)
    returned = round(position.margin_used + pnl, 4)

    usdt_wallet = get_or_create_wallet(db, current_user.id, "USDT")
    usdt_wallet.balance += max(returned, 0)
    usdt_wallet.locked_balance = max(usdt_wallet.locked_balance - position.margin_used, 0)
    position.status = "CLOSED"

    if position.journal_trade_id:
        jt = db.query(Trade).filter(Trade.id == position.journal_trade_id).first()
        if jt:
            jt.exit_price = exit_price; jt.exit_date = datetime.utcnow()
            jt.status = TradeStatus.CLOSED; jt.pnl = pnl

    db.commit()
    return {"message": f"Closed {position.side} {position.quantity} {position.base_asset} @ ${exit_price:,.2f}",
            "pnl": pnl, "returned_to_wallet": returned, "entry_price": position.entry_price,
            "exit_price": exit_price, "leverage": position.leverage}

@router.get("/positions", response_model=List[PositionResponse])
def get_open_positions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SimPosition).filter(SimPosition.user_id == current_user.id,
        SimPosition.status == "OPEN").order_by(SimPosition.created_at.desc()).all()

@router.get("/positions/history", response_model=List[PositionResponse])
def get_position_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SimPosition).filter(SimPosition.user_id == current_user.id,
        SimPosition.status == "CLOSED").order_by(SimPosition.created_at.desc()).limit(50).all()
