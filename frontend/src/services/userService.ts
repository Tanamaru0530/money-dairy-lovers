import { api } from './api'
import { User } from '@/types/auth'

export interface UserUpdateData {
  display_name?: string
  love_theme_preference?: 'default' | 'pink' | 'blue' | 'custom'
}

export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  budget_alerts: boolean
  partner_transaction_alerts: boolean
  love_event_reminders: boolean
}

export interface PasswordChangeData {
  current_password: string
  new_password: string
}

export const userService = {
  // プロフィール更新
  async updateProfile(data: UserUpdateData): Promise<User> {
    const response = await api.put<User>('/users/profile', data)
    return response.data
  },

  // プロフィール画像アップロード
  async uploadProfileImage(file: File): Promise<{ profile_image_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<{ profile_image_url: string }>('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 通知設定取得
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await api.get<NotificationSettings>('/users/notification-settings')
    return response.data
  },

  // 通知設定更新
  async updateNotificationSettings(data: NotificationSettings): Promise<NotificationSettings> {
    const response = await api.put<NotificationSettings>('/users/notification-settings', data)
    return response.data
  },

  // パスワード変更
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/users/change-password', data)
    return response.data
  },

  // セッション管理
  async getSessions(): Promise<Array<{ id: string; device: string; last_accessed: string }>> {
    const response = await api.get<Array<{ id: string; device: string; last_accessed: string }>>('/users/sessions')
    return response.data
  },

  // 他のデバイスからログアウト
  async logoutOtherDevices(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/logout-other-devices')
    return response.data
  }
}