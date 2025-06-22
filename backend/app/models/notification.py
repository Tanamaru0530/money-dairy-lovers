from sqlalchemy import Column, String, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # budget_warning, budget_exceeded, partner_transaction, etc.
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON)  # 追加データ（JSON形式）
    is_read = Column(Boolean, default=False)
    priority = Column(String(20), default='normal')  # low, normal, high, urgent
    action_url = Column(String(500))  # アクション先URL
    expires_at = Column(DateTime(timezone=True))  # 通知の有効期限
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="notifications")