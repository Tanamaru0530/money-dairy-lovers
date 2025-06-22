import { api, tokenManager } from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  display_name: string;
  love_theme_preference?: string;
}

interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;  // camelCase版
  refreshToken?: string; // camelCase版
  token_type?: string;
  tokenType?: string;    // camelCase版
  user: {
    id: string;
    email: string;
    display_name?: string;
    displayName?: string;     // camelCase版
    profile_image_url?: string;
    profileImageUrl?: string; // camelCase版
    love_theme_preference?: string;
    loveThemePreference?: string; // camelCase版
    is_active?: boolean;
    isActive?: boolean;       // camelCase版
    email_verified?: boolean;
    emailVerified?: boolean;  // camelCase版
    created_at?: string;
    createdAt?: string;       // camelCase版
    updated_at?: string;
    updatedAt?: string;       // camelCase版
  };
}

// メールアドレスマスク関数
const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  if (user && domain) {
    return `${user.charAt(0)}***@${domain}`;
  }
  return '***';
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // 開発環境でのみ、マスクされたメールでログ出力
    if (import.meta.env.DEV) {
      console.log('[authService] Login attempt with:', maskEmail(credentials.email));
    }
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // 開発環境でのみ成功ログ（機密情報は除く）
      if (import.meta.env.DEV) {
        console.log('[authService] Login successful for:', maskEmail(credentials.email));
      }

      const data = response.data;
      // APIのcamelCase変換を考慮
      const accessToken = data.access_token || (data as any).accessToken;
      const refreshToken = data.refresh_token || (data as any).refreshToken;
      
      if (!accessToken || !refreshToken) {
        if (import.meta.env.DEV) {
          console.error('[authService] Token not found in response');
        }
        throw new Error('認証トークンが取得できませんでした');
      }
      
      tokenManager.setTokens(accessToken, refreshToken);
      
      // 開発環境でのみトークンの存在確認
      if (import.meta.env.DEV) {
        console.log('[authService] Tokens saved successfully');
      }
      
      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('[authService] Login failed for:', maskEmail(credentials.email));
      }
      throw error;
    }
  },

  async register(data: RegisterData): Promise<any> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // ログアウトエラーは無視
    } finally {
      tokenManager.clearTokens();
    }
  },

  async getCurrentUser(): Promise<any> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async verifyEmail(code: string): Promise<{ message: string; verified: boolean }> {
    const response = await api.post<{ message: string; verified: boolean }>(
      '/auth/verify-email/confirm',
      { code }
    );
    return response.data;
  },

  async resendVerificationEmail(): Promise<{ message: string; verified: boolean }> {
    const response = await api.post<{ message: string; verified: boolean }>(
      '/auth/verify-email/request'
    );
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    const data = response.data;
    // APIのcamelCase変換を考慮
    const accessToken = data.access_token || (data as any).accessToken;
    const newRefreshToken = data.refresh_token || (data as any).refreshToken;
    
    if (!accessToken || !newRefreshToken) {
      console.error('[authService] Token not found in refresh response:', data);
      throw new Error('認証トークンが取得できませんでした');
    }
    
    tokenManager.setTokens(accessToken, newRefreshToken);
    return data;
  },

  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  },
};

export default authService;
