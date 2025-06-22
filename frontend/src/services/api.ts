import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '../utils/caseConverter';

// 拡張したリクエスト設定の型定義
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// APIクライアントの作成
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// トークン管理
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ログ用のデータサニタイズ関数
const sanitizeLogData = (data: any, url?: string): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'access_token', 'refresh_token', 'code', 'verification_code'];
  const sanitized = { ...data };
  
  // 認証関連URLでは特に厳格にサニタイズ
  if (url?.includes('auth')) {
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
      // メールアドレスをマスク
      if (key.toLowerCase().includes('email') && typeof sanitized[key] === 'string') {
        const email = sanitized[key];
        const [user, domain] = email.split('@');
        if (user && domain) {
          sanitized[key] = `${user.charAt(0)}***@${domain}`;
        }
      }
    });
  }
  
  return sanitized;
};

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    
    // 開発環境でのみログ出力
    if (import.meta.env.DEV && (config.url?.includes('auth') || config.url?.includes('transaction'))) {
      console.log('[API Request]:', config.method?.toUpperCase(), config.url);
      console.log('[API Request] Has token:', !!token);
      if (config.data) {
        console.log('[API Request] Data:', sanitizeLogData(config.data, config.url));
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // リクエストボディをsnake_caseに変換
    if (config.data && typeof config.data === 'object') {
      config.data = convertKeysToSnakeCase(config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    // 開発環境でのみログ出力（認証レスポンスはサニタイズ）
    if (import.meta.env.DEV) {
      if (response.config.url?.includes('auth')) {
        console.log('[API Response] Auth endpoint:', response.config.url);
        const sanitizedData = sanitizeLogData(response.data, response.config.url);
        console.log('[API Response] Data (sanitized):', sanitizedData);
      } else if (response.config.url?.includes('transactions')) {
        console.log('[API Response] Transaction endpoint success');
        // 取引データはサニタイズしないが、数のみログ
        if (response.data?.transactions) {
          console.log('[API Response] Transactions count:', response.data.transactions.length);
        }
      }
    }
    
    // レスポンスデータをcamelCaseに変換
    if (response.data && typeof response.data === 'object') {
      response.data = convertKeysToCamelCase(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    console.error('[API Response Error]:', error.response?.status, error.response?.data);
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    // 401エラーの場合、トークンをリフレッシュ（ただし、refresh/login エンドポイント自体は除く）
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh') && 
        !originalRequest.url?.includes('/auth/login')) {
      console.error('[API] 401 Error on:', originalRequest.method?.toUpperCase(), originalRequest.url);
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          tokenManager.setTokens(access_token, refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } else {
          // リフレッシュトークンがない場合はログイン画面へ
          tokenManager.clearTokens();
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    // エラーレスポンスにユーザーフレンドリーなメッセージを追加
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const userMessage = getUserFriendlyMessage(status, data, error.config?.url);
      
      console.log('[API] Error message transformation:', {
        status,
        originalDetail: data?.detail,
        url: error.config?.url,
        userMessage
      });
      
      // エラーメッセージを強化
      const enhancedError = {
        ...error,
        response: {
          ...error.response,
          data: {
            ...data,
            userMessage
          }
        }
      };
      
      return Promise.reject(enhancedError);
    }
    
    // ネットワークエラーの場合
    if (!error.response) {
      const networkError = {
        ...error,
        message: 'ネットワークエラーが発生しました。接続を確認してください。'
      };
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

// ユーザーフレンドリーなエラーメッセージを取得
function getUserFriendlyMessage(status: number, data: any, url?: string): string {
  // バックエンドからの特定のエラーメッセージを確認
  if (data?.detail && typeof data.detail === 'string') {
    // 英語のエラーメッセージを日本語に変換
    const messageMap: { [key: string]: string } = {
      'Incorrect email or password': 'メールアドレスまたはパスワードが正しくありません',
      'The user with this email already exists in the system.': 'このメールアドレスは既に登録されています',
      'Email is already verified': 'メールアドレスは既に確認済みです',
      'Invalid verification code': '確認コードが正しくありません',
      'Verification code has expired': '確認コードの有効期限が切れています',
    };
    
    return messageMap[data.detail] || data.detail;
  }
  
  // ステータスコードによるデフォルトメッセージ
  switch (status) {
    case 400:
      return 'リクエストが正しくありません';
    case 401:
      // ログインエンドポイントでの401は認証失敗
      if (url?.includes('/auth/login')) {
        return 'メールアドレスまたはパスワードが正しくありません。';
      }
      return 'ログインが必要です';
    case 403:
      return 'この操作を実行する権限がありません';
    case 404:
      return '指定されたデータが見つかりません';
    case 409:
      return 'データの競合が発生しました';
    case 422:
      return '入力内容に誤りがあります';
    case 429:
      return 'リクエストが多すぎます。しばらくしてからお試しください';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'サーバーエラーが発生しました。しばらくしてからお試しください';
    default:
      return 'エラーが発生しました';
  }
}

// 名前付きエクスポート
export const api = apiClient;

// デフォルトエクスポート
export default apiClient;