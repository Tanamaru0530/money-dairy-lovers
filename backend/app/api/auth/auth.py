from datetime import timedelta, datetime
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import ValidationError
import secrets
import string
import logging

from app import schemas, models
from app.core import security
from app.core.config import settings
from app.core.deps import get_db, get_current_user
from app.utils.email import email_sender
from app.utils.rate_limiter import limiter, RateLimits

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=schemas.User)
@limiter.limit(RateLimits.AUTH_REGISTER)
def register(
    request: Request,
    *,
    user_in: schemas.UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register new user.
    """
    # Check if user already exists
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Create new user
    user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        display_name=user_in.display_name,
        profile_image_url=user_in.profile_image_url,
        love_theme_preference=user_in.love_theme_preference or 'default',
        notification_settings=user_in.notification_settings or {"email": True, "push": True}
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # メール確認コードを生成して送信
    verification_code = generate_verification_code()
    email_verification = models.EmailVerification(
        user_id=user.id,
        code=verification_code,
        expires_at=datetime.utcnow() + timedelta(minutes=30)
    )
    db.add(email_verification)
    db.commit()
    
    # メール送信設定がある場合のみメール送信
    if settings.SMTP_HOST:
        background_tasks.add_task(
            email_sender.send_verification_email,
            user.email,
            verification_code
        )
    else:
        # 開発環境でのコード確認（セキュリティ強化: メールをマスク、本番では無効化）
        if settings.ENVIRONMENT == "development":
            masked_email = f"{user.email[:1]}***@{user.email.split('@')[1]}" if '@' in user.email else "***"
            logger.info(f"[DEV ONLY] Email verification code for {masked_email}: {verification_code}")
        else:
            logger.info("Email verification code generated (code not logged in production)")
    
    return user


@router.post("/login", response_model=schemas.auth.LoginResponse)
@limiter.limit(RateLimits.AUTH_LOGIN)
def login(
    request: Request,
    login_data: schemas.auth.LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Token login, get an access token for future requests.
    """
    # セキュリティ強化: メールアドレスをマスクしてログ出力
    masked_email = f"{login_data.email[:1]}***@{login_data.email.split('@')[1]}" if '@' in login_data.email else "***"
    logger.info(f"Login attempt for email: {masked_email}")
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = security.create_access_token(user.id)
    refresh_token = security.create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "profile_image_url": user.profile_image_url,
            "love_theme_preference": user.love_theme_preference,
            "is_active": user.is_active,
            "email_verified": user.email_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
    }


@router.post("/refresh", response_model=schemas.auth.AuthResponse)
@limiter.limit(RateLimits.AUTH_REFRESH)
def refresh_token(
    request: Request,
    *,
    refresh_request: schemas.auth.TokenRefreshRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Refresh access token using refresh token.
    """
    try:
        payload = jwt.decode(
            refresh_request.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if token_data.type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(models.User).filter(models.User.id == token_data.sub).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = security.create_access_token(user.id)
    new_refresh_token = security.create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "profile_image_url": user.profile_image_url,
            "love_theme_preference": user.love_theme_preference,
            "is_active": user.is_active,
            "email_verified": user.email_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
    }


@router.post("/logout")
def logout(
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Logout user (client should remove tokens).
    """
    # In a production app, you might want to blacklist the token here
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=schemas.UserWithPartnership)
def read_users_me(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get current user with partnership information.
    """
    # パートナーシップ情報を取得
    from app.api.partnerships.partnerships import get_user_partnership
    partnership = get_user_partnership(db, current_user.id)
    
    # ユーザー情報をdictに変換
    user_dict = {
        "id": str(current_user.id),
        "email": current_user.email,
        "display_name": current_user.display_name,
        "profile_image_url": current_user.profile_image_url,
        "love_theme_preference": current_user.love_theme_preference,
        "is_active": current_user.is_active,
        "email_verified": current_user.email_verified,
        "notification_settings": current_user.notification_settings,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "has_partner": partnership is not None,
        "partnership": None
    }
    
    if partnership:
        # パートナー情報を取得
        partner_id = partnership.user2_id if partnership.user1_id == current_user.id else partnership.user1_id
        partner = db.query(models.User).filter(models.User.id == partner_id).first()
        
        if partner:
            user_dict["partnership"] = {
                "id": str(partnership.id),
                "partner": {
                    "id": str(partner.id),
                    "display_name": partner.display_name,
                    "email": partner.email,
                    "profile_image_url": partner.profile_image_url
                },
                "status": partnership.status,
                "love_anniversary": partnership.love_anniversary.isoformat() if partnership.love_anniversary else None,
                "relationship_type": partnership.relationship_type,
                "created_at": partnership.created_at.isoformat() if partnership.created_at else None,
                "activated_at": partnership.activated_at.isoformat() if partnership.activated_at else None
            }
    
    return user_dict


def generate_verification_code() -> str:
    """メールアドレス確認用の6桁コードを生成"""
    # 開発環境では固定コードを使用
    if settings.ENVIRONMENT == "development" and not settings.SMTP_HOST:
        return "123456"
    # 本番環境ではランダムな6桁コードを生成
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def generate_reset_token() -> str:
    """パスワードリセット用のトークンを生成"""
    return secrets.token_urlsafe(32)


@router.post("/verify-email/request", response_model=schemas.auth.EmailVerificationResponse)
def request_email_verification(
    *,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Request email verification code.
    """
    if current_user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified"
        )
    
    # 既存の未使用の確認コードを削除
    db.query(models.EmailVerification).filter(
        models.EmailVerification.user_id == current_user.id,
        models.EmailVerification.verified_at.is_(None)
    ).delete()
    
    # 新しい確認コードを生成
    verification_code = generate_verification_code()
    email_verification = models.EmailVerification(
        user_id=current_user.id,
        code=verification_code,
        expires_at=datetime.utcnow() + timedelta(minutes=30)
    )
    db.add(email_verification)
    db.commit()
    
    # バックグラウンドでメール送信
    background_tasks.add_task(
        email_sender.send_verification_email,
        current_user.email,
        verification_code
    )
    
    return {
        "message": "Verification code sent to your email",
        "verified": False
    }


@router.post("/verify-email/confirm", response_model=schemas.auth.EmailVerificationResponse)
def confirm_email_verification(
    *,
    verification_data: schemas.auth.EmailVerificationConfirm,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Confirm email with verification code.
    """
    if current_user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified"
        )
    
    # 確認コードを検証
    email_verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.user_id == current_user.id,
        models.EmailVerification.code == verification_data.code,
        models.EmailVerification.verified_at.is_(None),
        models.EmailVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not email_verification:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code"
        )
    
    # メールアドレスを確認済みに更新
    email_verification.verified_at = datetime.utcnow()
    current_user.email_verified = True
    db.commit()
    
    return {
        "message": "Email verified successfully",
        "verified": True
    }


@router.post("/password-reset/request", response_model=schemas.auth.PasswordResetResponse)
@limiter.limit(RateLimits.AUTH_PASSWORD_RESET)
def request_password_reset(
    request: Request,
    *,
    reset_request: schemas.auth.PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Any:
    """
    Request password reset.
    """
    user = db.query(models.User).filter(
        models.User.email == reset_request.email
    ).first()
    
    # ユーザーが存在しない場合でも、セキュリティのため同じレスポンスを返す
    if not user:
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # 既存の未使用のリセットトークンを削除
    db.query(models.PasswordReset).filter(
        models.PasswordReset.user_id == user.id,
        models.PasswordReset.used.is_(None)
    ).delete()
    
    # 新しいリセットトークンを生成
    reset_token = generate_reset_token()
    password_reset = models.PasswordReset(
        user_id=user.id,
        token=reset_token,
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.add(password_reset)
    db.commit()
    
    # リセットURLを生成
    reset_url = f"{settings.FRONTEND_URL}/password-reset?token={reset_token}"
    
    # バックグラウンドでメール送信
    background_tasks.add_task(
        email_sender.send_password_reset_email,
        user.email,
        reset_url
    )
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/password-reset/confirm", response_model=schemas.auth.PasswordResetResponse)
def confirm_password_reset(
    *,
    reset_data: schemas.auth.PasswordResetConfirm,
    db: Session = Depends(get_db)
) -> Any:
    """
    Reset password with token.
    """
    # パスワードのバリデーション
    try:
        schemas.UserCreate.validate_password(reset_data.new_password)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    
    # トークンを検証
    password_reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.token == reset_data.token,
        models.PasswordReset.used.is_(None),
        models.PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not password_reset:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    # ユーザーのパスワードを更新
    user = db.query(models.User).filter(
        models.User.id == password_reset.user_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    user.hashed_password = security.get_password_hash(reset_data.new_password)
    password_reset.used = datetime.utcnow()
    db.commit()
    
    return {"message": "Password reset successfully"}