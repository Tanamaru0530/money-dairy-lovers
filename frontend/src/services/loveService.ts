import { api } from './api';
import { LoveEvent, LoveEventFormData, LoveStatistics, LoveMemory } from '../types/love';

export const loveService = {
  // Love イベント関連
  async getLoveEvents(): Promise<LoveEvent[]> {
    const response = await api.get('/love/events');
    return response.data;
  },

  async createLoveEvent(data: LoveEventFormData): Promise<LoveEvent> {
    const response = await api.post('/love/events', data);
    return response.data;
  },

  async updateLoveEvent(eventId: string, data: Partial<LoveEventFormData>): Promise<LoveEvent> {
    const response = await api.put(`/love/events/${eventId}`, data);
    return response.data;
  },

  async deleteLoveEvent(eventId: string): Promise<void> {
    await api.delete(`/love/events/${eventId}`);
  },

  // Love 統計関連
  async getLoveStatistics(year?: number, month?: number): Promise<LoveStatistics> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const response = await api.get(`/love/statistics?${params.toString()}`);
    return response.data;
  },

  // Love メモリー関連
  async getLoveMemories(): Promise<LoveMemory[]> {
    const response = await api.get('/love/memories/list');
    return response.data;
  },

  async createLoveMemory(data: {
    transaction_id?: string;
    event_id?: string;
    title: string;
    description: string;
    photo?: string;
  }): Promise<LoveMemory> {
    const response = await api.post('/love/memories/create', data);
    return response.data;
  },

  async deleteLoveMemory(memoryId: string): Promise<void> {
    await api.delete(`/love/memories/${memoryId}`);
  },

  // 今後のイベントを取得
  async getUpcomingEvents(days: number = 30): Promise<LoveEvent[]> {
    const response = await api.get(`/love/events/upcoming?days=${days}`);
    return response.data;
  },
};