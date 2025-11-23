# analytics service
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.trade import Trade, TradeStatus
from typing import Dict, List
from datetime import datetime, timedelta
from collections import defaultdict

class AnalyticsService:
    
    @staticmethod
    def get_performance_metrics(db: Session, user_id: int) -> Dict:
        """Calculate key performance metrics"""
        
        closed_trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED
        ).all()
        
        if not closed_trades:
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
        
        winning_trades = [t for t in closed_trades if t.pnl and t.pnl > 0]
        losing_trades = [t for t in closed_trades if t.pnl and t.pnl < 0]
        
        total_trades = len(closed_trades)
        wins = len(winning_trades)
        losses = len(losing_trades)
        
        total_pnl = sum(t.pnl for t in closed_trades if t.pnl)
        total_wins = sum(t.pnl for t in winning_trades)
        total_losses = abs(sum(t.pnl for t in losing_trades))
        
        return {
            "total_trades": total_trades,
            "winning_trades": wins,
            "losing_trades": losses,
            "win_rate": round((wins / total_trades) * 100, 2) if total_trades > 0 else 0,
            "total_pnl": round(total_pnl, 2),
            "average_win": round(total_wins / wins, 2) if wins > 0 else 0,
            "average_loss": round(total_losses / losses, 2) if losses > 0 else 0,
            "profit_factor": round(total_wins / total_losses, 2) if total_losses > 0 else 0,
            "largest_win": round(max((t.pnl for t in winning_trades), default=0), 2),
            "largest_loss": round(min((t.pnl for t in losing_trades), default=0), 2)
        }
    
    @staticmethod
    def get_daily_pnl(db: Session, user_id: int, start_date: datetime = None, end_date: datetime = None) -> List[Dict]:
        """Get daily P&L aggregation"""
        
        query = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None)
        )
        
        if start_date:
            query = query.filter(Trade.entry_date >= start_date)
        if end_date:
            query = query.filter(Trade.entry_date <= end_date)
        
        trades = query.order_by(Trade.entry_date).all()
        
        # Group by date
        daily_data = defaultdict(lambda: {"pnl": 0, "trades": 0, "wins": 0, "losses": 0})
        for trade in trades:
            date_key = trade.entry_date.date().isoformat()
            daily_data[date_key]["pnl"] += trade.pnl
            daily_data[date_key]["trades"] += 1
            if trade.pnl > 0:
                daily_data[date_key]["wins"] += 1
            else:
                daily_data[date_key]["losses"] += 1
        
        # Convert to list
        result = []
        for date_str, data in sorted(daily_data.items()):
            result.append({
                "date": date_str,
                "pnl": round(data["pnl"], 2),
                "trades": data["trades"],
                "wins": data["wins"],
                "losses": data["losses"],
                "win_rate": round((data["wins"] / data["trades"]) * 100, 2) if data["trades"] > 0 else 0
            })
        
        return result
    
    @staticmethod
    def get_cumulative_pnl(db: Session, user_id: int) -> List[Dict]:
        """Get cumulative P&L time series"""
        
        trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None)
        ).order_by(Trade.entry_date).all()
        
        cumulative = 0
        result = []
        
        for trade in trades:
            cumulative += trade.pnl
            result.append({
                "date": trade.entry_date.isoformat(),
                "pnl": round(trade.pnl, 2),
                "cumulative_pnl": round(cumulative, 2)
            })
        
        return result
    
    @staticmethod
    def calculate_streaks(db: Session, user_id: int) -> Dict:
        """Calculate current winning/losing streaks"""
        
        trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None)
        ).order_by(Trade.entry_date.desc()).all()
        
        if not trades:
            return {
                "current_trade_streak": 0,
                "current_trade_streak_type": "none",
                "current_day_streak": 0,
                "current_day_streak_type": "none",
                "max_trade_win_streak": 0,
                "max_trade_loss_streak": 0
            }
        
        # Calculate trade streak
        current_trade_streak = 0
        current_trade_streak_type = "win" if trades[0].pnl > 0 else "loss"
        
        for trade in trades:
            is_win = trade.pnl > 0
            if (is_win and current_trade_streak_type == "win") or (not is_win and current_trade_streak_type == "loss"):
                current_trade_streak += 1
            else:
                break
        
        # Calculate day streak (group by date)
        daily_pnl = defaultdict(float)
        for trade in trades:
            date_key = trade.entry_date.date()
            daily_pnl[date_key] += trade.pnl
        
        sorted_dates = sorted(daily_pnl.keys(), reverse=True)
        current_day_streak = 0
        current_day_streak_type = "win" if daily_pnl[sorted_dates[0]] > 0 else "loss"
        
        for date in sorted_dates:
            is_win_day = daily_pnl[date] > 0
            if (is_win_day and current_day_streak_type == "win") or (not is_win_day and current_day_streak_type == "loss"):
                current_day_streak += 1
            else:
                break
        
        return {
            "current_trade_streak": current_trade_streak,
            "current_trade_streak_type": current_trade_streak_type,
            "current_day_streak": current_day_streak,
            "current_day_streak_type": current_day_streak_type
        }
    
    @staticmethod
    def calculate_drawdown(db: Session, user_id: int) -> Dict:
        """Calculate max and average drawdown"""
        
        trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None)
        ).order_by(Trade.entry_date).all()
        
        if not trades:
            return {
                "max_drawdown": 0,
                "max_drawdown_percent": 0,
                "average_drawdown": 0,
                "current_drawdown": 0
            }
        
        # Calculate cumulative P&L and track drawdowns
        cumulative = 0
        peak = 0
        max_drawdown = 0
        drawdowns = []
        
        for trade in trades:
            cumulative += trade.pnl
            if cumulative > peak:
                peak = cumulative
            
            drawdown = peak - cumulative
            if drawdown > 0:
                drawdowns.append(drawdown)
                max_drawdown = max(max_drawdown, drawdown)
        
        current_drawdown = peak - cumulative
        avg_drawdown = sum(drawdowns) / len(drawdowns) if drawdowns else 0
        max_drawdown_percent = (max_drawdown / peak * 100) if peak > 0 else 0
        
        return {
            "max_drawdown": round(max_drawdown, 2),
            "max_drawdown_percent": round(max_drawdown_percent, 2),
            "average_drawdown": round(avg_drawdown, 2),
            "current_drawdown": round(current_drawdown, 2)
        }
    
    @staticmethod
    def get_day_statistics(db: Session, user_id: int) -> Dict:
        """Get day-level statistics"""
        
        trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None)
        ).all()
        
        if not trades:
            return {
                "total_trading_days": 0,
                "winning_days": 0,
                "losing_days": 0,
                "breakeven_days": 0,
                "day_win_rate": 0,
                "average_day_pnl": 0
            }
        
        # Group by date
        daily_pnl = defaultdict(float)
        for trade in trades:
            date_key = trade.entry_date.date()
            daily_pnl[date_key] += trade.pnl
        
        total_days = len(daily_pnl)
        winning_days = sum(1 for pnl in daily_pnl.values() if pnl > 0)
        losing_days = sum(1 for pnl in daily_pnl.values() if pnl < 0)
        breakeven_days = sum(1 for pnl in daily_pnl.values() if pnl == 0)
        
        total_day_pnl = sum(daily_pnl.values())
        
        return {
            "total_trading_days": total_days,
            "winning_days": winning_days,
            "losing_days": losing_days,
            "breakeven_days": breakeven_days,
            "day_win_rate": round((winning_days / total_days) * 100, 2) if total_days > 0 else 0,
            "average_day_pnl": round(total_day_pnl / total_days, 2) if total_days > 0 else 0
        }
    
    @staticmethod
    def get_calendar_data(db: Session, user_id: int, year: int, month: int) -> Dict:
        """Get calendar-optimized data for specific month"""
        
        # Get start and end of month
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1) - timedelta(days=1)
        
        trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None),
            Trade.entry_date >= start_date,
            Trade.entry_date <= end_date
        ).order_by(Trade.entry_date).all()
        
        # Group by date
        daily_data = defaultdict(lambda: {"pnl": 0, "trades": 0, "wins": 0, "losses": 0})
        for trade in trades:
            date_key = trade.entry_date.date().isoformat()
            daily_data[date_key]["pnl"] += trade.pnl
            daily_data[date_key]["trades"] += 1
            if trade.pnl > 0:
                daily_data[date_key]["wins"] += 1
            else:
                daily_data[date_key]["losses"] += 1
        
        # Calculate monthly summary
        monthly_pnl = sum(d["pnl"] for d in daily_data.values())
        monthly_trades = sum(d["trades"] for d in daily_data.values())
        
        # Format daily data
        days = {}
        for date_str, data in daily_data.items():
            days[date_str] = {
                "pnl": round(data["pnl"], 2),
                "trades": data["trades"],
                "wins": data["wins"],
                "losses": data["losses"],
                "win_rate": round((data["wins"] / data["trades"]) * 100, 2) if data["trades"] > 0 else 0
            }
        
        return {
            "year": year,
            "month": month,
            "monthly_pnl": round(monthly_pnl, 2),
            "monthly_trades": monthly_trades,
            "trading_days": len(daily_data),
            "days": days
        }
    @staticmethod
    def get_trade_distribution(db: Session, user_id: int) -> Dict:
        """Get trade distribution (Long vs Short)"""
        trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None)
        ).all()
        
        dist = {
            "LONG": {"count": 0, "pnl": 0, "wins": 0},
            "SHORT": {"count": 0, "pnl": 0, "wins": 0}
        }
        
        for trade in trades:
            direction = trade.direction.value if hasattr(trade.direction, 'value') else trade.direction
            if direction not in dist:
                continue
                
            dist[direction]["count"] += 1
            dist[direction]["pnl"] += trade.pnl
            if trade.pnl > 0:
                dist[direction]["wins"] += 1
                
        return {
            "long": {
                "count": dist["LONG"]["count"],
                "pnl": round(dist["LONG"]["pnl"], 2),
                "win_rate": round((dist["LONG"]["wins"] / dist["LONG"]["count"] * 100), 2) if dist["LONG"]["count"] > 0 else 0
            },
            "short": {
                "count": dist["SHORT"]["count"],
                "pnl": round(dist["SHORT"]["pnl"], 2),
                "win_rate": round((dist["SHORT"]["wins"] / dist["SHORT"]["count"] * 100), 2) if dist["SHORT"]["count"] > 0 else 0
            }
        }

    @staticmethod
    def get_asset_performance(db: Session, user_id: int) -> Dict:
        """Get performance by asset type"""
        trades = db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.pnl.isnot(None)
        ).all()
        
        assets = defaultdict(lambda: {"count": 0, "pnl": 0, "wins": 0})
        
        for trade in trades:
            asset_type = trade.asset_type or "unknown"
            assets[asset_type]["count"] += 1
            assets[asset_type]["pnl"] += trade.pnl
            if trade.pnl > 0:
                assets[asset_type]["wins"] += 1
                
        result = []
        for asset, data in assets.items():
            result.append({
                "asset_type": asset,
                "count": data["count"],
                "pnl": round(data["pnl"], 2),
                "win_rate": round((data["wins"] / data["count"] * 100), 2) if data["count"] > 0 else 0
            })
            
        return {"assets": result}
