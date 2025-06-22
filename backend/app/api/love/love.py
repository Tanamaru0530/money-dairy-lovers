from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_, desc
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from uuid import UUID
import calendar

from app import models, schemas
from app.core.deps import get_db, get_current_user
from app.schemas.love import (
    LoveEventCreate,
    LoveEventUpdate,
    LoveEvent,
    LoveEventWithDays,
    LoveRatingUpdate,
    LoveStats,
    LoveTrend,
    LoveMemory,
    LoveCalendar,
    LoveMemoryCreate,
    LoveMemoryUpdate,
    LoveMemoryResponse,
    LoveGoal,
    LoveGoalCreate,
    LoveGoalUpdate,
    LoveGoalWithProgress
)
from app.api.partnerships.partnerships import get_user_partnership

router = APIRouter()


def calculate_goal_achievement_status(db: Session, goal: models.Budget) -> bool:
    """Love Goalが達成されているかを計算"""
    # 期間内の支出を計算
    query = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == goal.user_id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= goal.start_date
    )
    
    if goal.end_date:
        query = query.filter(models.Transaction.transaction_date <= goal.end_date)
    
    if goal.category_id:
        query = query.filter(models.Transaction.category_id == goal.category_id)
    else:
        # カテゴリ未指定の場合はLoveカテゴリのみ
        query = query.join(models.Category).filter(models.Category.is_love_category == True)
    
    spent_amount = query.scalar() or 0
    
    # 達成判定
    return spent_amount >= goal.amount


def create_goal_achievement_notification(db: Session, goal: models.Budget, user: models.User):
    """Love Goal達成時の通知を作成"""
    notification = models.Notification(
        user_id=user.id,
        type='love_goal_achieved',
        title='🎉 Love Goal達成！',
        message=f'目標「{goal.name.split(" - ")[0] if " - " in goal.name else goal.name}」を達成しました！',
        data={
            'goal_id': str(goal.id),
            'goal_name': goal.name.split(' - ')[0] if ' - ' in goal.name else goal.name,
            'amount': float(goal.amount)
        },
        priority='high'
    )
    db.add(notification)
    db.commit()


def calculate_days_until(event_date: date, from_date: date = None) -> Dict[str, Any]:
    """イベントまでの日数を計算"""
    if from_date is None:
        from_date = datetime.now().date()
    
    # 今年のイベント日を計算
    this_year_event = event_date.replace(year=from_date.year)
    
    # 既に過ぎている場合は来年の日付を使用
    if this_year_event < from_date:
        next_event = event_date.replace(year=from_date.year + 1)
    else:
        next_event = this_year_event
    
    days_until = (next_event - from_date).days
    
    return {
        "days_until": days_until,
        "is_upcoming": days_until >= 0,
        "is_today": days_until == 0
    }


@router.get("/events", response_model=List[LoveEventWithDays])
def get_love_events(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    include_past: bool = False,
    event_type: Optional[str] = None
) -> Any:
    """
    Love イベント一覧を取得
    """
    # パートナーシップを確認
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        return []
    
    # イベントを取得
    query = db.query(models.LoveEvent).filter(
        models.LoveEvent.partnership_id == partnership.id,
        models.LoveEvent.is_active == True
    )
    
    if event_type:
        query = query.filter(models.LoveEvent.event_type == event_type)
    
    events = query.order_by(models.LoveEvent.event_date).all()
    
    # 日数計算を追加
    result = []
    today = date.today()
    
    for event in events:
        days_info = calculate_days_until(event.event_date, today)
        
        # 過去のイベントを含めない場合はスキップ
        if not include_past and not days_info["is_upcoming"]:
            continue
        
        event_dict = {
            "id": event.id,
            "partnership_id": event.partnership_id,
            "event_type": event.event_type,
            "name": event.name,
            "event_date": event.event_date,
            "is_recurring": event.is_recurring,
            "recurrence_type": event.recurrence_type,
            "description": event.description,
            "reminder_days": event.reminder_days,
            "is_active": event.is_active,
            "created_at": event.created_at,
            "updated_at": event.updated_at,
            **days_info
        }
        
        result.append(event_dict)
    
    return result


@router.get("/events/upcoming", response_model=List[LoveEventWithDays])
def get_upcoming_events(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    days: int = 30
) -> Any:
    """
    今後のLove イベントを取得（指定日数以内）
    """
    events = get_love_events(db=db, current_user=current_user, include_past=False)
    
    # 指定日数以内のイベントのみフィルター
    upcoming_events = [
        event for event in events 
        if event["days_until"] <= days
    ]
    
    return upcoming_events


@router.post("/events", response_model=LoveEvent)
def create_love_event(
    *,
    db: Session = Depends(get_db),
    event_in: LoveEventCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love イベントを作成
    """
    # パートナーシップを確認
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        raise HTTPException(
            status_code=400,
            detail="パートナーシップが必要です"
        )
    
    # イベントを作成
    event = models.LoveEvent(
        **event_in.dict(),
        partnership_id=partnership.id
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return event


@router.put("/events/{event_id}", response_model=LoveEvent)
def update_love_event(
    *,
    db: Session = Depends(get_db),
    event_id: UUID,
    event_update: LoveEventUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love イベントを更新
    """
    # パートナーシップを確認
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        raise HTTPException(
            status_code=400,
            detail="パートナーシップが必要です"
        )
    
    # イベントを取得
    event = db.query(models.LoveEvent).filter(
        models.LoveEvent.id == event_id,
        models.LoveEvent.partnership_id == partnership.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Love event not found"
        )
    
    # 更新
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    
    return event


@router.delete("/events/{event_id}")
def delete_love_event(
    *,
    db: Session = Depends(get_db),
    event_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love イベントを削除（非アクティブ化）
    """
    # パートナーシップを確認
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        raise HTTPException(
            status_code=400,
            detail="パートナーシップが必要です"
        )
    
    # イベントを取得
    event = db.query(models.LoveEvent).filter(
        models.LoveEvent.id == event_id,
        models.LoveEvent.partnership_id == partnership.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Love event not found"
        )
    
    # 非アクティブ化
    event.is_active = False
    db.commit()
    
    return {"message": "Love イベントを削除しました"}


@router.put("/transactions/{transaction_id}/love-rating", response_model=Dict[str, Any])
def update_love_rating(
    *,
    db: Session = Depends(get_db),
    transaction_id: UUID,
    rating_update: LoveRatingUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    取引のLove評価を更新
    """
    # 取引を取得
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )
    
    # Love評価を更新
    transaction.love_rating = rating_update.love_rating
    db.commit()
    
    return {
        "message": "Love評価を更新しました",
        "transaction_id": str(transaction_id),
        "love_rating": rating_update.love_rating
    }


@router.get("/stats", response_model=LoveStats)
def get_love_stats(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Any:
    """
    Love統計情報を取得
    """
    # デフォルトは今月
    if not start_date:
        today = datetime.now().date()
        start_date = datetime(today.year, today.month, 1).date()
    if not end_date:
        end_date = datetime.now().date()
    
    # Love取引を取得
    love_transactions = db.query(models.Transaction).join(
        models.Category
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Category.is_love_category == True,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).all()
    
    # 基本統計
    total_love_transactions = len(love_transactions)
    
    # Love評価の平均
    rated_transactions = [t for t in love_transactions if t.love_rating is not None]
    average_love_rating = (
        sum(t.love_rating for t in rated_transactions) / len(rated_transactions)
        if rated_transactions else 0.0
    )
    
    # Love支出合計
    total_love_spending = sum(
        t.amount for t in love_transactions 
        if t.transaction_type == 'expense'
    )
    
    # 全体支出に対する割合
    total_expense = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).scalar()
    
    love_spending_percentage = (
        Decimal(str(total_love_spending)) / Decimal(str(total_expense)) * 100
        if total_expense > 0 else Decimal('0')
    )
    
    # 最もLoveな日
    love_by_date = {}
    for t in love_transactions:
        if t.transaction_type == 'expense':
            date_key = t.transaction_date
            love_by_date[date_key] = love_by_date.get(date_key, 0) + t.amount
    
    most_love_day = max(love_by_date.keys(), key=lambda k: love_by_date[k]) if love_by_date else None
    
    # 最もLoveなカテゴリ
    love_by_category = {}
    for t in love_transactions:
        if t.transaction_type == 'expense':
            cat_name = t.category.name
            love_by_category[cat_name] = love_by_category.get(cat_name, 0) + t.amount
    
    most_love_category = max(love_by_category.keys(), key=lambda k: love_by_category[k]) if love_by_category else None
    
    # Love連続記録（簡易版：連続してLove取引がある日数）
    love_dates = sorted(set(t.transaction_date for t in love_transactions))
    love_streak = 0
    current_streak = 0
    
    for i, date in enumerate(love_dates):
        if i == 0:
            current_streak = 1
        else:
            if (date - love_dates[i-1]).days == 1:
                current_streak += 1
            else:
                love_streak = max(love_streak, current_streak)
                current_streak = 1
    love_streak = max(love_streak, current_streak)
    
    # パートナーシップ確認
    partnership = get_user_partnership(db, current_user.id)
    
    # Love イベント数
    love_events_count = 0
    upcoming_events_count = 0
    
    if partnership:
        love_events_count = db.query(func.count(models.LoveEvent.id)).filter(
            models.LoveEvent.partnership_id == partnership.id,
            models.LoveEvent.is_active == True
        ).scalar()
        
        # 今後のイベント数
        events = get_love_events(db=db, current_user=current_user, include_past=False)
        upcoming_events_count = len([e for e in events if e["days_until"] <= 30])
    
    return LoveStats(
        total_love_transactions=total_love_transactions,
        average_love_rating=average_love_rating,
        total_love_spending=Decimal(str(total_love_spending)),
        love_spending_percentage=love_spending_percentage,
        most_love_day=most_love_day,
        most_love_category=most_love_category,
        love_streak=love_streak,
        love_events_count=love_events_count,
        upcoming_events_count=upcoming_events_count
    )


@router.get("/memories", response_model=List[LoveMemory])
def get_love_memories(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50),
    min_rating: Optional[int] = Query(None, ge=1, le=5)
) -> Any:
    """
    Love思い出（高評価の取引）を取得
    """
    # Love取引を取得
    query = db.query(models.Transaction).join(
        models.Category
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Category.is_love_category == True,
        models.Transaction.love_rating.isnot(None)
    )
    
    # 最低評価でフィルター
    if min_rating:
        query = query.filter(models.Transaction.love_rating >= min_rating)
    
    # 評価と日付でソート
    transactions = query.order_by(
        desc(models.Transaction.love_rating),
        desc(models.Transaction.transaction_date)
    ).limit(limit).all()
    
    # LoveMemoryに変換
    memories = []
    for t in transactions:
        memories.append(LoveMemory(
            transaction_id=t.id,
            date=t.transaction_date,
            amount=t.amount,
            description=t.description or "",
            category_name=t.category.name,
            category_icon=t.category.icon,
            love_rating=t.love_rating,
            image_url=t.receipt_image_url
        ))
    
    return memories


@router.get("/calendar/{year}/{month}", response_model=LoveCalendar)
def get_love_calendar(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    year: int,
    month: int
) -> Any:
    """
    Love カレンダーを取得（月別）
    """
    # 期間を計算
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    
    # Love取引を取得
    love_transactions = db.query(models.Transaction).join(
        models.Category
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Category.is_love_category == True,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).all()
    
    # 日別にまとめる
    love_days = {}
    total_love_amount = Decimal('0')
    
    for t in love_transactions:
        day = t.transaction_date.day
        if day not in love_days:
            love_days[day] = {
                "day": day,
                "transactions": [],
                "total_amount": Decimal('0'),
                "has_love": True
            }
        
        love_days[day]["transactions"].append({
            "id": str(t.id),
            "amount": float(t.amount),
            "category": t.category.name,
            "icon": t.category.icon,
            "love_rating": t.love_rating
        })
        
        if t.transaction_type == 'expense':
            love_days[day]["total_amount"] += t.amount
            total_love_amount += t.amount
    
    # Love イベントを取得
    partnership = get_user_partnership(db, current_user.id)
    events = []
    
    if partnership:
        month_events = db.query(models.LoveEvent).filter(
            models.LoveEvent.partnership_id == partnership.id,
            models.LoveEvent.is_active == True,
            or_(
                extract('month', models.LoveEvent.event_date) == month,
                models.LoveEvent.is_recurring == True
            )
        ).all()
        
        # イベントを処理
        for event in month_events:
            # 月内のイベント日を計算
            if event.is_recurring and event.event_date.month != month:
                # 繰り返しイベントで別の月の場合
                try:
                    event_date_this_month = event.event_date.replace(year=year, month=month)
                except ValueError:
                    # 日付が無効な場合（例：2月31日）
                    continue
            else:
                event_date_this_month = event.event_date
            
            # カレンダーの範囲内かチェック
            if start_date <= event_date_this_month <= end_date:
                days_info = calculate_days_until(event_date_this_month)
                events.append({
                    "id": event.id,
                    "partnership_id": event.partnership_id,
                    "event_type": event.event_type,
                    "name": event.name,
                    "event_date": event_date_this_month,
                    "is_recurring": event.is_recurring,
                    "recurrence_type": event.recurrence_type,
                    "description": event.description,
                    "reminder_days": event.reminder_days,
                    "is_active": event.is_active,
                    "created_at": event.created_at,
                    "updated_at": event.updated_at,
                    **days_info
                })
    
    # カレンダーデータを整形
    love_days_list = [
        {
            "day": day,
            "date": date(year, month, day).isoformat(),
            "transactions": data["transactions"],
            "total_amount": float(data["total_amount"]),
            "has_love": True
        }
        for day, data in sorted(love_days.items())
    ]
    
    return LoveCalendar(
        year=year,
        month=month,
        love_days=love_days_list,
        events=events,
        total_love_days=len(love_days),
        total_love_amount=total_love_amount
    )


@router.get("/trends", response_model=LoveTrend)
def get_love_trends(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    period: str = Query("monthly", pattern="^(daily|weekly|monthly)$"),
    months: int = Query(6, ge=1, le=12)
) -> Any:
    """
    Love傾向分析を取得
    """
    end_date = date.today()
    start_date = end_date - relativedelta(months=months)
    
    # Love取引を取得
    love_transactions = db.query(
        models.Transaction.transaction_date,
        func.sum(models.Transaction.amount).label('amount'),
        func.count(models.Transaction.id).label('count'),
        func.avg(models.Transaction.love_rating).label('avg_rating')
    ).join(
        models.Category
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Category.is_love_category == True,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).group_by(
        models.Transaction.transaction_date
    ).all()
    
    # 期間別に集計
    trends_data = {}
    
    for trans in love_transactions:
        if period == "daily":
            key = trans.transaction_date.isoformat()
        elif period == "weekly":
            # 週の開始日（月曜日）を計算
            week_start = trans.transaction_date - timedelta(days=trans.transaction_date.weekday())
            key = week_start.isoformat()
        else:  # monthly
            key = f"{trans.transaction_date.year}-{trans.transaction_date.month:02d}"
        
        if key not in trends_data:
            trends_data[key] = {
                "period": key,
                "amount": Decimal('0'),
                "count": 0,
                "avg_rating": 0.0,
                "rating_sum": 0.0
            }
        
        trends_data[key]["amount"] += trans.amount
        trends_data[key]["count"] += trans.count
        if trans.avg_rating:
            trends_data[key]["rating_sum"] += trans.avg_rating * trans.count
    
    # 平均評価を計算
    for key in trends_data:
        if trends_data[key]["count"] > 0:
            trends_data[key]["avg_rating"] = trends_data[key]["rating_sum"] / trends_data[key]["count"]
    
    # リストに変換してソート
    trends = [
        {
            "period": data["period"],
            "amount": float(data["amount"]),
            "count": data["count"],
            "avg_rating": round(data["avg_rating"], 1)
        }
        for data in sorted(trends_data.values(), key=lambda x: x["period"])
    ]
    
    # ピーク期間を特定
    peak_love_period = None
    if trends:
        peak_love_period = max(trends, key=lambda x: x["amount"])["period"]
    
    # 成長率を計算（最初と最後の期間を比較）
    love_growth_rate = Decimal('0')
    if len(trends) >= 2:
        first_amount = Decimal(str(trends[0]["amount"]))
        last_amount = Decimal(str(trends[-1]["amount"]))
        if first_amount > 0:
            love_growth_rate = ((last_amount - first_amount) / first_amount * 100)
    
    return LoveTrend(
        period=period,
        trends=trends,
        peak_love_period=peak_love_period,
        love_growth_rate=love_growth_rate
    )


# Love Memory エンドポイント（独立したメモリー機能）
@router.post("/memories/create", response_model=LoveMemoryResponse)
def create_love_memory(
    *,
    db: Session = Depends(get_db),
    memory_in: LoveMemoryCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Loveメモリーを作成
    """
    # パートナーシップを確認
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        raise HTTPException(
            status_code=400,
            detail="パートナーシップが必要です"
        )
    
    # メモリーを作成
    memory = models.LoveMemory(
        partnership_id=partnership.id,
        title=memory_in.title,
        description=memory_in.description,
        event_id=memory_in.event_id,
        transaction_id=memory_in.transaction_id,
        created_by=current_user.id
    )
    
    db.add(memory)
    db.commit()
    db.refresh(memory)
    
    return memory


@router.get("/memories/list", response_model=List[LoveMemoryResponse])
def get_love_memories_list(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> Any:
    """
    Loveメモリー一覧を取得
    """
    # パートナーシップを確認
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        return []
    
    # メモリーを取得
    memories = db.query(models.LoveMemory).filter(
        models.LoveMemory.partnership_id == partnership.id
    ).order_by(
        desc(models.LoveMemory.created_at)
    ).offset(offset).limit(limit).all()
    
    return memories


@router.delete("/memories/{memory_id}")
def delete_love_memory(
    *,
    db: Session = Depends(get_db),
    memory_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Loveメモリーを削除
    """
    # パートナーシップを確認
    partnership = get_user_partnership(db, current_user.id)
    if not partnership:
        raise HTTPException(
            status_code=400,
            detail="パートナーシップが必要です"
        )
    
    # メモリーを取得
    memory = db.query(models.LoveMemory).filter(
        models.LoveMemory.id == memory_id,
        models.LoveMemory.partnership_id == partnership.id
    ).first()
    
    if not memory:
        raise HTTPException(
            status_code=404,
            detail="Love memory not found"
        )
    
    # 削除
    db.delete(memory)
    db.commit()
    
    return {"message": "Loveメモリーを削除しました"}


# Love Goals エンドポイント
@router.get("/goals", response_model=List[LoveGoalWithProgress])
def get_love_goals(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    is_active: Optional[bool] = True,
    category_id: Optional[UUID] = None
) -> Any:
    """
    Love Goals一覧を取得（進捗情報付き）
    """
    # 基本クエリ
    query = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.is_love_budget == True
    )
    
    # アクティブフィルター
    if is_active is not None:
        query = query.filter(models.Budget.is_active == is_active)
    
    # カテゴリフィルター
    if category_id:
        query = query.filter(models.Budget.category_id == category_id)
    
    goals = query.order_by(desc(models.Budget.created_at)).all()
    
    # 各ゴールの進捗を計算
    result = []
    for goal in goals:
        # 期間内の支出を計算
        start_date = goal.start_date
        end_date = goal.end_date or date.today()
        
        # Loveカテゴリの支出を集計
        spent_query = db.query(
            func.coalesce(func.sum(models.Transaction.amount), 0)
        ).join(
            models.Category
        ).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.transaction_type == 'expense',
            models.Transaction.transaction_date >= start_date,
            models.Transaction.transaction_date <= end_date,
            models.Category.is_love_category == True
        )
        
        # 特定のカテゴリに限定されている場合
        if goal.category_id:
            spent_query = spent_query.filter(models.Transaction.category_id == goal.category_id)
        
        spent_amount = spent_query.scalar() or Decimal('0')
        
        # 取引数を取得
        count_query = db.query(
            func.count(models.Transaction.id)
        ).join(
            models.Category
        ).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.transaction_type == 'expense',
            models.Transaction.transaction_date >= start_date,
            models.Transaction.transaction_date <= end_date,
            models.Category.is_love_category == True
        )
        
        if goal.category_id:
            count_query = count_query.filter(models.Transaction.category_id == goal.category_id)
        
        transaction_count = count_query.scalar() or 0
        
        # 進捗計算
        progress_percentage = (spent_amount / goal.amount * 100) if goal.amount > 0 else Decimal('0')
        remaining_amount = max(goal.amount - spent_amount, Decimal('0'))
        is_achieved = spent_amount >= goal.amount
        
        # 残り日数計算
        days_remaining = None
        if goal.end_date:
            days_remaining = (goal.end_date - date.today()).days
            days_remaining = max(days_remaining, 0)
        
        # LoveGoalWithProgressオブジェクトを作成
        goal_with_progress = LoveGoalWithProgress(
            id=goal.id,
            user_id=goal.user_id,
            partnership_id=goal.partnership_id,
            name=goal.name,
            amount=goal.amount,
            period=goal.period,
            start_date=goal.start_date,
            end_date=goal.end_date,
            description=goal.description,
            category_id=goal.category_id,
            is_active=goal.is_active,
            created_at=goal.created_at,
            updated_at=goal.updated_at,
            spent_amount=spent_amount,
            progress_percentage=progress_percentage,
            remaining_amount=remaining_amount,
            days_remaining=days_remaining,
            is_achieved=is_achieved,
            transaction_count=transaction_count
        )
        
        result.append(goal_with_progress)
    
    return result


@router.post("/goals", response_model=LoveGoal)
def create_love_goal(
    *,
    db: Session = Depends(get_db),
    goal_in: LoveGoalCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love Goalを作成
    """
    # パートナーシップを確認（オプション）
    partnership = get_user_partnership(db, current_user.id)
    
    # Love Goal（予算）を作成
    goal = models.Budget(
        user_id=current_user.id,
        partnership_id=partnership.id if partnership else None,
        name=goal_in.name,
        amount=goal_in.amount,
        period=goal_in.period,
        start_date=goal_in.start_date,
        end_date=goal_in.end_date,
        category_id=goal_in.category_id,
        is_love_budget=True,  # Love Goal フラグ
        is_active=True,
        alert_threshold=80.0  # デフォルトアラート閾値
    )
    
    # 説明があれば名前に含める（Budgetモデルにdescriptionフィールドがないため）
    if goal_in.description:
        goal.name = f"{goal_in.name} - {goal_in.description}"
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    # LoveGoalスキーマに変換して返す
    return LoveGoal(
        id=goal.id,
        user_id=goal.user_id,
        partnership_id=goal.partnership_id,
        name=goal.name.split(' - ')[0] if ' - ' in goal.name else goal.name,
        amount=goal.amount,
        period=goal.period,
        start_date=goal.start_date,
        end_date=goal.end_date,
        description=goal.name.split(' - ', 1)[1] if ' - ' in goal.name else None,
        category_id=goal.category_id,
        is_active=goal.is_active,
        created_at=goal.created_at,
        updated_at=goal.updated_at
    )


@router.put("/goals/{goal_id}", response_model=LoveGoal)
def update_love_goal(
    *,
    db: Session = Depends(get_db),
    goal_id: UUID,
    goal_update: LoveGoalUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love Goalを更新
    """
    # ゴールを取得
    goal = db.query(models.Budget).filter(
        models.Budget.id == goal_id,
        models.Budget.user_id == current_user.id,
        models.Budget.is_love_budget == True
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Love goal not found"
        )
    
    # 更新
    update_data = goal_update.dict(exclude_unset=True)
    
    # nameとdescriptionの処理
    if 'name' in update_data or 'description' in update_data:
        current_name = goal.name.split(' - ')[0] if ' - ' in goal.name else goal.name
        current_desc = goal.name.split(' - ', 1)[1] if ' - ' in goal.name else None
        
        new_name = update_data.get('name', current_name)
        new_desc = update_data.get('description', current_desc)
        
        if new_desc:
            goal.name = f"{new_name} - {new_desc}"
        else:
            goal.name = new_name
        
        # これらは既に処理したので削除
        update_data.pop('name', None)
        update_data.pop('description', None)
    
    # 更新前の達成状態を保存
    was_achieved = calculate_goal_achievement_status(db, goal)
    
    # その他のフィールドを更新
    for field, value in update_data.items():
        if hasattr(goal, field):
            setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    
    # 達成状態を再計算
    is_achieved = calculate_goal_achievement_status(db, goal)
    
    # 新たに達成した場合は通知を作成
    if not was_achieved and is_achieved:
        create_goal_achievement_notification(db, goal, current_user)
    
    # LoveGoalスキーマに変換して返す
    return LoveGoal(
        id=goal.id,
        user_id=goal.user_id,
        partnership_id=goal.partnership_id,
        name=goal.name.split(' - ')[0] if ' - ' in goal.name else goal.name,
        amount=goal.amount,
        period=goal.period,
        start_date=goal.start_date,
        end_date=goal.end_date,
        description=goal.name.split(' - ', 1)[1] if ' - ' in goal.name else None,
        category_id=goal.category_id,
        is_active=goal.is_active,
        created_at=goal.created_at,
        updated_at=goal.updated_at
    )


@router.delete("/goals/{goal_id}")
def delete_love_goal(
    *,
    db: Session = Depends(get_db),
    goal_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love Goalを削除（非アクティブ化）
    """
    # ゴールを取得
    goal = db.query(models.Budget).filter(
        models.Budget.id == goal_id,
        models.Budget.user_id == current_user.id,
        models.Budget.is_love_budget == True
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Love goal not found"
        )
    
    # 非アクティブ化
    goal.is_active = False
    db.commit()
    
    return {"message": "Love goalを削除しました"}