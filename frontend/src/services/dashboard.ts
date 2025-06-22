import api from './api';
import type { DashboardSummary, CategoryBreakdown } from '../types';

export const dashboardService = {
  async getMonthSummary(year?: number, month?: number): Promise<DashboardSummary> {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;

    const response = await api.get('/dashboard/monthly-summary', {
      params: {
        year: targetYear,
        month: targetMonth,
      },
    });
    return response.data;
  },

  async getCategoryBreakdown(year?: number, month?: number): Promise<CategoryBreakdown[]> {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;

    const response = await api.get('/dashboard/category-breakdown', {
      params: {
        year: targetYear,
        month: targetMonth,
      },
    });
    return response.data;
  },

  async getLoveStatistics(period: 'month' | 'year' | 'all' = 'month') {
    const response = await api.get('/dashboard/love-statistics', {
      params: { period },
    });
    return response.data;
  },

  async getBudgetProgress() {
    const response = await api.get('/dashboard/budget-progress');
    return response.data;
  },
};