import { api } from './api';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';

export interface DashboardSummary {
  current_month: {
    income: number;
    expense: number;
    balance: number;
  };
  previous_month: {
    income: number;
    expense: number;
    balance: number;
  };
  categories: Array<{
    category: Category;
    amount: number;
    percentage: number;
    transaction_count: number;
  }>;
  recent_transactions: Transaction[];
  love_stats: {
    love_spending: number;
    love_transactions: number;
    average_love_rating: number;
  };
}

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  async getMonthlyStats(year: number, month: number) {
    const response = await api.get(`/dashboard/monthly-stats`, {
      params: { year, month }
    });
    return response.data;
  },

  async getCategoryStats(period: 'month' | 'year' = 'month') {
    const response = await api.get('/dashboard/category-stats', {
      params: { period }
    });
    return response.data;
  }
};