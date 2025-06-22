import { api } from './api';
import { 
  LoveGoal, 
  LoveGoalWithProgress, 
  LoveGoalCreate, 
  LoveGoalUpdate,
  LoveStats,
  LoveEvent,
  LoveEventCreate,
  LoveMemory
} from '@/types/love';

export const loveService = {
  // Love Goals
  async getGoals(params?: { isActive?: boolean; categoryId?: string }): Promise<LoveGoalWithProgress[]> {
    const response = await api.get('/love/goals', { params });
    return response.data;
  },

  async createGoal(data: LoveGoalCreate): Promise<LoveGoal> {
    const response = await api.post('/love/goals', data);
    return response.data;
  },

  async updateGoal(id: string, data: LoveGoalUpdate): Promise<LoveGoal> {
    const response = await api.put(`/love/goals/${id}`, data);
    return response.data;
  },

  async deleteGoal(id: string): Promise<void> {
    await api.delete(`/love/goals/${id}`);
  },

  // Love Stats
  async getStats(startDate?: string, endDate?: string): Promise<LoveStats> {
    const response = await api.get('/love/stats', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  // Love Events
  async getEvents(params?: { includePast?: boolean; eventType?: string }): Promise<LoveEvent[]> {
    const response = await api.get('/love/events', { params });
    return response.data;
  },

  async getUpcomingEvents(days: number = 30): Promise<LoveEvent[]> {
    const response = await api.get('/love/events/upcoming', { params: { days } });
    return response.data;
  },

  async createEvent(data: LoveEventCreate): Promise<LoveEvent> {
    const response = await api.post('/love/events', data);
    return response.data;
  },

  // Love Memories
  async getMemories(params?: { limit?: number; minRating?: number }): Promise<LoveMemory[]> {
    const response = await api.get('/love/memories', { params });
    return response.data;
  },

  // Love Rating
  async updateLoveRating(transactionId: string, loveRating: number): Promise<void> {
    await api.put(`/love/transactions/${transactionId}/love-rating`, { loveRating });
  },
};

export default loveService;