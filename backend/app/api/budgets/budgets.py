from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, extract
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app import schemas, models
from app.core.deps import get_db, get_current_user
from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetWithProgress,
    BudgetSummary
)
from app.api.partnerships.partnerships import get_user_partnership

router = APIRouter()


def calculate_budget_progress(db: Session, budget: models.Budget, user_id: UUID) -> dict:
    """予算の進捗を計算"""
    # 現在の日付
    today = date.today()
    
    # 予算期間の計算
    if budget.period == 'monthly':
        start_date = date(today.year, today.month, 1)
        if today.month == 12:
            end_date = date(today.year + 1, 1, 1)
        else:
            end_date = date(today.year, today.month + 1, 1)
    elif budget.period == 'yearly':
        start_date = date(today.year, 1, 1)
        end_date = date(today.year + 1, 1, 1)
    else:  # custom
        start_date = budget.start_date
        end_date = budget.end_date or today
    
    # 期間内の支出を計算
    query = db.query(func.coalesce(func.sum(models.Transaction.amount), 0)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date < end_date
    )
    
    # カテゴリ予算の場合
    if budget.category_id:
        query = query.filter(models.Transaction.category_id == budget.category_id)
    
    spent_amount = Decimal(str(query.scalar()))
    
    # 進捗計算
    remaining_amount = budget.amount - spent_amount
    usage_percentage = (spent_amount / budget.amount * 100) if budget.amount > 0 else Decimal('0')
    
    # 残り日数
    days_remaining = (end_date - today).days if end_date > today else 0
    
    # アラート判定
    is_over_budget = spent_amount > budget.amount
    is_alert_threshold_reached = usage_percentage >= budget.alert_threshold
    
    return {
        "spent_amount": float(spent_amount),
        "remaining_amount": float(remaining_amount),
        "usage_percentage": float(usage_percentage),
        "days_remaining": days_remaining,
        "is_over_budget": is_over_budget,
        "is_alert_threshold_reached": is_alert_threshold_reached
    }


@router.get("/", response_model=List[BudgetWithProgress])
def get_budgets(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    is_active: Optional[bool] = True,
    period: Optional[str] = None,
    category_id: Optional[UUID] = None
) -> Any:
    """
    予算一覧を取得（進捗情報付き）
    """
    # 基本クエリ
    query = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id
    )
    
    # フィルタ適用
    if is_active is not None:
        query = query.filter(models.Budget.is_active == is_active)
    if period:
        query = query.filter(models.Budget.period == period)
    if category_id:
        query = query.filter(models.Budget.category_id == category_id)
    
    budgets = query.order_by(models.Budget.created_at.desc()).all()
    
    # 進捗情報を追加
    result = []
    for budget in budgets:
        budget_dict = {
            "id": budget.id,
            "user_id": budget.user_id,
            "partnership_id": budget.partnership_id,
            "category_id": budget.category_id,
            "name": budget.name,
            "amount": float(budget.amount),
            "period": budget.period,
            "start_date": budget.start_date,
            "end_date": budget.end_date,
            "alert_threshold": float(budget.alert_threshold),
            "is_active": budget.is_active,
            "is_love_budget": budget.is_love_budget,
            "created_at": budget.created_at,
            "updated_at": budget.updated_at
        }
        
        # 進捗情報を計算
        progress = calculate_budget_progress(db, budget, current_user.id)
        budget_dict.update(progress)
        
        result.append(budget_dict)
    
    return result


@router.get("/summary", response_model=BudgetSummary)
def get_budget_summary(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    予算サマリーを取得
    """
    # アクティブな予算を取得
    active_budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.is_active == True
    ).all()
    
    total_budget = Decimal('0')
    total_spent = Decimal('0')
    over_budget_count = 0
    alert_count = 0
    
    for budget in active_budgets:
        total_budget += budget.amount
        progress = calculate_budget_progress(db, budget, current_user.id)
        total_spent += Decimal(str(progress["spent_amount"]))
        
        if progress["is_over_budget"]:
            over_budget_count += 1
        if progress["is_alert_threshold_reached"]:
            alert_count += 1
    
    total_remaining = total_budget - total_spent
    overall_usage_percentage = (total_spent / total_budget * 100) if total_budget > 0 else Decimal('0')
    
    return {
        "total_budget": float(total_budget),
        "total_spent": float(total_spent),
        "total_remaining": float(total_remaining),
        "overall_usage_percentage": float(overall_usage_percentage),
        "active_budgets_count": len(active_budgets),
        "over_budget_count": over_budget_count,
        "alert_count": alert_count
    }


@router.get("/love", response_model=List[BudgetWithProgress])
def get_love_budgets(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Love予算のみを取得
    """
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.is_love_budget == True,
        models.Budget.is_active == True
    ).all()
    
    # 進捗情報を追加
    result = []
    for budget in budgets:
        budget_dict = {
            "id": budget.id,
            "user_id": budget.user_id,
            "partnership_id": budget.partnership_id,
            "category_id": budget.category_id,
            "name": budget.name,
            "amount": float(budget.amount),
            "period": budget.period,
            "start_date": budget.start_date,
            "end_date": budget.end_date,
            "alert_threshold": float(budget.alert_threshold),
            "is_active": budget.is_active,
            "is_love_budget": budget.is_love_budget,
            "created_at": budget.created_at,
            "updated_at": budget.updated_at
        }
        
        progress = calculate_budget_progress(db, budget, current_user.id)
        budget_dict.update(progress)
        
        result.append(budget_dict)
    
    return result


@router.get("/{budget_id}", response_model=BudgetWithProgress)
def get_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    特定の予算を取得
    """
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )
    
    budget_dict = {
        "id": budget.id,
        "user_id": budget.user_id,
        "partnership_id": budget.partnership_id,
        "category_id": budget.category_id,
        "name": budget.name,
        "amount": budget.amount,
        "period": budget.period,
        "start_date": budget.start_date,
        "end_date": budget.end_date,
        "alert_threshold": budget.alert_threshold,
        "is_active": budget.is_active,
        "is_love_budget": budget.is_love_budget,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at
    }
    
    progress = calculate_budget_progress(db, budget, current_user.id)
    budget_dict.update(progress)
    
    return budget_dict


@router.post("/", response_model=BudgetWithProgress)
def create_budget(
    *,
    db: Session = Depends(get_db),
    budget_in: BudgetCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    予算を作成
    """
    # カテゴリの存在確認（指定された場合）
    if budget_in.category_id:
        category = db.query(models.Category).filter(
            models.Category.id == budget_in.category_id,
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
    
    # パートナーシップの確認（共有予算の場合）
    if budget_in.partnership_id:
        partnership = get_user_partnership(db, current_user.id)
        if not partnership or partnership.id != budget_in.partnership_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid partnership"
            )
    
    # 同じ期間・カテゴリの予算が既に存在するかチェック
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.category_id == budget_in.category_id,
        models.Budget.period == budget_in.period,
        models.Budget.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="同じカテゴリ・期間の予算が既に存在します"
        )
    
    # 予算を作成
    budget_data = budget_in.dict()
    budget_data.pop('partnership_id', None)  # 別途設定
    budget = models.Budget(
        **budget_data,
        user_id=current_user.id,
        partnership_id=budget_in.partnership_id
    )
    
    db.add(budget)
    db.commit()
    db.refresh(budget)
    
    # 進捗情報を計算して返す
    return get_budget(db=db, budget_id=budget.id, current_user=current_user)


@router.put("/{budget_id}", response_model=BudgetWithProgress)
def update_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: UUID,
    budget_update: BudgetUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    予算を更新
    """
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )
    
    # 更新
    update_data = budget_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    
    return get_budget(db=db, budget_id=budget_id, current_user=current_user)


@router.delete("/{budget_id}")
def delete_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: UUID,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    予算を削除（非アクティブ化）
    """
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )
    
    # 非アクティブ化（履歴として残す）
    budget.is_active = False
    db.commit()
    
    return {"message": "予算を削除しました"}