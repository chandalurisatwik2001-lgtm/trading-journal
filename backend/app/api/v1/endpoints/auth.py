from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import hashlib
import json

from app.core.database import get_db
from app.models import User, UserOnboarding

router = APIRouter()

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

# JWT settings
SECRET_KEY = "your-secret-key-change-this-in-production-make-it-long-and-random"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models (keep all your existing models)
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        if len(v) > 72:
            raise ValueError('Password cannot be longer than 72 characters')
        return v

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(v) > 50:
            raise ValueError('Username cannot be longer than 50 characters')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class OnboardingData(BaseModel):
    tradingExperience: Optional[str] = None
    goals: Optional[list[str]] = None
    broker: Optional[str] = None
    tradingAssets: Optional[list[str]] = None

# Helper functions (keep your existing ones)
def _prepare_password(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        prepared_password = _prepare_password(plain_password)
        return pwd_context.verify(prepared_password, hashed_password)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False

def get_password_hash(password: str) -> str:
    try:
        prepared_password = _prepare_password(password)
        return pwd_context.hash(prepared_password)
    except Exception as e:
        print(f"Error hashing password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing password"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Database-integrated endpoints
@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        email=user.email.lower(),
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=new_user.id,
            email=new_user.email,
            username=new_user.username,
            full_name=new_user.full_name
        )
    }

@router.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password"""
    
    # Find user by email
    db_user = db.query(User).filter(User.email == user.email.lower()).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered. Please sign up first.",
        )
    
    # Verify password
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            full_name=db_user.full_name
        )
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user"""
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
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name
    )

@router.get("/check-email")
async def check_email_availability(email: str, db: Session = Depends(get_db)):
    """Check if email is available for registration"""
    existing_user = db.query(User).filter(User.email == email.lower()).first()
    return {"available": existing_user is None}

@router.get("/check-username")
async def check_username_availability(username: str, db: Session = Depends(get_db)):
    """Check if username is available for registration"""
    existing_user = db.query(User).filter(User.username == username).first()
    return {"available": existing_user is None}

@router.post("/users/onboarding", status_code=status.HTTP_200_OK)
async def save_onboarding(
    data: OnboardingData,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Save user onboarding data"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if onboarding data already exists
        onboarding = db.query(UserOnboarding).filter(UserOnboarding.user_id == user.id).first()
        
        if onboarding:
            # Update existing
            onboarding.trading_experience = data.tradingExperience
            onboarding.goals = json.dumps(data.goals) if data.goals else None
            onboarding.broker = data.broker
            onboarding.trading_assets = json.dumps(data.tradingAssets) if data.tradingAssets else None
            onboarding.updated_at = datetime.utcnow()
        else:
            # Create new
            onboarding = UserOnboarding(
                user_id=user.id,
                trading_experience=data.tradingExperience,
                goals=json.dumps(data.goals) if data.goals else None,
                broker=data.broker,
                trading_assets=json.dumps(data.tradingAssets) if data.tradingAssets else None
            )
            db.add(onboarding)
        
        db.commit()
        return {"message": "Onboarding data saved successfully"}
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/users/onboarding")
async def get_onboarding(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get user onboarding data"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        onboarding = db.query(UserOnboarding).filter(UserOnboarding.user_id == user.id).first()
        
        if not onboarding:
            return {}
        
        return {
            "tradingExperience": onboarding.trading_experience,
            "goals": json.loads(onboarding.goals) if onboarding.goals else None,
            "broker": onboarding.broker,
            "tradingAssets": json.loads(onboarding.trading_assets) if onboarding.trading_assets else None
        }
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
