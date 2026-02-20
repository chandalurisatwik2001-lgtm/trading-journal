# user model
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float, Enum
import enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AuthProvider(enum.Enum):
    EMAIL = "email"
    GOOGLE = "google"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Optional for OAuth users
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # OAuth fields
    google_id = Column(String, unique=True, nullable=True, index=True)
    profile_picture = Column(String, nullable=True)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.EMAIL, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trades = relationship("Trade", back_populates="user")
    onboarding = relationship("UserOnboarding", back_populates="user", uselist=False)
    exchanges = relationship("ExchangeConnection", back_populates="user")
    wallets = relationship("Wallet", back_populates="user")
    sim_positions = relationship("SimPosition", back_populates="user")

class UserOnboarding(Base):
    __tablename__ = "user_onboarding"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    trading_experience = Column(String, nullable=True)
    goals = Column(String, nullable=True) # JSON string
    broker = Column(String, nullable=True)
    initial_balance = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    trading_assets = Column(String, nullable=True) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="onboarding")
