from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from uuid import UUID
import logging

from app import models, schemas
from app.core.deps import get_db, get_current_user
from app.schemas.recurring_transaction import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransactionResponse,
    RecurringTransactionList
)

router = APIRouter()
logger = logging.getLogger(__name__)


def calculate_next_execution_date(
    frequency: str,
    interval_value: int,
    current_date: date,
    day_of_month: Optional[int] = None,
    day_of_week: Optional[int] = None
) -> date:
    """次回実行日を計算"""
    if frequency == 'daily':
        return current_date + timedelta(days=interval_value)
    
    elif frequency == 'weekly':
        # 指定曜日まで進める
        if day_of_week is not None:
            days_ahead = day_of_week - current_date.weekday()
            if days_ahead <= 0:  # 今週の指定曜日は過ぎている
                days_ahead += 7 * interval_value
            return current_date + timedelta(days=days_ahead)
        else:
            return current_date + timedelta(weeks=interval_value)
    
    elif frequency == 'monthly':
        next_date = current_date + relativedelta(months=interval_value)
        if day_of_month:
            # 月末の処理
            if day_of_month > 28:
                # 月の最終日を取得
                import calendar
                last_day = calendar.monthrange(next_date.year, next_date.month)[1]
                actual_day = min(day_of_month, last_day)
            else:
                actual_day = day_of_month
            next_date = next_date.replace(day=actual_day)
        return next_date
    
    elif frequency == 'yearly':
        return current_date + relativedelta(years=interval_value)
    
    return current_date


@router.get("/", response_model=RecurringTransactionList)
def get_recurring_transactions(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    is_active: Optional[bool] = True,
    category_id: Optional[UUID] = None,
    transaction_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> Any:
    """
    定期取引一覧を取得
    """
    # 基本クエリ
    query = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.user_id == current_user.id
    )
    
    # フィルタ適用
    if is_active is not None:
        query = query.filter(models.RecurringTransaction.is_active == is_active)
    if category_id:
        query = query.filter(models.RecurringTransaction.category_id == category_id)
    if transaction_type:
        query = query.filter(models.RecurringTransaction.transaction_type == transaction_type)
    
    # 総数を取得
    total = query.count()
    
    # ページネーション適用
    recurring_transactions = query.order_by(
        models.RecurringTransaction.next_execution_date.asc()
    ).offset(skip).limit(limit).all()
    
    # レスポンス作成
    result = []
    for rt in recurring_transactions:
        category = db.query(models.Category).filter(
            models.Category.id == rt.category_id
        ).first()
        
        remaining_executions = None
        if rt.max_executions:
            remaining_executions = rt.max_executions - rt.execution_count
        
        logger.info(f"Processing recurring transaction {rt.id}: amount={rt.amount}, type={type(rt.amount)}")
        
        result.append({
            "id": rt.id,
            "user_id": rt.user_id,
            "category_id": rt.category_id,
            "amount": rt.amount,
            "transaction_type": rt.transaction_type,
            "sharing_type": rt.sharing_type,
            "payment_method": rt.payment_method,
            "description": rt.description,
            "frequency": rt.frequency,
            "interval_value": rt.interval_value,
            "day_of_month": rt.day_of_month,
            "day_of_week": rt.day_of_week,
            "next_execution_date": rt.next_execution_date,
            "last_execution_date": rt.last_execution_date,
            "end_date": rt.end_date,
            "execution_count": rt.execution_count,
            "max_executions": rt.max_executions,
            "is_active": rt.is_active,
            "category_name": category.name if category else "",
            "category_icon": category.icon if category else None,
            "category_color": category.color if category else None,
            "remaining_executions": remaining_executions
        })
    
    return {
        "recurring_transactions": result,
        "total": total
    }


@router.get("/{recurring_transaction_id}", response_model=RecurringTransactionResponse)
def get_recurring_transaction(
    *,
    db: Session = Depends(get_db),
    recurring_transaction_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    特定の定期取引を取得
    """
    rt = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.id == recurring_transaction_id,
        models.RecurringTransaction.user_id == current_user.id
    ).first()
    
    if not rt:
        raise HTTPException(
            status_code=404,
            detail="Recurring transaction not found"
        )
    
    category = db.query(models.Category).filter(
        models.Category.id == rt.category_id
    ).first()
    
    remaining_executions = None
    if rt.max_executions:
        remaining_executions = rt.max_executions - rt.execution_count
    
    return {
        "id": rt.id,
        "user_id": rt.user_id,
        "category_id": rt.category_id,
        "amount": rt.amount,
        "transaction_type": rt.transaction_type,
        "sharing_type": rt.sharing_type,
        "payment_method": rt.payment_method,
        "description": rt.description,
        "frequency": rt.frequency,
        "interval_value": rt.interval_value,
        "day_of_month": rt.day_of_month,
        "day_of_week": rt.day_of_week,
        "next_execution_date": rt.next_execution_date,
        "last_execution_date": rt.last_execution_date,
        "end_date": rt.end_date,
        "execution_count": rt.execution_count,
        "max_executions": rt.max_executions,
        "is_active": rt.is_active,
        "category_name": category.name if category else "",
        "category_icon": category.icon if category else None,
        "category_color": category.color if category else None,
        "remaining_executions": remaining_executions
    }


@router.post("/", response_model=RecurringTransactionResponse)
def create_recurring_transaction(
    *,
    db: Session = Depends(get_db),
    recurring_transaction_in: RecurringTransactionCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    定期取引を作成
    """
    # カテゴリの存在確認
    category = db.query(models.Category).filter(
        models.Category.id == recurring_transaction_in.category_id,
        or_(
            models.Category.is_default == True,
            models.Category.user_id == current_user.id
        )
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )
    
    # 定期取引を作成
    logger.info(f"Creating recurring transaction with data: {recurring_transaction_in.dict()}")
    logger.info(f"Amount value: {recurring_transaction_in.amount}, type: {type(recurring_transaction_in.amount)}")
    
    rt = models.RecurringTransaction(
        **recurring_transaction_in.dict(),
        user_id=current_user.id
    )
    
    db.add(rt)
    db.commit()
    db.refresh(rt)
    
    logger.info(f"Created recurring transaction with amount: {rt.amount}, type: {type(rt.amount)}")
    
    # レスポンス作成
    return get_recurring_transaction(
        db=db,
        recurring_transaction_id=rt.id,
        current_user=current_user
    )


@router.put("/{recurring_transaction_id}", response_model=RecurringTransactionResponse)
def update_recurring_transaction(
    *,
    db: Session = Depends(get_db),
    recurring_transaction_id: UUID,
    recurring_transaction_update: RecurringTransactionUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    定期取引を更新
    """
    rt = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.id == recurring_transaction_id,
        models.RecurringTransaction.user_id == current_user.id
    ).first()
    
    if not rt:
        raise HTTPException(
            status_code=404,
            detail="Recurring transaction not found"
        )
    
    # 更新
    update_data = recurring_transaction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rt, field, value)
    
    db.commit()
    db.refresh(rt)
    
    return get_recurring_transaction(
        db=db,
        recurring_transaction_id=recurring_transaction_id,
        current_user=current_user
    )


@router.delete("/{recurring_transaction_id}")
def delete_recurring_transaction(
    *,
    db: Session = Depends(get_db),
    recurring_transaction_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    定期取引を削除（非アクティブ化）
    """
    rt = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.id == recurring_transaction_id,
        models.RecurringTransaction.user_id == current_user.id
    ).first()
    
    if not rt:
        raise HTTPException(
            status_code=404,
            detail="Recurring transaction not found"
        )
    
    # 非アクティブ化
    rt.is_active = False
    db.commit()
    
    return {"message": "定期取引を削除しました"}


@router.post("/{recurring_transaction_id}/execute")
def execute_recurring_transaction(
    *,
    db: Session = Depends(get_db),
    recurring_transaction_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    定期取引を手動実行
    """
    rt = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.id == recurring_transaction_id,
        models.RecurringTransaction.user_id == current_user.id,
        models.RecurringTransaction.is_active == True
    ).first()
    
    if not rt:
        raise HTTPException(
            status_code=404,
            detail="Active recurring transaction not found"
        )
    
    # 実行回数制限チェック
    if rt.max_executions and rt.execution_count >= rt.max_executions:
        raise HTTPException(
            status_code=400,
            detail="Maximum execution count reached"
        )
    
    # 終了日チェック
    if rt.end_date and date.today() > rt.end_date:
        raise HTTPException(
            status_code=400,
            detail="Recurring transaction has ended"
        )
    
    # 通常の取引として作成
    transaction = models.Transaction(
        user_id=current_user.id,
        category_id=rt.category_id,
        amount=rt.amount,
        transaction_type=rt.transaction_type,
        sharing_type=rt.sharing_type,
        payment_method=rt.payment_method,
        description=f"[定期] {rt.description}" if rt.description else "[定期取引]",
        transaction_date=date.today()
    )
    
    db.add(transaction)
    
    # 実行記録を更新
    rt.last_execution_date = date.today()
    rt.execution_count += 1
    
    # 次回実行日を計算
    rt.next_execution_date = calculate_next_execution_date(
        rt.frequency,
        rt.interval_value,
        date.today(),
        rt.day_of_month,
        rt.day_of_week
    )
    
    # 実行回数制限に達した場合は非アクティブ化
    if rt.max_executions and rt.execution_count >= rt.max_executions:
        rt.is_active = False
    
    # 終了日を過ぎた場合は非アクティブ化
    if rt.end_date and rt.next_execution_date > rt.end_date:
        rt.is_active = False
    
    db.commit()
    db.refresh(transaction)
    
    return {
        "message": "定期取引を実行しました",
        "transaction_id": transaction.id,
        "next_execution_date": rt.next_execution_date,
        "remaining_executions": rt.max_executions - rt.execution_count if rt.max_executions else None
    }