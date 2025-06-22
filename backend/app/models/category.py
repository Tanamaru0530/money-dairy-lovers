from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=True)  # 絵文字アイコン
    color = Column(String(7), nullable=True)  # HEX color code
    is_default = Column(Boolean, default=False)
    is_love_category = Column(Boolean, default=False)  # Love特別カテゴリ
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # NULL for default categories
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="custom_categories")