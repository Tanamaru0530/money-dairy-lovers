from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID


# Password Reset Schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class PasswordResetResponse(BaseModel):
    message: str


# Email Verification Schemas
class EmailVerificationRequest(BaseModel):
    email: EmailStr


class EmailVerificationConfirm(BaseModel):
    code: str


class EmailVerificationResponse(BaseModel):
    message: str
    verified: bool


# Token Refresh Schema
class TokenRefreshRequest(BaseModel):
    refresh_token: str


# Login Schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Auth Response Schemas
class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict