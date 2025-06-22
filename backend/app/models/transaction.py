from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Text, CheckConstraint, ARRAY, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    transaction_type = Column(String(10), nullable=False)  # income, expense
    sharing_type = Column(String(10), nullable=False)  # personal, shared
    payment_method = Column(String(20), nullable=True)  # cash, credit_card, bank_transfer, digital_wallet
    description = Column(Text, nullable=True)
    transaction_date = Column(Date, nullable=False)
    receipt_image_url = Column(String(500), nullable=True)
    love_rating = Column(Integer, nullable=True)  # Love度評価 1-5
    tags = Column(ARRAY(Text), nullable=True)  # タグ配列
    location = Column(String(200), nullable=True)  # 場所情報
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="transactions")
    category = relationship("Category", backref="transactions")
    shared_transaction = relationship("SharedTransaction", back_populates="transaction", uselist=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('amount > 0', name='positive_amount'),
        CheckConstraint("transaction_type IN ('income', 'expense')", name='valid_transaction_type'),
        CheckConstraint("sharing_type IN ('personal', 'shared')", name='valid_sharing_type'),
        CheckConstraint("payment_method IN ('cash', 'credit_card', 'bank_transfer', 'digital_wallet')", name='valid_payment_method'),
        CheckConstraint('love_rating >= 1 AND love_rating <= 5', name='valid_love_rating'),
    )


class SharedTransaction(Base):
    __tablename__ = "shared_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    partnership_id = Column(UUID(as_uuid=True), ForeignKey("partnerships.id", ondelete="CASCADE"), nullable=False)
    payer_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    split_type = Column(String(20), default='equal')  # equal, amount, percentage
    user1_amount = Column(Numeric(12, 2), nullable=True)
    user2_amount = Column(Numeric(12, 2), nullable=True)
    notes = Column(Text, nullable=True)  # 分割に関するメモ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="shared_transaction")
    partnership = relationship("Partnership", backref="shared_transactions")
    payer = relationship("User", backref="paid_shared_transactions")