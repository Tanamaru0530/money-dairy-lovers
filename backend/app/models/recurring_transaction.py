from sqlalchemy import (
    Column, String, Numeric, Date, Integer, Boolean, 
    ForeignKey, CheckConstraint, text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    
    # Transaction details
    amount = Column(Numeric(12, 2), nullable=False)
    transaction_type = Column(String(10), nullable=False)  # income, expense
    sharing_type = Column(String(10), nullable=False)  # personal, shared
    payment_method = Column(String(20))  # cash, credit_card, bank_transfer, digital_wallet
    description = Column(String)
    
    # Recurrence settings
    frequency = Column(String(20), nullable=False)  # daily, weekly, monthly, yearly
    interval_value = Column(Integer, default=1)  # 間隔（例：2ヶ月ごとなら2）
    day_of_month = Column(Integer)  # 1-31 for monthly
    day_of_week = Column(Integer)  # 0-6 for weekly (0=Monday)
    
    # Execution tracking
    next_execution_date = Column(Date, nullable=False)
    last_execution_date = Column(Date)
    end_date = Column(Date)  # 終了日（オプション）
    execution_count = Column(Integer, default=0)  # 実行回数
    max_executions = Column(Integer)  # 最大実行回数（オプション）
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="recurring_transactions")
    category = relationship("Category")
    
    # Table constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name="positive_recurring_amount"),
        CheckConstraint("transaction_type IN ('income', 'expense')", name="valid_transaction_type"),
        CheckConstraint("sharing_type IN ('personal', 'shared')", name="valid_sharing_type"),
        CheckConstraint("frequency IN ('daily', 'weekly', 'monthly', 'yearly')", name="valid_frequency"),
        CheckConstraint("interval_value > 0", name="positive_interval"),
        CheckConstraint("day_of_month >= 1 AND day_of_month <= 31", name="valid_day_of_month"),
        CheckConstraint("day_of_week >= 0 AND day_of_week <= 6", name="valid_day_of_week"),
    )