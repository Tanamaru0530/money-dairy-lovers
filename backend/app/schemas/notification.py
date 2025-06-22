from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime
from uuid import UUID


class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    data: Optional[dict] = None
    priority: str = 'normal'
    action_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NotificationList(BaseModel):
    notifications: List[NotificationResponse]
    total: int