from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID


class PartnershipBase(BaseModel):
    love_anniversary: Optional[date] = None
    relationship_type: Optional[str] = Field(default='dating', pattern='^(dating|engaged|married)$')


class PartnershipCreate(BaseModel):
    """パートナーシップ作成（招待コード入力）"""
    invitation_code: str = Field(..., min_length=6, max_length=10)
    love_anniversary: Optional[date] = None
    relationship_type: Optional[str] = Field(default='dating', pattern='^(dating|engaged|married)$')


class PartnershipInvite(BaseModel):
    """パートナーシップ招待作成"""
    pass  # 追加のフィールドは不要（現在のユーザーから自動生成）


class PartnershipUpdate(PartnershipBase):
    """パートナーシップ情報更新"""
    pass


class PartnershipInviteResponse(BaseModel):
    """招待レスポンス"""
    invitation_code: str
    expires_at: datetime
    message: str


class Partnership(PartnershipBase):
    """パートナーシップ情報"""
    id: UUID
    user1_id: UUID
    user2_id: UUID
    status: str
    created_at: datetime
    activated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PartnershipWithUsers(Partnership):
    """ユーザー情報を含むパートナーシップ"""
    partner: dict  # SimplifiedUser info
    
    class Config:
        from_attributes = True


class PartnershipStatus(BaseModel):
    """パートナーシップステータス"""
    has_partner: bool
    partnership: Optional[PartnershipWithUsers] = None
    message: str