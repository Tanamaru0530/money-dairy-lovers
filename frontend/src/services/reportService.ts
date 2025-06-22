import { api } from './api'
import type { 
  MonthlyReport, 
  YearlyReport, 
  CustomReport, 
  CustomReportRequest,
  LoveStatistics
} from '../types/report'

export const reportService = {
  // 月次レポートを取得
  async getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
    const response = await api.get<MonthlyReport>(`/reports/monthly/${year}/${month}`)
    return response.data
  },

  // 年次レポートを取得
  async getYearlyReport(year: number): Promise<YearlyReport> {
    const response = await api.get<YearlyReport>(`/reports/yearly/${year}`)
    return response.data
  },

  // カスタムレポートを作成
  async createCustomReport(data: CustomReportRequest): Promise<CustomReport> {
    const response = await api.post<CustomReport>('/reports/custom', data)
    return response.data
  },

  // Love統計サマリーを取得
  async getLoveSummary(params?: {
    start_date?: string
    end_date?: string
  }): Promise<LoveStatistics | { message: string }> {
    const response = await api.get<LoveStatistics | { message: string }>('/reports/love/summary', { params })
    return response.data
  }
}