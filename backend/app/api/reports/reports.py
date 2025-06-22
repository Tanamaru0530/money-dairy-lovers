from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_, case
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from uuid import UUID
import calendar

from app import models, schemas
from app.core.deps import get_db, get_current_user
from app.schemas.report import (
    MonthlyReport,
    YearlyReport,
    CustomReport,
    CustomReportRequest,
    CategoryReport,
    MonthlyTrend,
    LoveStatistics
)

router = APIRouter()


def get_category_report(
    db: Session,
    user_id: UUID,
    start_date: date,
    end_date: date,
    transaction_type: str = 'expense'
) -> List[CategoryReport]:
    """カテゴリ別レポートを生成"""
    # カテゴリ別集計
    category_stats = db.query(
        models.Category.id,
        models.Category.name,
        models.Category.icon,
        models.Category.is_love_category,
        func.coalesce(func.sum(models.Transaction.amount), 0).label('total_amount'),
        func.count(models.Transaction.id).label('transaction_count')
    ).outerjoin(
        models.Transaction,
        and_(
            models.Transaction.category_id == models.Category.id,
            models.Transaction.user_id == user_id,
            models.Transaction.transaction_type == transaction_type,
            models.Transaction.transaction_date >= start_date,
            models.Transaction.transaction_date <= end_date
        )
    ).filter(
        or_(
            models.Category.is_default == True,
            models.Category.user_id == user_id
        )
    ).group_by(
        models.Category.id,
        models.Category.name,
        models.Category.icon,
        models.Category.is_love_category
    ).all()
    
    # 合計金額を計算
    total_amount = sum(stat.total_amount for stat in category_stats)
    
    # カテゴリレポートを作成
    reports = []
    for stat in category_stats:
        if stat.transaction_count > 0:  # 取引がある場合のみ
            percentage = (Decimal(str(stat.total_amount)) / total_amount * 100) if total_amount > 0 else Decimal('0')
            average_amount = Decimal(str(stat.total_amount)) / stat.transaction_count
            
            reports.append(CategoryReport(
                category_id=stat.id,
                category_name=stat.name,
                category_icon=stat.icon,
                total_amount=Decimal(str(stat.total_amount)),
                transaction_count=stat.transaction_count,
                percentage=percentage,
                average_amount=average_amount,
                is_love_category=stat.is_love_category
            ))
    
    # 金額順にソート
    reports.sort(key=lambda x: x.total_amount, reverse=True)
    return reports


def get_love_statistics(
    db: Session,
    user_id: UUID,
    start_date: date,
    end_date: date
) -> Optional[LoveStatistics]:
    """Love統計を生成"""
    # Love取引を取得
    love_transactions = db.query(models.Transaction).join(
        models.Category
    ).filter(
        models.Transaction.user_id == user_id,
        models.Category.is_love_category == True,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).all()
    
    if not love_transactions:
        return None
    
    # 基本統計
    total_love_spending = sum(t.amount for t in love_transactions if t.transaction_type == 'expense')
    love_transaction_count = len(love_transactions)
    
    # Love rating平均
    rated_transactions = [t for t in love_transactions if t.love_rating is not None]
    average_love_rating = (
        sum(t.love_rating for t in rated_transactions) / len(rated_transactions)
        if rated_transactions else 0.0
    )
    
    # 全体支出に対するLove支出の割合
    total_expense = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).scalar()
    
    love_spending_percentage = (
        Decimal(str(total_love_spending)) / Decimal(str(total_expense)) * 100
        if total_expense > 0 else Decimal('0')
    )
    
    # Love支出のカテゴリ別内訳
    love_categories = get_category_report(
        db, user_id, start_date, end_date, 'expense'
    )
    love_categories = [cat for cat in love_categories if cat.is_love_category]
    
    # お気に入りLoveカテゴリ
    favorite_love_category = love_categories[0] if love_categories else None
    
    # Love支出の日別推移
    love_trend = db.query(
        models.Transaction.transaction_date,
        func.sum(models.Transaction.amount).label('amount')
    ).join(
        models.Category
    ).filter(
        models.Transaction.user_id == user_id,
        models.Category.is_love_category == True,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).group_by(
        models.Transaction.transaction_date
    ).order_by(
        models.Transaction.transaction_date
    ).all()
    
    love_trend_data = [
        {
            "date": str(trend.transaction_date),
            "amount": float(trend.amount)
        }
        for trend in love_trend
    ]
    
    return LoveStatistics(
        total_love_spending=Decimal(str(total_love_spending)),
        love_transaction_count=love_transaction_count,
        average_love_rating=average_love_rating,
        love_spending_percentage=love_spending_percentage,
        favorite_love_category=favorite_love_category,
        love_spending_by_category=love_categories,
        love_trend=love_trend_data
    )


@router.get("/monthly/{year}/{month}", response_model=MonthlyReport)
def get_monthly_report(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    year: int,
    month: int
) -> Any:
    """
    月次レポートを取得
    """
    # 期間を計算
    period_start = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    period_end = date(year, month, last_day)
    
    # 収支サマリー
    income_sum = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'income',
        models.Transaction.transaction_date >= period_start,
        models.Transaction.transaction_date <= period_end
    ).scalar()
    
    expense_sum = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= period_start,
        models.Transaction.transaction_date <= period_end
    ).scalar()
    
    # カテゴリ別分析
    expense_by_category = get_category_report(db, current_user.id, period_start, period_end, 'expense')
    income_by_category = get_category_report(db, current_user.id, period_start, period_end, 'income')
    
    # 前月との比較
    prev_month_start = period_start - relativedelta(months=1)
    prev_month_end = period_start - timedelta(days=1)
    
    previous_month_expense = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= prev_month_start,
        models.Transaction.transaction_date <= prev_month_end
    ).scalar()
    
    expense_change_percentage = None
    if previous_month_expense > 0:
        expense_change_percentage = (
            (Decimal(str(expense_sum)) - Decimal(str(previous_month_expense))) / 
            Decimal(str(previous_month_expense)) * 100
        )
    
    # Love統計
    love_statistics = get_love_statistics(db, current_user.id, period_start, period_end)
    
    # 共有・個人支出
    shared_expense = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.sharing_type == 'shared',
        models.Transaction.transaction_date >= period_start,
        models.Transaction.transaction_date <= period_end
    ).scalar()
    
    personal_expense = Decimal(str(expense_sum)) - Decimal(str(shared_expense))
    shared_percentage = (
        Decimal(str(shared_expense)) / Decimal(str(expense_sum)) * 100
        if expense_sum > 0 else Decimal('0')
    )
    
    # トランザクション統計
    transaction_count = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= period_start,
        models.Transaction.transaction_date <= period_end
    ).scalar()
    
    days_in_month = (period_end - period_start).days + 1
    daily_average_expense = Decimal(str(expense_sum)) / days_in_month
    
    # 最大支出
    largest_expense_query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Transaction.transaction_date >= period_start,
        models.Transaction.transaction_date <= period_end
    ).order_by(models.Transaction.amount.desc()).first()
    
    largest_expense = None
    if largest_expense_query:
        largest_expense = {
            "id": str(largest_expense_query.id),
            "amount": float(largest_expense_query.amount),
            "description": largest_expense_query.description,
            "date": str(largest_expense_query.transaction_date),
            "category_id": str(largest_expense_query.category_id)
        }
    
    return MonthlyReport(
        year=year,
        month=month,
        period_start=period_start,
        period_end=period_end,
        total_income=Decimal(str(income_sum)),
        total_expense=Decimal(str(expense_sum)),
        balance=Decimal(str(income_sum)) - Decimal(str(expense_sum)),
        expense_by_category=expense_by_category,
        income_by_category=income_by_category,
        previous_month_expense=Decimal(str(previous_month_expense)) if previous_month_expense else None,
        expense_change_percentage=expense_change_percentage,
        love_statistics=love_statistics,
        shared_expense=Decimal(str(shared_expense)),
        personal_expense=personal_expense,
        shared_percentage=shared_percentage,
        transaction_count=transaction_count,
        daily_average_expense=daily_average_expense,
        largest_expense=largest_expense
    )


@router.get("/yearly/{year}", response_model=YearlyReport)
def get_yearly_report(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    year: int
) -> Any:
    """
    年次レポートを取得
    """
    # 年間の期間
    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)
    
    # 年間サマリー
    yearly_income = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'income',
        extract('year', models.Transaction.transaction_date) == year
    ).scalar()
    
    yearly_expense = db.query(
        func.coalesce(func.sum(models.Transaction.amount), 0)
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        extract('year', models.Transaction.transaction_date) == year
    ).scalar()
    
    # 月次トレンド
    monthly_stats = db.query(
        extract('month', models.Transaction.transaction_date).label('month'),
        models.Transaction.transaction_type,
        func.sum(models.Transaction.amount).label('total')
    ).filter(
        models.Transaction.user_id == current_user.id,
        extract('year', models.Transaction.transaction_date) == year
    ).group_by(
        extract('month', models.Transaction.transaction_date),
        models.Transaction.transaction_type
    ).all()
    
    # 月次トレンドデータを整形
    monthly_data = {}
    for month_num in range(1, 13):
        monthly_data[month_num] = {
            'income': Decimal('0'),
            'expense': Decimal('0'),
            'love_spending': Decimal('0')
        }
    
    for stat in monthly_stats:
        month_num = int(stat.month)
        if stat.transaction_type == 'income':
            monthly_data[month_num]['income'] = Decimal(str(stat.total))
        else:
            monthly_data[month_num]['expense'] = Decimal(str(stat.total))
    
    # Love支出の月次データ
    love_monthly = db.query(
        extract('month', models.Transaction.transaction_date).label('month'),
        func.sum(models.Transaction.amount).label('total')
    ).join(
        models.Category
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == 'expense',
        models.Category.is_love_category == True,
        extract('year', models.Transaction.transaction_date) == year
    ).group_by(
        extract('month', models.Transaction.transaction_date)
    ).all()
    
    for stat in love_monthly:
        month_num = int(stat.month)
        monthly_data[month_num]['love_spending'] = Decimal(str(stat.total))
    
    # トランザクション数の月次データ
    transaction_counts = db.query(
        extract('month', models.Transaction.transaction_date).label('month'),
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.user_id == current_user.id,
        extract('year', models.Transaction.transaction_date) == year
    ).group_by(
        extract('month', models.Transaction.transaction_date)
    ).all()
    
    for stat in transaction_counts:
        month_num = int(stat.month)
        if month_num not in monthly_data:
            monthly_data[month_num] = {}
        monthly_data[month_num]['transaction_count'] = stat.count
    
    # MonthlyTrendオブジェクトのリストを作成
    monthly_trends = []
    for month_num in range(1, 13):
        data = monthly_data[month_num]
        monthly_trends.append(MonthlyTrend(
            month=f"{year}-{month_num:02d}",
            income=data['income'],
            expense=data['expense'],
            balance=data['income'] - data['expense'],
            love_spending=data['love_spending'],
            transaction_count=data.get('transaction_count', 0)
        ))
    
    # カテゴリ別年間集計
    expense_by_category = get_category_report(db, current_user.id, year_start, year_end, 'expense')
    
    # Love統計
    yearly_love_statistics = get_love_statistics(db, current_user.id, year_start, year_end) or LoveStatistics(
        total_love_spending=Decimal('0'),
        love_transaction_count=0,
        average_love_rating=0.0,
        love_spending_percentage=Decimal('0'),
        favorite_love_category=None,
        love_spending_by_category=[],
        love_trend=[]
    )
    
    # 最高・最低支出月
    expense_months = [(trend.month, trend.expense) for trend in monthly_trends if trend.expense > 0]
    income_months = [(trend.month, trend.income) for trend in monthly_trends if trend.income > 0]
    
    highest_expense_month = max(expense_months, key=lambda x: x[1])[0] if expense_months else ""
    lowest_expense_month = min(expense_months, key=lambda x: x[1])[0] if expense_months else ""
    highest_income_month = max(income_months, key=lambda x: x[1])[0] if income_months else ""
    
    # 予算達成率（オプション）
    # TODO: 予算データと連携して計算
    budget_achievement_rate = None
    
    return YearlyReport(
        year=year,
        total_income=Decimal(str(yearly_income)),
        total_expense=Decimal(str(yearly_expense)),
        total_balance=Decimal(str(yearly_income)) - Decimal(str(yearly_expense)),
        monthly_trends=monthly_trends,
        expense_by_category=expense_by_category,
        yearly_love_statistics=yearly_love_statistics,
        highest_expense_month=highest_expense_month,
        lowest_expense_month=lowest_expense_month,
        highest_income_month=highest_income_month,
        budget_achievement_rate=budget_achievement_rate
    )


@router.post("/custom", response_model=CustomReport)
def create_custom_report(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    report_request: CustomReportRequest
) -> Any:
    """
    カスタムレポートを作成
    """
    # 基本クエリ
    base_query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= report_request.start_date,
        models.Transaction.transaction_date <= report_request.end_date
    )
    
    # カテゴリフィルター
    if report_request.include_categories:
        base_query = base_query.filter(
            models.Transaction.category_id.in_(report_request.include_categories)
        )
    if report_request.exclude_categories:
        base_query = base_query.filter(
            ~models.Transaction.category_id.in_(report_request.exclude_categories)
        )
    
    # 共有タイプフィルター
    if not report_request.include_shared:
        base_query = base_query.filter(models.Transaction.sharing_type != 'shared')
    if not report_request.include_personal:
        base_query = base_query.filter(models.Transaction.sharing_type != 'personal')
    
    # 収支計算
    transactions = base_query.all()
    
    total_income = sum(t.amount for t in transactions if t.transaction_type == 'income')
    total_expense = sum(t.amount for t in transactions if t.transaction_type == 'expense')
    
    # カテゴリ分析
    expense_by_category = get_category_report(
        db, 
        current_user.id, 
        report_request.start_date, 
        report_request.end_date,
        'expense'
    )
    
    # 日別推移
    daily_stats = db.query(
        models.Transaction.transaction_date,
        models.Transaction.transaction_type,
        func.sum(models.Transaction.amount).label('total')
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= report_request.start_date,
        models.Transaction.transaction_date <= report_request.end_date
    ).group_by(
        models.Transaction.transaction_date,
        models.Transaction.transaction_type
    ).order_by(
        models.Transaction.transaction_date
    ).all()
    
    daily_trends = []
    current_date = report_request.start_date
    while current_date <= report_request.end_date:
        day_income = sum(
            stat.total for stat in daily_stats
            if stat.transaction_date == current_date and stat.transaction_type == 'income'
        )
        day_expense = sum(
            stat.total for stat in daily_stats
            if stat.transaction_date == current_date and stat.transaction_type == 'expense'
        )
        
        daily_trends.append({
            "date": str(current_date),
            "income": float(day_income),
            "expense": float(day_expense),
            "balance": float(day_income - day_expense)
        })
        
        current_date += timedelta(days=1)
    
    # Love統計（report_typeがlove_onlyまたはオプションで含める場合）
    love_statistics = None
    if report_request.report_type == 'love_only' or report_request.report_type == 'detailed':
        love_statistics = get_love_statistics(
            db, 
            current_user.id, 
            report_request.start_date, 
            report_request.end_date
        )
    
    days_count = (report_request.end_date - report_request.start_date).days + 1
    
    return CustomReport(
        period_start=report_request.start_date,
        period_end=report_request.end_date,
        days_count=days_count,
        total_income=Decimal(str(total_income)),
        total_expense=Decimal(str(total_expense)),
        balance=Decimal(str(total_income - total_expense)),
        expense_by_category=expense_by_category,
        daily_trends=daily_trends,
        love_statistics=love_statistics,
        budget_performance=None  # TODO: 予算パフォーマンスを追加
    )


@router.get("/love/summary")
def get_love_summary(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Any:
    """
    Love統計サマリーを取得
    """
    # デフォルトは今月
    if not start_date:
        today = date.today()
        start_date = date(today.year, today.month, 1)
    if not end_date:
        end_date = date.today()
    
    love_stats = get_love_statistics(db, current_user.id, start_date, end_date)
    
    if not love_stats:
        return {
            "message": "期間中のLove取引がありません",
            "start_date": start_date,
            "end_date": end_date
        }
    
    return love_stats