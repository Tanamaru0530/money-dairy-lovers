import { api } from './api';
import { Partnership, PartnershipStatus, PartnershipInviteResponse } from '@/types/user';

export const partnershipService = {
  /**
   * パートナーシップのステータスを取得
   */
  async getStatus(): Promise<PartnershipStatus> {
    const response = await api.get<PartnershipStatus>('/partnerships/status');
    return response.data;
  },

  /**
   * 招待コードを生成
   */
  async createInvitation(): Promise<PartnershipInviteResponse> {
    const response = await api.post<PartnershipInviteResponse>('/partnerships/invite');
    return response.data;
  },

  /**
   * 招待コードでパートナーシップに参加
   */
  async joinPartnership(invitationCode: string): Promise<Partnership> {
    const response = await api.post<Partnership>('/partnerships/join', {
      invitation_code: invitationCode
    });
    return response.data;
  },

  /**
   * パートナーシップ情報を更新
   */
  async updatePartnership(data: {
    love_anniversary?: string;
    relationship_type?: string;
  }): Promise<Partnership> {
    const response = await api.put<Partnership>('/partnerships', data);
    return response.data;
  },

  /**
   * パートナーシップを解除
   */
  async deletePartnership(): Promise<void> {
    await api.delete('/partnerships');
  }
};

export default partnershipService;