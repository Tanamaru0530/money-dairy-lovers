import { api } from './api';
import { 
  Transaction, 
  TransactionFormData, 
  PaginatedTransactions, 
  TransactionFilter,
  TransactionStats 
} from '../types/transaction';

export const transactionService = {
  // 取引一覧を取得
  async getTransactions(page: number = 1, filters?: TransactionFilter): Promise<PaginatedTransactions> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '20');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  // 取引詳細を取得
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },

  // 取引を作成
  async createTransaction(data: TransactionFormData): Promise<Transaction> {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  // 取引を更新
  async updateTransaction(transactionId: string, data: Partial<TransactionFormData>): Promise<Transaction> {
    const response = await api.put(`/transactions/${transactionId}`, data);
    return response.data;
  },

  // 取引を削除
  async deleteTransaction(transactionId: string): Promise<void> {
    await api.delete(`/transactions/${transactionId}`);
  },

  // 月次統計を取得
  async getMonthlyStats(year: number, month: number): Promise<TransactionStats> {
    const response = await api.get('/transactions/stats/monthly', {
      params: { year, month }
    });
    return response.data;
  },

  // レシート画像をアップロード
  async uploadReceiptImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // データURL形式から純粋なBase64文字列を抽出
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  },

  // 全取引を取得（CSVエクスポート用）
  async getAllTransactions(filters?: TransactionFilter): Promise<Transaction[]> {
    const params = new URLSearchParams();
    params.append('limit', '10000'); // 十分に大きな数を設定

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data.transactions || [];
  },
};