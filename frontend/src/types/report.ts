export interface CategoryReport {
  categoryId: string
  categoryName: string
  categoryIcon: string
  totalAmount: number
  transactionCount: number
  percentage: number
  averageAmount: number
  isLoveCategory: boolean
}

export interface MonthlyTrend {
  month: string // YYYY-MM format
  income: number
  expense: number
  balance: number
  love_spending: number
  transaction_count: number
}

export interface LoveStatistics {
  total_love_spending?: number
  love_transaction_count?: number
  average_love_rating?: number
  love_spending_percentage?: number
  totalLoveSpending?: number
  loveTransactionCount?: number
  averageLoveRating?: number
  loveSpendingPercentage?: number
  favorite_love_category?: CategoryReport | null
  favoriteLoveCategory?: CategoryReport | null
  love_spending_by_category?: CategoryReport[]
  loveSpendingByCategory?: CategoryReport[]
  love_trend?: Array<{
    date: string
    amount: number
  }>
  loveTrend?: Array<{
    date: string
    amount: number
  }>
}

export interface MonthlyReport {
  year?: number
  month?: number
  period_start?: string
  period_end?: string
  periodStart?: string
  periodEnd?: string
  
  // 収支サマリー
  total_income?: number
  total_expense?: number
  balance?: number
  totalIncome?: number
  totalExpense?: number
  
  // カテゴリ分析
  expense_by_category?: CategoryReport[]
  income_by_category?: CategoryReport[]
  expenseByCategory?: CategoryReport[]
  incomeByCategory?: CategoryReport[]
  
  // 前月比較
  previous_month_expense?: number | null
  expense_change_percentage?: number | null
  previousMonthExpense?: number | null
  expenseChangePercentage?: number | null
  
  // Love統計
  love_statistics?: LoveStatistics | null
  loveStatistics?: LoveStatistics | null
  
  // パートナー共有支出
  shared_expense?: number
  personal_expense?: number
  shared_percentage?: number
  sharedExpense?: number
  personalExpense?: number
  sharedPercentage?: number
  
  // トランザクション統計
  transaction_count?: number
  daily_average_expense?: number
  transactionCount?: number
  dailyAverageExpense?: number
  largest_expense?: {
    id: string
    amount: number
    description: string
    date: string
    category_id: string
  } | null
  largestExpense?: {
    id: string
    amount: number
    description: string
    date: string
    category_id: string
    categoryId?: string
  } | null
}

export interface YearlyReport {
  year?: number
  
  // 年間サマリー
  total_income?: number
  total_expense?: number
  total_balance?: number
  totalIncome?: number
  totalExpense?: number
  totalBalance?: number
  
  // 月次トレンド
  monthly_trends?: MonthlyTrend[]
  monthlyTrends?: MonthlyTrend[]
  
  // カテゴリ分析
  expense_by_category?: CategoryReport[]
  expenseByCategory?: CategoryReport[]
  
  // Love統計
  yearly_love_statistics?: LoveStatistics
  yearlyLoveStatistics?: LoveStatistics
  
  // 最高・最低
  highest_expense_month?: string
  lowest_expense_month?: string
  highest_income_month?: string
  highestExpenseMonth?: string
  lowestExpenseMonth?: string
  highestIncomeMonth?: string
  
  // 予算達成率
  budget_achievement_rate?: number | null
  budgetAchievementRate?: number | null
}

export interface CustomReportRequest {
  start_date: string
  end_date: string
  include_categories?: string[]
  exclude_categories?: string[]
  report_type?: 'summary' | 'detailed' | 'love_only'
  include_shared?: boolean
  include_personal?: boolean
}

export interface CustomReport {
  period_start: string
  period_end: string
  days_count: number
  
  // 基本統計
  total_income: number
  total_expense: number
  balance: number
  
  // カテゴリ分析
  expense_by_category: CategoryReport[]
  
  // 日別推移
  daily_trends: Array<{
    date: string
    income: number
    expense: number
    balance: number
  }>
  
  // オプション統計
  love_statistics?: LoveStatistics | null
  budget_performance?: any
}