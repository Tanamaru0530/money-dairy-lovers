from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from uuid import UUID
import re


class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    profile_image_url: Optional[str] = None
    love_theme_preference: Optional[str] = 'default'
    notification_settings: Optional[Dict[str, Any]] = None


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    @field_validator('display_name')
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError('Display name must be at least 2 characters long')
        if len(v) > 100:
            raise ValueError('Display name must not exceed 100 characters')
        return v.strip()


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    love_theme_preference: Optional[str] = None
    notification_settings: Optional[Dict[str, Any]] = None


class UserInDBBase(UserBase):
    id: UUID
    is_active: bool
    email_verified: bool
    love_theme_preference: str
    notification_settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    display_name: str
    profile_image_url: Optional[str] = None
    love_theme_preference: str
    is_active: bool
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat() if v else None
        }


class NotificationSettings(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    budget_alerts: bool = True
    partner_transaction_alerts: bool = True
    love_event_reminders: bool = True


class NotificationSettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    budget_alerts: Optional[bool] = None
    partner_transaction_alerts: Optional[bool] = None
    love_event_reminders: Optional[bool] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v


class SessionResponse(BaseModel):
    id: str
    device: str
    last_accessed: str


class UserWithPartnership(User):
    """User with partnership information"""
    has_partner: bool = False
    partnership: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True