from typing import Optional, List
from datetime import date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, validator


class RecurringTransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, description="取引金額")
    transaction_type: str = Field(..., description="取引種別（income/expense）")
    sharing_type: str = Field(..., description="共有タイプ（personal/shared）")
    payment_method: Optional[str] = Field(None, description="支払い方法")
    description: Optional[str] = Field(None, description="説明")
    category_id: UUID = Field(..., description="カテゴリID")
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }
    
    # Recurrence settings
    frequency: str = Field(..., description="頻度（daily/weekly/monthly/yearly）")
    interval_value: int = Field(1, ge=1, description="間隔")
    day_of_month: Optional[int] = Field(None, ge=1, le=31, description="実行日（月次の場合）")
    day_of_week: Optional[int] = Field(None, ge=0, le=6, description="実行曜日（週次の場合）")
    
    # Execution settings
    next_execution_date: date = Field(..., description="次回実行日")
    end_date: Optional[date] = Field(None, description="終了日")
    max_executions: Optional[int] = Field(None, ge=1, description="最大実行回数")
    
    @validator('transaction_type')
    def validate_transaction_type(cls, v):
        if v not in ['income', 'expense']:
            raise ValueError('Transaction type must be income or expense')
        return v
    
    @validator('sharing_type')
    def validate_sharing_type(cls, v):
        if v not in ['personal', 'shared']:
            raise ValueError('Sharing type must be personal or shared')
        return v
    
    @validator('frequency')
    def validate_frequency(cls, v):
        if v not in ['daily', 'weekly', 'monthly', 'yearly']:
            raise ValueError('Frequency must be daily, weekly, monthly, or yearly')
        return v
    
    @validator('payment_method')
    def validate_payment_method(cls, v):
        if v and v not in ['cash', 'credit_card', 'bank_transfer', 'digital_wallet']:
            raise ValueError('Invalid payment method')
        return v


class RecurringTransactionCreate(RecurringTransactionBase):
    pass


class RecurringTransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    description: Optional[str] = None
    payment_method: Optional[str] = None
    
    # Recurrence settings (limited updates)
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    next_execution_date: Optional[date] = None
    end_date: Optional[date] = None
    max_executions: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None


class RecurringTransactionInDB(RecurringTransactionBase):
    id: UUID
    user_id: UUID
    last_execution_date: Optional[date] = None
    execution_count: int = 0
    is_active: bool = True
    
    class Config:
        from_attributes = True


class RecurringTransactionResponse(RecurringTransactionInDB):
    category_name: str
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    remaining_executions: Optional[int] = None
    
    @validator('remaining_executions', always=True)
    def calculate_remaining_executions(cls, v, values):
        if 'max_executions' in values and values['max_executions']:
            return values['max_executions'] - values.get('execution_count', 0)
        return None


class RecurringTransactionList(BaseModel):
    recurring_transactions: List[RecurringTransactionResponse]
    total: int