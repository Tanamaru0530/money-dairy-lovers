import { api } from './api'
import type { 
  BudgetWithProgress, 
  BudgetCreate, 
  BudgetUpdate, 
  BudgetSummary 
} from '../types/budget'

export const budgetService = {
  // 予算一覧を取得
  async getBudgets(params?: {
    is_active?: boolean
    period?: string
    category_id?: string
  }): Promise<BudgetWithProgress[]> {
    const response = await api.get<BudgetWithProgress[]>('/budgets', { params })
    return response.data
  },

  // 予算サマリーを取得
  async getBudgetSummary(): Promise<BudgetSummary> {
    const response = await api.get<BudgetSummary>('/budgets/summary')
    return response.data
  },

  // Love予算のみを取得
  async getLoveBudgets(): Promise<BudgetWithProgress[]> {
    const response = await api.get<BudgetWithProgress[]>('/budgets/love')
    return response.data
  },

  // 特定の予算を取得
  async getBudget(budgetId: string): Promise<BudgetWithProgress> {
    const response = await api.get<BudgetWithProgress>(`/budgets/${budgetId}`)
    return response.data
  },

  // 予算を作成
  async createBudget(data: BudgetCreate): Promise<BudgetWithProgress> {
    const response = await api.post<BudgetWithProgress>('/budgets', data)
    return response.data
  },

  // 予算を更新
  async updateBudget(budgetId: string, data: BudgetUpdate): Promise<BudgetWithProgress> {
    const response = await api.put<BudgetWithProgress>(`/budgets/${budgetId}`, data)
    return response.data
  },

  // 予算を削除（非アクティブ化）
  async deleteBudget(budgetId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/budgets/${budgetId}`)
    return response.data
  }
}