from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Boolean, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base


class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    partnership_id = Column(UUID(as_uuid=True), ForeignKey("partnerships.id", ondelete="CASCADE"), nullable=True)  # 共有予算の場合
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)  # NULL for overall budget
    name = Column(String(200), nullable=False)  # 予算名
    amount = Column(Numeric(12, 2), nullable=False)
    period = Column(String(20), default='monthly')  # monthly, yearly, custom
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    alert_threshold = Column(Numeric(5, 2), default=80.0)  # アラート閾値（%）
    is_active = Column(Boolean, default=True)
    is_love_budget = Column(Boolean, default=False)  # Love予算フラグ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="budgets")
    partnership = relationship("Partnership", backref="shared_budgets")
    category = relationship("Category", backref="budgets")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('amount > 0', name='positive_budget_amount'),
        CheckConstraint('alert_threshold >= 0 AND alert_threshold <= 100', name='valid_alert_threshold'),
    )