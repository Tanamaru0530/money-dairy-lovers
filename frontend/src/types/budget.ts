export interface Budget {
  id: string
  user_id: string
  partnership_id?: string | null
  category_id?: string | null
  name: string
  amount: number
  period: 'monthly' | 'yearly' | 'custom'
  start_date: string
  end_date?: string | null
  alert_threshold: number
  is_active: boolean
  is_love_budget: boolean
  created_at: string
  updated_at: string
}

export interface BudgetWithProgress extends Budget {
  spent_amount?: number
  remaining_amount?: number
  usage_percentage?: number
  days_remaining?: number
  is_over_budget?: boolean
  is_alert_threshold_reached?: boolean
  // camelCase versions
  spentAmount?: number
  remainingAmount?: number
  usagePercentage?: number
  daysRemaining?: number
  isOverBudget?: boolean
  isAlertThresholdReached?: boolean
}

export interface BudgetCreate {
  name: string
  amount: number
  period: 'monthly' | 'yearly' | 'custom'
  start_date: string
  end_date?: string | null
  category_id?: string | null
  partnership_id?: string | null
  alert_threshold?: number
  is_love_budget?: boolean
}

export interface BudgetUpdate {
  name?: string
  amount?: number
  end_date?: string | null
  alert_threshold?: number
  is_active?: boolean
}

export interface BudgetSummary {
  total_budget?: number
  total_spent?: number
  total_remaining?: number
  overall_usage_percentage?: number
  active_budgets_count?: number
  over_budget_count?: number
  alert_count?: number
  // camelCase versions
  totalBudget?: number
  totalSpent?: number
  totalRemaining?: number
  overallUsagePercentage?: number
  activeBudgetsCount?: number
  overBudgetCount?: number
  alertCount?: number
}