from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID


class BudgetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    period: str = Field(default='monthly', pattern='^(monthly|yearly|custom)$')
    start_date: date
    end_date: Optional[date] = None
    category_id: Optional[UUID] = None
    alert_threshold: Decimal = Field(default=80.0, ge=0, le=100)
    is_love_budget: bool = False
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.strip()
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[date], values: Dict[str, Any]) -> Optional[date]:
        if v and 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class BudgetCreate(BudgetBase):
    """予算作成"""
    partnership_id: Optional[UUID] = None  # 共有予算の場合


class BudgetUpdate(BaseModel):
    """予算更新"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    end_date: Optional[date] = None
    alert_threshold: Optional[Decimal] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None


class Budget(BudgetBase):
    """予算情報"""
    id: UUID
    user_id: UUID
    partnership_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BudgetWithProgress(Budget):
    """進捗情報を含む予算"""
    spent_amount: Decimal = Decimal('0.00')
    remaining_amount: Decimal
    usage_percentage: Decimal
    days_remaining: int
    is_over_budget: bool = False
    is_alert_threshold_reached: bool = False
    
    class Config:
        from_attributes = True


class BudgetSummary(BaseModel):
    """予算サマリー"""
    total_budget: Decimal
    total_spent: Decimal
    total_remaining: Decimal
    overall_usage_percentage: Decimal
    active_budgets_count: int
    over_budget_count: int
    alert_count: int