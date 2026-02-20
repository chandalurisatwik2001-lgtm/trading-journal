"""Portfolio summary endpoint — sim wallet + real exchange combined view."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.sim_position import SimPosition
from app.models.trade import Trade, TradeStatus
from app.models.exchange import ExchangeConnection
from app.core.security_utils import decrypt_string
from app.services.binance_service import BinanceService
from collections import defaultdict

router = APIRouter()

@router.get("/summary")
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return sim wallet balances, open positions, and real exchange data."""
    # Sim wallets
    wallets = db.query(Wallet).filter(Wallet.user_id == current_user.id).all()
    wallet_list = [{"asset": w.asset, "balance": w.balance, "locked": w.locked_balance} for w in wallets]

    # Open futures positions
    positions = db.query(SimPosition).filter(
        SimPosition.user_id == current_user.id,
        SimPosition.status == "OPEN"
    ).all()
    position_list = [
        {"id": p.id, "symbol": p.symbol, "side": p.side, "quantity": p.quantity,
         "entry_price": p.entry_price, "leverage": p.leverage, "margin_used": p.margin_used,
         "liquidation_price": p.liquidation_price, "trade_type": p.trade_type}
        for p in positions
    ]

    # Sim performance summary
    closed_trades = db.query(Trade).filter(
        Trade.user_id == current_user.id,
        Trade.status == TradeStatus.CLOSED,
        Trade.source.in_(["simulated_spot", "simulated_futures"])
    ).all()

    sim_pnl = sum(t.pnl for t in closed_trades if t.pnl) 
    sim_trades = len(closed_trades)
    sim_wins = sum(1 for t in closed_trades if t.pnl and t.pnl > 0)

    # Real exchange (if connected)
    real_exchange = None
    connections = db.query(ExchangeConnection).filter(
        ExchangeConnection.user_id == current_user.id,
        ExchangeConnection.is_active == True
    ).all()

    if connections:
        conn = connections[0]
        try:
            api_key = decrypt_string(conn.api_key_encrypted)
            api_secret = decrypt_string(conn.api_secret_encrypted)
            account_type = getattr(conn, "account_type", "spot")
            svc = BinanceService(api_key, api_secret, conn.is_testnet, account_type)
            balance = svc.fetch_balance()
            real_exchange = {
                "exchange_name": conn.exchange_name,
                "account_type": account_type,
                "is_testnet": conn.is_testnet,
                "balance": balance
            }
        except Exception as e:
            real_exchange = {"error": str(e), "exchange_name": conn.exchange_name}

    return {
        "sim": {
            "wallets": wallet_list,
            "open_positions": position_list,
            "total_sim_pnl": round(sim_pnl, 2),
            "total_sim_trades": sim_trades,
            "sim_win_rate": round(sim_wins / sim_trades * 100, 1) if sim_trades > 0 else 0
        },
        "real_exchange": real_exchange
    }
