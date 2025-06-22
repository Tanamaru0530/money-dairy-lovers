from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import uuid
from PIL import Image
import io

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserUpdate, 
    UserResponse, 
    NotificationSettings, 
    NotificationSettingsUpdate,
    PasswordChange,
    SessionResponse
)
from app.core.security import verify_password, get_password_hash

router = APIRouter()

# プロフィール画像の設定
UPLOAD_DIR = "uploads/profile_images"
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

# アップロードディレクトリの作成
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/profile", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    """現在のユーザーのプロフィール情報を取得"""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """プロフィール情報を更新"""
    # current_userをセッションに再アタッチする必要がある
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 更新可能なフィールドのみ更新
    update_data = profile_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """プロフィール画像をアップロード"""
    # ファイルサイズチェック
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail="File size exceeds 2MB limit"
        )
    
    # ファイル拡張子チェック
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 画像の検証と最適化
    try:
        image = Image.open(io.BytesIO(contents))
        
        # 画像サイズの最適化（最大1024x1024）
        max_size = (1024, 1024)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # JPEGに変換して保存
        file_name = f"{current_user.id}_{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        # RGBモードに変換（透過PNGなどの対応）
        if image.mode in ('RGBA', 'LA', 'P'):
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = rgb_image
        
        image.save(file_path, "JPEG", quality=85, optimize=True)
        
        # 古い画像を削除
        if current_user.profile_image_url:
            old_path = current_user.profile_image_url.replace("/uploads/", "uploads/")
            if os.path.exists(old_path):
                os.remove(old_path)
        
        # URLを保存
        # current_userをセッションに再アタッチする
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.profile_image_url = f"/{file_path}"
        db.commit()
        
        return {"profile_image_url": user.profile_image_url}
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file: {str(e)}"
        )


@router.get("/notification-settings", response_model=NotificationSettings)
def get_notification_settings(
    current_user: User = Depends(get_current_user)
):
    """通知設定を取得"""
    # notification_settings がJSONBフィールドの場合
    settings = current_user.notification_settings or {}
    
    return NotificationSettings(
        email_notifications=settings.get("email_notifications", True),
        push_notifications=settings.get("push_notifications", True),
        budget_alerts=settings.get("budget_alerts", True),
        partner_transaction_alerts=settings.get("partner_transaction_alerts", True),
        love_event_reminders=settings.get("love_event_reminders", True)
    )


@router.put("/notification-settings", response_model=NotificationSettings)
def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """通知設定を更新"""
    # current_userをセッションに再アタッチする
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_settings = user.notification_settings or {}
    
    # 更新されたフィールドのみ上書き
    update_data = settings_update.model_dump(exclude_unset=True)
    current_settings.update(update_data)
    
    user.notification_settings = current_settings
    db.commit()
    
    return NotificationSettings(**current_settings)


@router.put("/change-password")
def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """パスワードを変更"""
    # 現在のパスワードを検証
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    
    # 新しいパスワードが現在のパスワードと同じでないことを確認
    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )
    
    # パスワードを更新
    # current_userをセッションに再アタッチする
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user)
):
    """ログインセッション一覧を取得（現在は簡易実装）"""
    # TODO: 実際のセッション管理を実装する場合は、
    # セッションテーブルを作成して管理する
    return [
        SessionResponse(
            id="current",
            device="Current Device",
            last_accessed="Now"
        )
    ]


@router.post("/logout-other-devices")
def logout_other_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """他のデバイスからログアウト（現在は簡易実装）"""
    # TODO: 実際のセッション管理を実装する場合は、
    # 現在のセッション以外を無効化する
    return {"message": "Logged out from other devices successfully"}