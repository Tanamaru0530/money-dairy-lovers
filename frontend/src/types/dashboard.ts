import { Category } from './category';

// Dashboard types
export interface DashboardSummary {
  total_income?: number;
  total_expense?: number;
  personal_expense?: number;
  shared_expense?: number;
  love_expense?: number;
  transaction_count?: number;
  avg_love_rating?: number;
  income_change?: number;
  expense_change?: number;
  month?: string;
  year?: number;
  // camelCase versions
  totalIncome?: number;
  totalExpense?: number;
  personalExpense?: number;
  sharedExpense?: number;
  loveExpense?: number;
  transactionCount?: number;
  avgLoveRating?: number;
  incomeChange?: number;
  expenseChange?: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface LoveStatistics {
  period: {
    start_date: string;
    end_date: string;
    description: string;
  };
  love_summary: {
    total_love_spending: number;
    love_transaction_count: number;
    avg_love_rating: number;
    favorite_love_category: string;
  };
  love_categories: Array<{
    category: Category;
    amount: number;
    percentage: number;
    avg_rating: number;
  }>;
  love_timeline: Array<{
    date: string;
    amount: number;
    rating: number;
  }>;
}

export interface BudgetProgress {
  budgets: Array<{
    id: string;
    name: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    category?: Category;
    is_love_budget: boolean;
  }>;
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  overall_percentage: number;
}