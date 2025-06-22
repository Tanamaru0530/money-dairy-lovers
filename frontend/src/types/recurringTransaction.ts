import { UUID } from './common'

export interface RecurringTransaction {
  id: UUID
  user_id: UUID
  category_id: UUID
  amount: number
  transaction_type: 'income' | 'expense'
  sharing_type: 'personal' | 'shared'
  payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | null
  description?: string | null
  
  // Recurrence settings
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval_value: number
  day_of_month?: number | null  // 1-31 for monthly
  day_of_week?: number | null   // 0-6 for weekly (0=Monday)
  
  // Execution tracking
  next_execution_date: string  // ISO date string
  last_execution_date?: string | null
  end_date?: string | null
  execution_count: number
  max_executions?: number | null
  is_active: boolean
  
  // Category info (from API response)
  category_name: string
  category_icon?: string | null
  category_color?: string | null
  remaining_executions?: number | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface RecurringTransactionCreate {
  amount: number
  transaction_type: 'income' | 'expense'
  sharing_type: 'personal' | 'shared'
  payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | 'digital_wallet'
  description?: string
  category_id: UUID
  
  // Recurrence settings
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval_value: number
  day_of_month?: number  // 1-31 for monthly
  day_of_week?: number   // 0-6 for weekly
  
  // Execution settings
  next_execution_date: string  // ISO date string
  end_date?: string
  max_executions?: number
}

export interface RecurringTransactionUpdate {
  amount?: number
  description?: string
  payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | null
  
  // Limited recurrence updates
  day_of_month?: number
  day_of_week?: number
  next_execution_date?: string
  end_date?: string | null
  max_executions?: number | null
  is_active?: boolean
}

export interface RecurringTransactionList {
  recurring_transactions?: RecurringTransaction[]
  recurringTransactions?: RecurringTransaction[]  // camelCase版
  total: number
}

export interface RecurringTransactionExecuteResponse {
  message: string
  transaction_id: UUID
  next_execution_date: string
  remaining_executions?: number | null
}