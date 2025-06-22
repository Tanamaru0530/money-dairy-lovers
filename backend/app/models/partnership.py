from sqlalchemy import Column, String, DateTime, ForeignKey, Date, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base


class Partnership(Base):
    __tablename__ = "partnerships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user1_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user2_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default='pending')  # pending, active, inactive
    invitation_code = Column(String(10), unique=True, index=True)
    invitation_expires_at = Column(DateTime(timezone=True))
    love_anniversary = Column(Date, nullable=True)  # 付き合った記念日
    relationship_type = Column(String(50), default='dating')  # dating, engaged, married
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    activated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user1 = relationship("User", foreign_keys=[user1_id], backref="partnerships_as_user1")
    user2 = relationship("User", foreign_keys=[user2_id], backref="partnerships_as_user2")
    love_memories = relationship("LoveMemory", back_populates="partnership")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user1_id', 'user2_id', name='unique_partnership'),
        CheckConstraint('user1_id != user2_id', name='different_users'),
    )