from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base


class LoveEvent(Base):
    """Love記念日・イベント管理"""
    __tablename__ = "love_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partnership_id = Column(UUID(as_uuid=True), ForeignKey("partnerships.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)  # anniversary, birthday, valentine, custom
    name = Column(String(200), nullable=False)
    event_date = Column(Date, nullable=False)
    is_recurring = Column(Boolean, default=True)
    recurrence_type = Column(String(20), nullable=True)  # yearly, monthly, custom
    description = Column(String, nullable=True)
    reminder_days = Column(Integer, default=7)  # 何日前に通知するか
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    partnership = relationship("Partnership", backref="love_events")