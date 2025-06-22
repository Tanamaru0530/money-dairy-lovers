import { api } from './api'
import type {
  RecurringTransaction,
  RecurringTransactionCreate,
  RecurringTransactionUpdate,
  RecurringTransactionList,
  RecurringTransactionExecuteResponse
} from '@/types/recurringTransaction'
import { UUID } from '@/types/common'

export const recurringTransactionService = {
  // 定期取引一覧を取得
  async getRecurringTransactions(params?: {
    is_active?: boolean
    category_id?: UUID
    transaction_type?: string
    skip?: number
    limit?: number
  }): Promise<RecurringTransactionList> {
    const response = await api.get<RecurringTransactionList>('/recurring-transactions', { params })
    return response.data
  },

  // 特定の定期取引を取得
  async getRecurringTransaction(id: UUID): Promise<RecurringTransaction> {
    const response = await api.get<RecurringTransaction>(`/recurring-transactions/${id}`)
    return response.data
  },

  // 定期取引を作成
  async createRecurringTransaction(data: RecurringTransactionCreate): Promise<RecurringTransaction> {
    const response = await api.post<RecurringTransaction>('/recurring-transactions', data)
    return response.data
  },

  // 定期取引を更新
  async updateRecurringTransaction(
    id: UUID,
    data: RecurringTransactionUpdate
  ): Promise<RecurringTransaction> {
    const response = await api.put<RecurringTransaction>(`/recurring-transactions/${id}`, data)
    return response.data
  },

  // 定期取引を削除（非アクティブ化）
  async deleteRecurringTransaction(id: UUID): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/recurring-transactions/${id}`)
    return response.data
  },

  // 定期取引を手動実行
  async executeRecurringTransaction(id: UUID): Promise<RecurringTransactionExecuteResponse> {
    const response = await api.post<RecurringTransactionExecuteResponse>(
      `/recurring-transactions/${id}/execute`
    )
    return response.data
  }
}