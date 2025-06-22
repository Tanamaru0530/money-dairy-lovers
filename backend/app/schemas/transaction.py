from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID


class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2, max_digits=12)
    transaction_type: str = Field(..., pattern='^(income|expense)$')
    sharing_type: str = Field(..., pattern='^(personal|shared)$')
    category_id: UUID
    transaction_date: date
    payment_method: Optional[str] = Field(None, pattern='^(cash|credit_card|bank_transfer|digital_wallet)$')
    description: Optional[str] = Field(None, max_length=500)
    love_rating: Optional[int] = Field(None, ge=1, le=5)
    tags: Optional[List[str]] = Field(default_factory=list, max_items=10)
    location: Optional[str] = Field(None, max_length=200)
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v


class SharedTransactionInfo(BaseModel):
    split_type: str = Field(default='equal', pattern='^(equal|amount|percentage)$')
    user1_amount: Optional[Decimal] = Field(None, ge=0)
    user2_amount: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=500)


class TransactionCreate(TransactionBase):
    """取引作成"""
    shared_info: Optional[SharedTransactionInfo] = None
    receipt_image: Optional[str] = None  # Base64 encoded image


class TransactionUpdate(BaseModel):
    """取引更新"""
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    category_id: Optional[UUID] = None
    transaction_date: Optional[date] = None
    payment_method: Optional[str] = Field(None, pattern='^(cash|credit_card|bank_transfer|digital_wallet)$')
    description: Optional[str] = Field(None, max_length=500)
    love_rating: Optional[int] = Field(None, ge=1, le=5)
    tags: Optional[List[str]] = Field(None, max_items=10)
    location: Optional[str] = Field(None, max_length=200)
    shared_info: Optional[SharedTransactionInfo] = None


class Transaction(TransactionBase):
    """取引情報"""
    id: UUID
    user_id: UUID
    receipt_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SharedTransaction(BaseModel):
    """共有取引情報"""
    id: UUID
    transaction_id: UUID
    partnership_id: UUID
    payer_user_id: UUID
    split_type: str
    user1_amount: Optional[Decimal] = None
    user2_amount: Optional[Decimal] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionWithDetails(Transaction):
    """詳細情報を含む取引"""
    category: Dict[str, Any]
    shared_transaction: Optional[SharedTransaction] = None
    payer: Optional[Dict[str, Any]] = None  # 共有取引の場合の支払者情報
    
    class Config:
        from_attributes = True


class TransactionFilter(BaseModel):
    """取引フィルタ"""
    category_id: Optional[UUID] = None
    transaction_type: Optional[str] = Field(None, pattern='^(income|expense)$')
    sharing_type: Optional[str] = Field(None, pattern='^(personal|shared)$')
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    min_amount: Optional[Decimal] = Field(None, ge=0)
    max_amount: Optional[Decimal] = Field(None, ge=0)
    love_rating: Optional[int] = Field(None, ge=1, le=5)
    search: Optional[str] = Field(None, max_length=200)