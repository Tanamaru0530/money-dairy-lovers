from datetime import datetime, timedelta
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import secrets
import string

from app import schemas, models
from app.core.deps import get_db, get_current_user
from app.schemas.partnership import (
    PartnershipCreate,
    PartnershipInvite,
    PartnershipUpdate,
    PartnershipInviteResponse,
    PartnershipWithUsers,
    PartnershipStatus
)
from uuid import UUID

router = APIRouter()


def generate_invitation_code() -> str:
    """6文字の招待コードを生成"""
    # 読みやすくするため、紛らわしい文字を除外（0,O,I,l）
    alphabet = string.ascii_uppercase.replace('O', '').replace('I', '')
    digits = string.digits.replace('0', '')
    characters = alphabet + digits
    return ''.join(secrets.choice(characters) for _ in range(6))


def get_user_partnership(db: Session, user_id: UUID) -> Optional[models.Partnership]:
    """ユーザーの有効なパートナーシップを取得"""
    return db.query(models.Partnership).filter(
        and_(
            or_(
                models.Partnership.user1_id == user_id,
                models.Partnership.user2_id == user_id
            ),
            models.Partnership.status == 'active'
        )
    ).first()


@router.get("/status", response_model=PartnershipStatus)
def get_partnership_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    現在のパートナーシップステータスを取得
    """
    partnership = get_user_partnership(db, current_user.id)
    
    if not partnership:
        return {
            "has_partner": False,
            "partnership": None,
            "message": "パートナーが設定されていません"
        }
    
    # パートナーの情報を取得
    partner_id = partnership.user2_id if partnership.user1_id == current_user.id else partnership.user1_id
    partner = db.query(models.User).filter(models.User.id == partner_id).first()
    
    if not partner:
        return {
            "has_partner": False,
            "partnership": None,
            "message": "パートナー情報が見つかりません"
        }
    
    partnership_dict = {
        "id": partnership.id,
        "user1_id": partnership.user1_id,
        "user2_id": partnership.user2_id,
        "status": partnership.status,
        "love_anniversary": partnership.love_anniversary,
        "relationship_type": partnership.relationship_type,
        "created_at": partnership.created_at,
        "activated_at": partnership.activated_at,
        "partner": {
            "id": partner.id,
            "display_name": partner.display_name,
            "email": partner.email,
            "profile_image_url": partner.profile_image_url
        }
    }
    
    return {
        "has_partner": True,
        "partnership": partnership_dict,
        "message": f"{partner.display_name}さんとパートナーです💕"
    }


@router.post("/invite", response_model=PartnershipInviteResponse)
def create_partnership_invitation(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    パートナーシップの招待を作成
    """
    # 既存のアクティブなパートナーシップをチェック
    existing_partnership = get_user_partnership(db, current_user.id)
    if existing_partnership:
        raise HTTPException(
            status_code=400,
            detail="既にパートナーが設定されています"
        )
    
    # 既存のペンディング招待を削除
    db.query(models.PartnershipInvitation).filter(
        models.PartnershipInvitation.inviter_id == current_user.id
    ).delete()
    
    # 新しい招待を作成
    invitation_code = generate_invitation_code()
    expires_at = datetime.utcnow() + timedelta(hours=48)
    
    invitation = models.PartnershipInvitation(
        inviter_id=current_user.id,
        invitation_code=invitation_code,
        expires_at=expires_at
    )
    
    db.add(invitation)
    db.commit()
    
    return {
        "invitation_code": invitation_code,
        "expires_at": expires_at,
        "message": "招待コードを作成しました。パートナーに共有してください💕"
    }


@router.post("/join", response_model=PartnershipWithUsers)
def join_partnership(
    *,
    db: Session = Depends(get_db),
    invitation_data: PartnershipCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    招待コードを使用してパートナーシップに参加
    """
    # 既存のアクティブなパートナーシップをチェック
    existing_partnership = get_user_partnership(db, current_user.id)
    if existing_partnership:
        raise HTTPException(
            status_code=400,
            detail="既にパートナーが設定されています"
        )
    
    # 招待コードで招待を検索
    invitation = db.query(models.PartnershipInvitation).filter(
        and_(
            models.PartnershipInvitation.invitation_code == invitation_data.invitation_code.upper(),
            models.PartnershipInvitation.expires_at > datetime.utcnow()
        )
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=400,
            detail="無効または期限切れの招待コードです"
        )
    
    # 自分自身の招待コードには参加できない
    if invitation.inviter_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="自分自身の招待コードには参加できません"
        )
    
    # 新しいパートナーシップを作成
    partnership = models.Partnership(
        user1_id=invitation.inviter_id,
        user2_id=current_user.id,
        status='active',
        activated_at=datetime.utcnow(),
        love_anniversary=invitation_data.love_anniversary,
        relationship_type=invitation_data.relationship_type or 'dating'
    )
    
    db.add(partnership)
    db.delete(invitation)  # 使用済みの招待を削除
    db.commit()
    db.refresh(partnership)
    
    # パートナーの情報を取得
    partner = db.query(models.User).filter(models.User.id == invitation.inviter_id).first()
    
    partnership_dict = {
        "id": partnership.id,
        "user1_id": partnership.user1_id,
        "user2_id": partnership.user2_id,
        "status": partnership.status,
        "love_anniversary": partnership.love_anniversary,
        "relationship_type": partnership.relationship_type,
        "created_at": partnership.created_at,
        "activated_at": partnership.activated_at,
        "partner": {
            "id": partner.id,
            "display_name": partner.display_name,
            "email": partner.email,
            "profile_image_url": partner.profile_image_url
        }
    }
    
    return partnership_dict


@router.put("/", response_model=PartnershipWithUsers)
def update_partnership(
    *,
    db: Session = Depends(get_db),
    partnership_update: PartnershipUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    パートナーシップ情報を更新
    """
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        raise HTTPException(
            status_code=404,
            detail="パートナーシップが見つかりません"
        )
    
    # 更新
    update_data = partnership_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(partnership, field, value)
    
    db.commit()
    db.refresh(partnership)
    
    # パートナーの情報を取得
    partner_id = partnership.user2_id if partnership.user1_id == current_user.id else partnership.user1_id
    partner = db.query(models.User).filter(models.User.id == partner_id).first()
    
    partnership_dict = {
        "id": partnership.id,
        "user1_id": partnership.user1_id,
        "user2_id": partnership.user2_id,
        "status": partnership.status,
        "love_anniversary": partnership.love_anniversary,
        "relationship_type": partnership.relationship_type,
        "created_at": partnership.created_at,
        "activated_at": partnership.activated_at,
        "partner": {
            "id": partner.id,
            "display_name": partner.display_name,
            "email": partner.email,
            "profile_image_url": partner.profile_image_url
        }
    }
    
    return partnership_dict


@router.delete("/")
def delete_partnership(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    パートナーシップを解除
    """
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        raise HTTPException(
            status_code=404,
            detail="パートナーシップが見つかりません"
        )
    
    # ステータスを無効に変更（履歴として残す）
    partnership.status = 'inactive'
    db.commit()
    
    return {"message": "パートナーシップを解除しました"}