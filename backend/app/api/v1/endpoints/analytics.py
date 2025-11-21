# analytics endpoint
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.analytics_service import AnalyticsService
from datetime import datetime
from typing import Optional

router = APIRouter()

def get_current_user_id():
    return 1

@router.get("/performance")
def get_performance_metrics(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get performance analytics"""
    return AnalyticsService.get_performance_metrics(db, user_id)

@router.get("/daily-pnl")
def get_daily_pnl(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get daily P&L aggregation"""
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    return AnalyticsService.get_daily_pnl(db, user_id, start_dt, end_dt)

@router.get("/cumulative-pnl")
def get_cumulative_pnl(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get cumulative P&L time series"""
    return AnalyticsService.get_cumulative_pnl(db, user_id)

@router.get("/streaks")
def get_streaks(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get current winning/losing streaks"""
    return AnalyticsService.calculate_streaks(db, user_id)

@router.get("/drawdown")
def get_drawdown(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get drawdown metrics"""
    return AnalyticsService.calculate_drawdown(db, user_id)

@router.get("/day-stats")
def get_day_statistics(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get day-level statistics"""
    return AnalyticsService.get_day_statistics(db, user_id)

@router.get("/calendar/{year}/{month}")
def get_calendar_data(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get calendar-optimized data for specific month"""
    if month < 1 or month > 12:
        return {"error": "Month must be between 1 and 12"}
    return AnalyticsService.get_calendar_data(db, user_id, year, month)
