# user schema
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Onboarding Schemas
class UserOnboardingBase(BaseModel):
    trading_experience: Optional[str] = None
    goals: Optional[list[str]] = None
    broker: Optional[str] = None
    initial_balance: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    trading_assets: Optional[list[str]] = None

class UserOnboardingUpdate(UserOnboardingBase):
    pass

class UserOnboardingResponse(UserOnboardingBase):
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
