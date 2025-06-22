from datetime import datetime, timedelta, date
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract, or_

from app.core.deps import get_db, get_current_user
from app import models, schemas
from app.schemas.dashboard import (
    DashboardSummary,
    CategoryBreakdown,
    LoveStatistics,
    BudgetProgress
)

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Get dashboard summary including monthly stats, category breakdown, and recent transactions.
    """
    now = datetime.now()
    current_month_start = datetime(now.year, now.month, 1)
    
    # Calculate previous month
    if now.month == 1:
        prev_month_start = datetime(now.year - 1, 12, 1)
        prev_month_end = datetime(now.year, 1, 1) - timedelta(seconds=1)
    else:
        prev_month_start = datetime(now.year, now.month - 1, 1)
        prev_month_end = current_month_start - timedelta(seconds=1)
    
    # Current month stats
    current_month_stats = db.query(
        func.sum(models.Transaction.amount).filter(
            models.Transaction.transaction_type == 'income'
        ).label('income'),
        func.sum(models.Transaction.amount).filter(
            models.Transaction.transaction_type == 'expense'
        ).label('expense')
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= current_month_start,
        models.Transaction.transaction_date < datetime.now() + timedelta(days=1)
    ).first()
    
    # Previous month stats
    prev_month_stats = db.query(
        func.sum(models.Transaction.amount).filter(
            models.Transaction.transaction_type == 'income'
        ).label('income'),
        func.sum(models.Transaction.amount).filter(
            models.Transaction.transaction_type == 'expense'
        ).label('expense')
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= prev_month_start,
        models.Transaction.transaction_date <= prev_month_end
    ).first()
    
    # Category breakdown for current month
    category_stats = db.query(
        models.Category,
        func.sum(models.Transaction.amount).label('amount'),
        func.count(models.Transaction.id).label('transaction_count')
    ).join(
        models.Transaction, models.Transaction.category_id == models.Category.id
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= current_month_start,
        models.Transaction.transaction_type == 'expense'
    ).group_by(models.Category.id).all()
    
    # Calculate total expense for percentage
    total_expense = sum(stat[1] or 0 for stat in category_stats)
    
    # Format category stats
    categories = []
    for category, amount, count in category_stats:
        categories.append({
            "category": {
                "id": str(category.id),
                "name": category.name,
                "icon": category.icon,
                "color": category.color,
                "is_default": category.is_default,
                "is_love_category": category.is_love_category
            },
            "amount": float(amount or 0),
            "percentage": float((amount or 0) / total_expense * 100) if total_expense > 0 else 0,
            "transaction_count": count
        })
    
    # Recent transactions
    recent_transactions_query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(
        models.Transaction.transaction_date.desc(),
        models.Transaction.created_at.desc()
    ).limit(10).all()
    
    # Format transactions
    recent_transactions = []
    for transaction in recent_transactions_query:
        category = db.query(models.Category).filter(
            models.Category.id == transaction.category_id
        ).first()
        
        recent_transactions.append({
            "id": str(transaction.id),
            "amount": float(transaction.amount),
            "transaction_type": transaction.transaction_type,
            "sharing_type": transaction.sharing_type,
            "payment_method": transaction.payment_method,
            "description": transaction.description,
            "transaction_date": transaction.transaction_date.isoformat(),
            "category": {
                "id": str(category.id),
                "name": category.name,
                "icon": category.icon,
                "color": category.color,
                "is_love_category": category.is_love_category
            } if category else None,
            "love_rating": transaction.love_rating,
            "created_at": transaction.created_at.isoformat()
        })
    
    # Love stats
    love_categories = db.query(models.Category).filter(
        models.Category.is_love_category == True
    ).all()
    love_category_ids = [cat.id for cat in love_categories]
    
    love_stats = db.query(
        func.sum(models.Transaction.amount).label('love_spending'),
        func.count(models.Transaction.id).label('love_transactions'),
        func.avg(models.Transaction.love_rating).label('average_love_rating')
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.category_id.in_(love_category_ids),
        models.Transaction.transaction_date >= current_month_start
    ).first()
    
    return {
        "current_month": {
            "income": float(current_month_stats.income or 0),
            "expense": float(current_month_stats.expense or 0),
            "balance": float((current_month_stats.income or 0) - (current_month_stats.expense or 0))
        },
        "previous_month": {
            "income": float(prev_month_stats.income or 0),
            "expense": float(prev_month_stats.expense or 0),
            "balance": float((prev_month_stats.income or 0) - (prev_month_stats.expense or 0))
        },
        "categories": categories,
        "recent_transactions": recent_transactions,
        "love_stats": {
            "love_spending": float(love_stats.love_spending or 0) if love_stats else 0,
            "love_transactions": int(love_stats.love_transactions or 0) if love_stats else 0,
            "average_love_rating": float(love_stats.average_love_rating or 0) if love_stats else 0
        }
    }


@router.get("/monthly-stats")
def get_monthly_stats(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    year: int,
    month: int
) -> Any:
    """
    Get detailed stats for a specific month.
    """
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")
    
    month_start = datetime(year, month, 1)
    if month == 12:
        month_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
    else:
        month_end = datetime(year, month + 1, 1) - timedelta(seconds=1)
    
    # Daily stats for the month
    daily_stats = db.query(
        models.Transaction.transaction_date,
        models.Transaction.transaction_type,
        func.sum(models.Transaction.amount).label('amount')
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= month_start,
        models.Transaction.transaction_date <= month_end
    ).group_by(
        models.Transaction.transaction_date,
        models.Transaction.transaction_type
    ).all()
    
    # Process daily stats
    daily_data = {}
    for date, trans_type, amount in daily_stats:
        date_str = date.strftime('%Y-%m-%d')
        if date_str not in daily_data:
            daily_data[date_str] = {'income': 0, 'expense': 0}
        daily_data[date_str][trans_type] = float(amount)
    
    return {
        "year": year,
        "month": month,
        "daily_stats": daily_data
    }


@router.get("/category-stats")
def get_category_stats(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    period: str = 'month'
) -> Any:
    """
    Get category statistics for specified period.
    """
    now = datetime.now()
    
    if period == 'month':
        start_date = datetime(now.year, now.month, 1)
    elif period == 'year':
        start_date = datetime(now.year, 1, 1)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")
    
    category_stats = db.query(
        models.Category,
        func.sum(models.Transaction.amount).label('amount'),
        func.count(models.Transaction.id).label('transaction_count')
    ).join(
        models.Transaction, models.Transaction.category_id == models.Category.id
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_type == 'expense'
    ).group_by(models.Category.id).all()
    
    # Calculate total
    total = sum(stat[1] or 0 for stat in category_stats)
    
    # Format response
    categories = []
    for category, amount, count in category_stats:
        categories.append({
            "category": {
                "id": str(category.id),
                "name": category.name,
                "icon": category.icon,
                "color": category.color,
                "is_default": category.is_default,
                "is_love_category": category.is_love_category
            },
            "amount": float(amount or 0),
            "percentage": float((amount or 0) / total * 100) if total > 0 else 0,
            "transaction_count": count
        })
    
    # Sort by amount
    categories.sort(key=lambda x: x['amount'], reverse=True)
    
    return {
        "period": period,
        "total": float(total),
        "categories": categories
    }


@router.get("/monthly-summary", response_model=DashboardSummary)
async def get_monthly_summary(
    year: int = Query(..., description="Year"),
    month: int = Query(..., ge=1, le=12, description="Month"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monthly dashboard summary"""
    
    # Current month data
    current_month_start = date(year, month, 1)
    if month == 12:
        current_month_end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        current_month_end = date(year, month + 1, 1) - timedelta(days=1)
    
    # Previous month for comparison
    if month == 1:
        prev_month_start = date(year - 1, 12, 1)
        prev_month_end = date(year - 1, 12, 31)
    else:
        prev_month_start = date(year, month - 1, 1)
        prev_month_end = current_month_start - timedelta(days=1)
    
    # Current month query
    current_month_query = db.query(
        func.sum(models.Transaction.amount).filter(models.Transaction.transaction_type == 'income').label('total_income'),
        func.sum(models.Transaction.amount).filter(models.Transaction.transaction_type == 'expense').label('total_expense'),
        func.sum(models.Transaction.amount).filter(
            and_(models.Transaction.transaction_type == 'expense', models.Transaction.sharing_type == 'personal')
        ).label('personal_expense'),
        func.sum(models.Transaction.amount).filter(
            and_(models.Transaction.transaction_type == 'expense', models.Transaction.sharing_type == 'shared')
        ).label('shared_expense'),
        func.count(models.Transaction.id).label('transaction_count'),
        func.avg(models.Transaction.love_rating).label('avg_love_rating')
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= current_month_start,
        models.Transaction.transaction_date <= current_month_end
    ).first()
    
    # Previous month query for comparison
    prev_month_query = db.query(
        func.sum(models.Transaction.amount).filter(models.Transaction.transaction_type == 'income').label('prev_income'),
        func.sum(models.Transaction.amount).filter(models.Transaction.transaction_type == 'expense').label('prev_expense')
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= prev_month_start,
        models.Transaction.transaction_date <= prev_month_end
    ).first()
    
    # Love expense (categories marked as love categories)
    love_expense = db.query(func.sum(models.Transaction.amount)).join(models.Category).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= current_month_start,
        models.Transaction.transaction_date <= current_month_end,
        models.Category.is_love_category == True
    ).scalar() or 0
    
    # Calculate changes
    income_change = None
    expense_change = None
    
    if prev_month_query.prev_income and prev_month_query.prev_income > 0:
        income_change = round(
            ((current_month_query.total_income or 0) - prev_month_query.prev_income) / prev_month_query.prev_income * 100,
            1
        )
    
    if prev_month_query.prev_expense and prev_month_query.prev_expense > 0:
        expense_change = round(
            ((current_month_query.total_expense or 0) - prev_month_query.prev_expense) / prev_month_query.prev_expense * 100,
            1
        )
    
    return DashboardSummary(
        total_income=float(current_month_query.total_income or 0),
        total_expense=float(current_month_query.total_expense or 0),
        personal_expense=float(current_month_query.personal_expense or 0),
        shared_expense=float(current_month_query.shared_expense or 0),
        love_expense=float(love_expense),
        transaction_count=current_month_query.transaction_count or 0,
        avg_love_rating=float(current_month_query.avg_love_rating or 0),
        income_change=income_change,
        expense_change=expense_change,
        month=f"{year}-{month:02d}",
        year=year
    )


@router.get("/category-breakdown", response_model=List[CategoryBreakdown])
async def get_category_breakdown(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get category breakdown for the month"""
    
    month_start = date(year, month, 1)
    if month == 12:
        month_end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        month_end = date(year, month + 1, 1) - timedelta(days=1)
    
    # Get total expenses for percentage calculation
    total_expense = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= month_start,
        models.Transaction.transaction_date <= month_end
    ).scalar() or 0
    
    # Get breakdown by category
    breakdown = db.query(
        models.Category,
        func.sum(models.Transaction.amount).label('amount'),
        func.count(models.Transaction.id).label('transaction_count')
    ).join(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= month_start,
        models.Transaction.transaction_date <= month_end
    ).group_by(models.Category.id).all()
    
    result = []
    for category, amount, count in breakdown:
        percentage = 0
        if total_expense > 0:
            percentage = round((amount / total_expense) * 100, 1)
        
        result.append(CategoryBreakdown(
            category=category,
            amount=float(amount),
            percentage=percentage,
            transaction_count=count
        ))
    
    # Sort by amount descending
    result.sort(key=lambda x: x.amount, reverse=True)
    
    return result


@router.get("/love-statistics", response_model=LoveStatistics)
async def get_love_statistics(
    period: str = Query('month', regex='^(month|year|all)$'),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get love-themed statistics"""
    
    # Determine date range
    today = date.today()
    if period == 'month':
        start_date = date(today.year, today.month, 1)
        end_date = today
        description = f"{today.strftime('%Y年%m月')}"
    elif period == 'year':
        start_date = date(today.year, 1, 1)
        end_date = today
        description = f"{today.year}年"
    else:  # all
        first_transaction = db.query(models.Transaction).filter(
            models.Transaction.user_id == current_user.id
        ).order_by(models.Transaction.transaction_date).first()
        
        if first_transaction:
            start_date = first_transaction.transaction_date
        else:
            start_date = today
        end_date = today
        description = "全期間"
    
    # Get love transactions
    love_transactions = db.query(models.Transaction).join(models.Category).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date,
        models.Category.is_love_category == True
    ).all()
    
    # Calculate summary
    total_love_spending = sum(t.amount for t in love_transactions)
    love_transaction_count = len(love_transactions)
    avg_love_rating = 0
    if love_transactions:
        ratings = [t.love_rating for t in love_transactions if t.love_rating]
        if ratings:
            avg_love_rating = sum(ratings) / len(ratings)
    
    # Get favorite love category
    love_category_stats = db.query(
        models.Category,
        func.sum(models.Transaction.amount).label('total'),
        func.count(models.Transaction.id).label('count')
    ).join(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date,
        models.Category.is_love_category == True
    ).group_by(models.Category.id).order_by(func.sum(models.Transaction.amount).desc()).all()
    
    favorite_love_category = love_category_stats[0][0].name if love_category_stats else "なし"
    
    # Build category breakdown
    love_categories = []
    for category, total, count in love_category_stats:
        category_ratings = [t.love_rating for t in love_transactions 
                          if t.category_id == category.id and t.love_rating]
        avg_rating = sum(category_ratings) / len(category_ratings) if category_ratings else 0
        
        percentage = (total / total_love_spending * 100) if total_love_spending > 0 else 0
        
        love_categories.append({
            "category": category,
            "amount": float(total),
            "percentage": round(percentage, 1),
            "avg_rating": round(avg_rating, 1)
        })
    
    # Build timeline (last 30 days for month, monthly for year, yearly for all)
    love_timeline = []
    if period == 'month':
        # Daily timeline for last 30 days
        for i in range(30):
            day = today - timedelta(days=i)
            day_amount = sum(t.amount for t in love_transactions 
                           if t.transaction_date == day)
            day_ratings = [t.love_rating for t in love_transactions 
                          if t.transaction_date == day and t.love_rating]
            day_rating = sum(day_ratings) / len(day_ratings) if day_ratings else 0
            
            love_timeline.append({
                "date": day.isoformat(),
                "amount": float(day_amount),
                "rating": round(day_rating, 1)
            })
    
    love_timeline.reverse()
    
    return LoveStatistics(
        period={
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "description": description
        },
        love_summary={
            "total_love_spending": float(total_love_spending),
            "love_transaction_count": love_transaction_count,
            "avg_love_rating": round(avg_love_rating, 1),
            "favorite_love_category": favorite_love_category
        },
        love_categories=love_categories,
        love_timeline=love_timeline
    )


@router.get("/budget-progress", response_model=BudgetProgress)
async def get_budget_progress(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get budget progress (placeholder for now)"""
    
    # This is a placeholder implementation
    # Will be fully implemented when budget feature is added
    
    return BudgetProgress(
        budgets=[],
        total_budget=0,
        total_spent=0,
        total_remaining=0,
        overall_percentage=0
    )