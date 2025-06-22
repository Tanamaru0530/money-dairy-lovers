import { api } from './api';
import { Category, CategoryWithStats, CategoryCreate, CategoryUpdate } from '@/types/category';

export const categoryService = {
  /**
   * カテゴリ一覧を取得
   * @param includeStats 統計情報を含めるかどうか
   * @returns カテゴリ一覧
   */
  async getCategories(includeStats: boolean = false): Promise<{ categories: CategoryWithStats[] }> {
    const response = await api.get<CategoryWithStats[]>('/categories/', {
      params: { include_stats: includeStats }
    });
    return { categories: response.data };
  },

  /**
   * Love特別カテゴリのみを取得
   * @returns Loveカテゴリ一覧
   */
  async getLoveCategories(): Promise<CategoryWithStats[]> {
    const response = await api.get<CategoryWithStats[]>('/categories/love');
    return response.data;
  },

  /**
   * 特定のカテゴリを取得
   * @param categoryId カテゴリID
   * @returns カテゴリ情報
   */
  async getCategory(categoryId: string): Promise<CategoryWithStats> {
    const response = await api.get<CategoryWithStats>(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * カスタムカテゴリを作成
   * @param data カテゴリ作成データ
   * @returns 作成されたカテゴリ
   */
  async createCategory(data: CategoryCreate): Promise<Category> {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  /**
   * カスタムカテゴリを更新
   * @param categoryId カテゴリID
   * @param data カテゴリ更新データ
   * @returns 更新されたカテゴリ
   */
  async updateCategory(categoryId: string, data: CategoryUpdate): Promise<Category> {
    const response = await api.put<Category>(`/categories/${categoryId}`, data);
    return response.data;
  },

  /**
   * カスタムカテゴリを削除
   * @param categoryId カテゴリID
   */
  async deleteCategory(categoryId: string): Promise<void> {
    await api.delete(`/categories/${categoryId}`);
  }
};