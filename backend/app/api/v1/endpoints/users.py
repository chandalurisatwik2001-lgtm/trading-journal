from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserOnboarding
from app.schemas.user import UserOnboardingUpdate, UserOnboardingResponse
import json

router = APIRouter()
@router.get("/me/onboarding", response_model=UserOnboardingResponse)
def get_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    onboarding = db.query(UserOnboarding).filter(UserOnboarding.user_id == current_user.id).first()
    if not onboarding:
        # Return empty default
        return {
            "user_id": current_user.id,
            "trading_experience": None,
            "goals": [],
            "broker": None,
            "initial_balance": 0.0,
            "currency": "USD",
            "trading_assets": []
        }
        
    # Convert back to list for response
    response_data = onboarding.__dict__.copy()
    if response_data.get('goals'):
        try:
            response_data['goals'] = json.loads(response_data['goals'])
        except:
            response_data['goals'] = []
            
    if response_data.get('trading_assets'):
        try:
            response_data['trading_assets'] = json.loads(response_data['trading_assets'])
        except:
            response_data['trading_assets'] = []
            
    return response_data
@router.put("/me/onboarding", response_model=UserOnboardingResponse)
def update_onboarding(
    onboarding_in: UserOnboardingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if onboarding record exists
    onboarding = db.query(UserOnboarding).filter(UserOnboarding.user_id == current_user.id).first()
    
    # Prepare data
    data = onboarding_in.dict(exclude_unset=True)
    
    # Convert lists to JSON strings
    if 'goals' in data and data['goals'] is not None:
        data['goals'] = json.dumps(data['goals'])
    if 'trading_assets' in data and data['trading_assets'] is not None:
        data['trading_assets'] = json.dumps(data['trading_assets'])
        
    if not onboarding:
        # Create new record
        onboarding = UserOnboarding(user_id=current_user.id, **data)
        db.add(onboarding)
    else:
        # Update existing
        for field, value in data.items():
            setattr(onboarding, field, value)
            
    db.commit()
    db.refresh(onboarding)
    
    # Convert back to list for response
    response_data = onboarding.__dict__.copy()
    if response_data.get('goals'):
        try:
            response_data['goals'] = json.loads(response_data['goals'])
        except:
            response_data['goals'] = []
            
    if response_data.get('trading_assets'):
        try:
            response_data['trading_assets'] = json.loads(response_data['trading_assets'])
        except:
            response_data['trading_assets'] = []
            
    return response_data
