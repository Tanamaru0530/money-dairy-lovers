from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID


class LoveEventBase(BaseModel):
    """Love イベント基本スキーマ"""
    event_type: str = Field(..., pattern='^(anniversary|birthday|valentine|christmas|custom)$')
    name: str = Field(..., min_length=1, max_length=200)
    event_date: date
    is_recurring: bool = True
    recurrence_type: Optional[str] = Field(None, pattern='^(yearly|monthly|custom)$')
    description: Optional[str] = None
    reminder_days: int = Field(default=7, ge=0, le=30)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.strip()


class LoveEventCreate(LoveEventBase):
    """Love イベント作成"""
    pass


class LoveEventUpdate(BaseModel):
    """Love イベント更新"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    event_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    recurrence_type: Optional[str] = Field(None, pattern='^(yearly|monthly|custom)$')
    description: Optional[str] = None
    reminder_days: Optional[int] = Field(None, ge=0, le=30)
    is_active: Optional[bool] = None


class LoveEvent(LoveEventBase):
    """Love イベント情報"""
    id: UUID
    partnership_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LoveEventWithDays(LoveEvent):
    """残り日数を含むLove イベント"""
    days_until: int  # イベントまでの日数（負の場合は過去）
    is_upcoming: bool  # 今後のイベントかどうか
    is_today: bool  # 今日のイベントかどうか


class LoveRatingUpdate(BaseModel):
    """Love評価更新"""
    love_rating: int = Field(..., ge=1, le=5)


class LoveStats(BaseModel):
    """Love統計情報"""
    total_love_transactions: int
    average_love_rating: float
    total_love_spending: Decimal
    love_spending_percentage: Decimal
    most_love_day: Optional[date] = None
    most_love_category: Optional[str] = None
    love_streak: int  # 連続Love記録日数
    love_events_count: int
    upcoming_events_count: int


class LoveTrend(BaseModel):
    """Love傾向分析"""
    period: str  # daily, weekly, monthly
    trends: List[Dict[str, Any]]
    peak_love_period: Optional[str] = None
    love_growth_rate: Decimal  # Love支出の成長率


class LoveMemory(BaseModel):
    """Love思い出"""
    transaction_id: UUID
    date: date
    amount: Decimal
    description: str
    category_name: str
    category_icon: str
    love_rating: int
    image_url: Optional[str] = None


class LoveCalendar(BaseModel):
    """Loveカレンダー"""
    year: int
    month: int
    love_days: List[Dict[str, Any]]  # 日付とLove情報
    events: List[LoveEventWithDays]
    total_love_days: int
    total_love_amount: Decimal


# Love Memory スキーマ（独立したメモリー機能用）
class LoveMemoryCreate(BaseModel):
    """Love メモリー作成用スキーマ"""
    title: str
    description: str
    event_id: Optional[UUID] = None
    transaction_id: Optional[UUID] = None


class LoveMemoryUpdate(BaseModel):
    """Love メモリー更新用スキーマ"""
    title: Optional[str] = None
    description: Optional[str] = None
    event_id: Optional[UUID] = None
    transaction_id: Optional[UUID] = None


class LoveMemoryResponse(BaseModel):
    """Love メモリーレスポンス用スキーマ"""
    id: UUID
    partnership_id: UUID
    title: str
    description: str
    event_id: Optional[UUID] = None
    transaction_id: Optional[UUID] = None
    photos: List[str] = []  # 写真URLのリスト
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LoveGoalBase(BaseModel):
    """Love Goal基本スキーマ"""
    name: str = Field(..., min_length=1, max_length=200)
    amount: Decimal = Field(..., gt=0)
    period: str = Field(default='monthly', pattern='^(monthly|yearly|custom)$')
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None  # 特定のLoveカテゴリに関連付ける場合
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.strip()


class LoveGoalCreate(LoveGoalBase):
    """Love Goal作成"""
    pass


class LoveGoalUpdate(BaseModel):
    """Love Goal更新"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[Decimal] = Field(None, gt=0)
    end_date: Optional[date] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class LoveGoal(LoveGoalBase):
    """Love Goal情報"""
    id: UUID
    user_id: UUID
    partnership_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LoveGoalWithProgress(LoveGoal):
    """進捗情報付きLove Goal"""
    spent_amount: Decimal = Field(default=Decimal('0'))
    progress_percentage: Decimal = Field(default=Decimal('0'))
    remaining_amount: Decimal = Field(default=Decimal('0'))
    days_remaining: Optional[int] = None
    is_achieved: bool = False
    transaction_count: int = 0