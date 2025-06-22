from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from uuid import UUID

from app import models, schemas
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationList
)

router = APIRouter()


@router.get("/", response_model=NotificationList)
def get_notifications(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    is_read: Optional[bool] = None,
    priority: Optional[str] = None,
    type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> Any:
    """
    通知一覧を取得
    """
    # 基本クエリ
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id
    )
    
    # フィルタ適用
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    if priority:
        query = query.filter(Notification.priority == priority)
    if type:
        query = query.filter(Notification.type == type)
    
    # 有効期限内のもののみ
    query = query.filter(
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.utcnow()
        )
    )
    
    # 総数を取得
    total = query.count()
    
    # ページネーション適用
    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return {
        "notifications": notifications,
        "total": total
    }


@router.get("/counts")
def get_notification_counts(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    通知カウントを取得
    """
    # 未読通知数
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.utcnow()
        )
    ).count()
    
    # タイプ別カウント
    type_counts = {}
    notification_types = ['budget_warning', 'budget_exceeded', 'partner_transaction', 'love_event', 'goal_achieved']
    
    for ntype in notification_types:
        count = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.type == ntype,
            Notification.is_read == False,
            or_(
                Notification.expires_at.is_(None),
                Notification.expires_at > datetime.utcnow()
            )
        ).count()
        type_counts[ntype] = count
    
    return {
        "total": unread_count,
        "by_type": type_counts
    }


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    *,
    db: Session = Depends(get_db),
    notification_id: UUID,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    特定の通知を取得
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )
    
    return notification


@router.post("/", response_model=NotificationResponse)
def create_notification(
    *,
    db: Session = Depends(get_db),
    notification_in: NotificationCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    通知を作成（システム内部用）
    """
    notification = Notification(
        **notification_in.dict(),
        user_id=current_user.id
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification


@router.put("/{notification_id}/read")
def mark_notification_as_read(
    *,
    db: Session = Depends(get_db),
    notification_id: UUID,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    通知を既読にする
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "通知を既読にしました"}


@router.put("/read-all")
def mark_all_notifications_as_read(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    すべての通知を既読にする
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {"message": "すべての通知を既読にしました"}


@router.delete("/{notification_id}")
def delete_notification(
    *,
    db: Session = Depends(get_db),
    notification_id: UUID,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    通知を削除
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "通知を削除しました"}


def create_budget_warning_notification(
    db: Session,
    user_id: UUID,
    budget_name: str,
    percentage: float,
    amount_used: float,
    amount_total: float
):
    """
    予算警告通知を作成
    """
    notification = Notification(
        user_id=user_id,
        type="budget_warning",
        title=f"予算「{budget_name}」が{int(percentage)}%に達しました",
        message=f"¥{amount_used:,.0f} / ¥{amount_total:,.0f} を使用しています。",
        priority="high" if percentage >= 90 else "normal",
        data={
            "budget_name": budget_name,
            "percentage": percentage,
            "amount_used": amount_used,
            "amount_total": amount_total
        }
    )
    
    db.add(notification)
    db.commit()


def create_love_event_reminder(
    db: Session,
    user_id: UUID,
    event_name: str,
    event_date: datetime,
    days_until: int
):
    """
    Love イベントリマインダー通知を作成
    """
    notification = Notification(
        user_id=user_id,
        type="love_event",
        title=f"💕 {event_name}まであと{days_until}日です",
        message=f"{event_date.strftime('%Y年%m月%d日')}は特別な日です。準備はいかがですか？",
        priority="high" if days_until <= 3 else "normal",
        data={
            "event_name": event_name,
            "event_date": event_date.isoformat(),
            "days_until": days_until
        }
    )
    
    db.add(notification)
    db.commit()


def create_partner_transaction_notification(
    db: Session,
    user_id: UUID,
    partner_name: str,
    amount: float,
    category_name: str,
    description: str = None
):
    """
    パートナー取引通知を作成
    """
    notification = Notification(
        user_id=user_id,
        type="partner_transaction",
        title=f"👫 {partner_name}さんが共有支出を登録しました",
        message=f"{category_name}: ¥{amount:,.0f}" + (f" - {description}" if description else ""),
        priority="normal",
        data={
            "partner_name": partner_name,
            "amount": amount,
            "category_name": category_name,
            "description": description
        }
    )
    
    db.add(notification)
    db.commit()