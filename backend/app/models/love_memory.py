from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base


class LoveMemory(Base):
    """
    Love メモリーモデル（思い出管理）
    """
    __tablename__ = "love_memories"

    # 基本情報
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partnership_id = Column(UUID(as_uuid=True), ForeignKey("partnerships.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # 関連情報（オプション）
    event_id = Column(UUID(as_uuid=True), ForeignKey("love_events.id"), nullable=True)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    
    # 写真（後で実装予定）
    photos = Column(Text, default="[]")  # JSON形式で保存
    
    # メタデータ
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # リレーション
    partnership = relationship("Partnership", back_populates="love_memories")
    event = relationship("LoveEvent", backref="memories")
    transaction = relationship("Transaction", backref="love_memories")
    creator = relationship("User", backref="created_memories")