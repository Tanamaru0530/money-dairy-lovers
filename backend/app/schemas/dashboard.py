from pydantic import BaseModel
from typing import Optional, List, Dict, Union
from datetime import date

from app.schemas.category import CategoryResponse


class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    personal_expense: float
    shared_expense: float
    love_expense: float
    transaction_count: int
    avg_love_rating: float
    income_change: Optional[float] = None
    expense_change: Optional[float] = None
    month: str
    year: int


class CategoryBreakdown(BaseModel):
    category: CategoryResponse
    amount: float
    percentage: float
    transaction_count: int


class LoveCategoryStats(BaseModel):
    category: CategoryResponse
    amount: float
    percentage: float
    avg_rating: float


class LoveTimeline(BaseModel):
    date: str
    amount: float
    rating: float


class LoveStatistics(BaseModel):
    period: Dict[str, str]
    love_summary: Dict[str, Union[float, int, str]]
    love_categories: List[Dict]
    love_timeline: List[Dict]


class BudgetItem(BaseModel):
    id: str
    name: str
    amount: float
    spent: float
    remaining: float
    percentage: float
    category: Optional[CategoryResponse] = None
    is_love_budget: bool


class BudgetProgress(BaseModel):
    budgets: List[BudgetItem]
    total_budget: float
    total_spent: float
    total_remaining: float
    overall_percentage: float