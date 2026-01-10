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
import uuid

from app.core.database import get_db
from app.models import User, UserOnboarding, PasswordResetToken
from app.services.email_service import send_password_reset_email

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

# Password Reset Endpoints

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        if len(v) > 72:
            raise ValueError('Password cannot be longer than 72 characters')
        return v

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a password reset token"""
    
    # Find user by email
    user = db.query(User).filter(User.email == request.email.lower()).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Generate unique reset token
    reset_token = str(uuid.uuid4())
    
    # Set expiration to 1 hour from now
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Create password reset token record
    db_token = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    
    # Get frontend URL from environment variable or use production URL
    import os
    frontend_url = os.environ.get('FRONTEND_URL', 'https://tradingjournal-liard.vercel.app')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Send password reset email
    send_password_reset_email(
        to_email=user.email,
        reset_link=reset_link,
        expires_at=str(expires_at)
    )
    
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/verify-reset-token", status_code=status.HTTP_200_OK)
async def verify_reset_token(token: str, db: Session = Depends(get_db)):
    """Verify if a reset token is valid"""
    
    db_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"valid": True}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid token"""
    
    # Find valid token
    db_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Find user
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    user.updated_at = datetime.utcnow()
    
    # Mark token as used
    db_token.used = True
    
    db.commit()
    
    print(f"\n✓ Password successfully reset for user: {user.email}\n")
    
    return {"message": "Password has been reset successfully"}


# Google OAuth Models
class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token

class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/google-auth", response_model=GoogleAuthResponse, status_code=status.HTTP_200_OK)
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with Google OAuth.
    Creates new user if doesn't exist, logs in existing user.
    """
    from app.services.google_oauth import verify_google_token
    from app.models.user import AuthProvider
    
    try:
        # Verify Google token and get user info
        google_user = verify_google_token(request.credential)
        
        print(f"🔍 Google OAuth attempt for: {google_user['email']}")
        
        # Check if user exists by email
        user = db.query(User).filter(User.email == google_user['email'].lower()).first()
        
        if user:
            # Existing user - update Google info if needed
            print(f"✓ Existing user found: {user.email}")
            
            if not user.google_id:
                user.google_id = google_user['google_id']
                user.profile_picture = google_user['picture']
                user.auth_provider = AuthProvider.GOOGLE
                user.updated_at = datetime.utcnow()
                db.commit()
                print(f"✓ Updated user with Google OAuth info")
        else:
            # New user - create account
            print(f"📝 Creating new user from Google OAuth")
            
            # Generate username from email
            username = google_user['email'].split('@')[0]
            base_username = username
            counter = 1
            
            # Ensure unique username
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User(
                email=google_user['email'].lower(),
                username=username,
                full_name=google_user['name'],
                google_id=google_user['google_id'],
                profile_picture=google_user['picture'],
                auth_provider=AuthProvider.GOOGLE,
                hashed_password=None,  # No password for OAuth users initially
                is_active=True
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            print(f"✅ New user created: {user.email}")
        
        # Generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "profile_picture": user.profile_picture,
                "auth_provider": user.auth_provider.value if user.auth_provider else "email"
            }
        }
        
    except ValueError as e:
        print(f"❌ Google OAuth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google credentials: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Unexpected error in Google OAuth: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during Google authentication"
        )
