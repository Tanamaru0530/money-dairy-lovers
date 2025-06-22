from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
import re


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern='^#[0-9A-Fa-f]{6}$')
    sort_order: Optional[int] = Field(default=0)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.strip()
    
    @field_validator('color')
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError('Color must be a valid hex color code (e.g., #FF6B6B)')
        return v.upper()


class CategoryCreate(CategoryBase):
    """カテゴリ作成"""
    pass


class CategoryUpdate(BaseModel):
    """カテゴリ更新"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern='^#[0-9A-Fa-f]{6}$')
    sort_order: Optional[int] = None


class Category(CategoryBase):
    """カテゴリ情報"""
    id: UUID
    is_default: bool
    is_love_category: bool
    user_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CategoryWithStats(Category):
    """統計情報を含むカテゴリ"""
    transaction_count: int = 0
    total_amount: float = 0.0
    
    class Config:
        from_attributes = True


class CategoryResponse(Category):
    """カテゴリレスポンス"""
    pass