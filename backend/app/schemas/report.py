from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID


class CategoryReport(BaseModel):
    """カテゴリ別レポート"""
    category_id: UUID
    category_name: str
    category_icon: str
    total_amount: Decimal
    transaction_count: int
    percentage: Decimal
    average_amount: Decimal
    is_love_category: bool = False


class MonthlyTrend(BaseModel):
    """月次トレンド"""
    month: str  # YYYY-MM format
    income: Decimal
    expense: Decimal
    balance: Decimal
    love_spending: Decimal
    transaction_count: int


class LoveStatistics(BaseModel):
    """Love統計"""
    total_love_spending: Decimal
    love_transaction_count: int
    average_love_rating: float
    love_spending_percentage: Decimal
    favorite_love_category: Optional[CategoryReport] = None
    love_spending_by_category: List[CategoryReport]
    love_trend: List[Dict[str, Any]]  # 日付とLove支出の推移


class MonthlyReport(BaseModel):
    """月次レポート"""
    year: int
    month: int
    period_start: date
    period_end: date
    
    # 収支サマリー
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal
    
    # カテゴリ分析
    expense_by_category: List[CategoryReport]
    income_by_category: List[CategoryReport]
    
    # 前月比較
    previous_month_expense: Optional[Decimal] = None
    expense_change_percentage: Optional[Decimal] = None
    
    # Love統計
    love_statistics: Optional[LoveStatistics] = None
    
    # パートナー共有支出
    shared_expense: Decimal
    personal_expense: Decimal
    shared_percentage: Decimal
    
    # トランザクション統計
    transaction_count: int
    daily_average_expense: Decimal
    largest_expense: Optional[Dict[str, Any]] = None


class YearlyReport(BaseModel):
    """年次レポート"""
    year: int
    
    # 年間サマリー
    total_income: Decimal
    total_expense: Decimal
    total_balance: Decimal
    
    # 月次トレンド
    monthly_trends: List[MonthlyTrend]
    
    # カテゴリ分析
    expense_by_category: List[CategoryReport]
    
    # Love統計
    yearly_love_statistics: LoveStatistics
    
    # 最高・最低
    highest_expense_month: str
    lowest_expense_month: str
    highest_income_month: str
    
    # 予算達成率
    budget_achievement_rate: Optional[Decimal] = None


class CustomReportRequest(BaseModel):
    """カスタムレポートリクエスト"""
    start_date: date
    end_date: date
    include_categories: Optional[List[UUID]] = None
    exclude_categories: Optional[List[UUID]] = None
    report_type: str = "summary"  # summary, detailed, love_only
    include_shared: bool = True
    include_personal: bool = True


class CustomReport(BaseModel):
    """カスタムレポート"""
    period_start: date
    period_end: date
    days_count: int
    
    # 基本統計
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal
    
    # カテゴリ分析
    expense_by_category: List[CategoryReport]
    
    # 日別推移
    daily_trends: List[Dict[str, Any]]
    
    # オプション統計
    love_statistics: Optional[LoveStatistics] = None
    budget_performance: Optional[Dict[str, Any]] = None