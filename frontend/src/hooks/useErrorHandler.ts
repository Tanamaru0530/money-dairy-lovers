import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

export interface ErrorState {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error('[useErrorHandler] Error occurred:', error);
    
    // AxiosErrorの判定をより確実に
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError;
      const response = axiosError.response;
      console.log('[useErrorHandler] Axios error detected');
      console.log('[useErrorHandler] Response status:', response?.status);
      console.log('[useErrorHandler] Response data:', response?.data);
      
      if (!response) {
        console.log('[useErrorHandler] No response - Network error');
        setError({
          message: 'ネットワークエラーが発生しました。接続を確認してください。',
          code: 'NETWORK_ERROR'
        });
        return;
      }

      // バリデーションエラー（422）
      if (response.status === 422 && response.data?.detail) {
        const details = response.data.detail;
        
        if (Array.isArray(details)) {
          const errors: Record<string, string> = {};
          details.forEach((err: any) => {
            const field = err.loc?.[err.loc.length - 1] || 'general';
            errors[field] = err.msg || 'バリデーションエラー';
          });
          setValidationErrors(errors);
          setError({
            message: '入力内容に誤りがあります。',
            code: 'VALIDATION_ERROR'
          });
        } else {
          setError({
            message: details,
            code: 'VALIDATION_ERROR'
          });
        }
        return;
      }

      // 認証エラー（401）
      if (response.status === 401) {
        // ログインページでの401エラーは認証失敗を意味する
        const isLoginPage = window.location.pathname.includes('/auth/login');
        
        // APIインターセプターからのユーザーフレンドリーメッセージを優先
        const errorMessage = response.data?.userMessage || 
          (isLoginPage 
            ? 'メールアドレスまたはパスワードが正しくありません。' 
            : 'ログインが必要です。');
          
        console.log('[useErrorHandler] Setting 401 error:', errorMessage);
        setError({
          message: errorMessage,
          code: 'UNAUTHORIZED'
        });
        
        // ログインページ以外でのみリダイレクト
        if (!isLoginPage && !window.location.pathname.includes('/auth/')) {
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        }
        return;
      }

      // 権限エラー（403）
      if (response.status === 403) {
        setError({
          message: 'この操作を実行する権限がありません。',
          code: 'FORBIDDEN'
        });
        return;
      }

      // Not Found（404）
      if (response.status === 404) {
        setError({
          message: '指定されたデータが見つかりません。',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Conflict（409）
      if (response.status === 409) {
        setError({
          message: response.data?.userMessage || response.data?.detail || 'データの競合が発生しました。',
          code: 'CONFLICT'
        });
        return;
      }

      // その他のサーバーエラー
      if (response.status >= 500) {
        setError({
          message: 'サーバーエラーが発生しました。しばらくしてからもう一度お試しください。',
          code: 'SERVER_ERROR'
        });
        return;
      }

      // デフォルトエラー
      // APIインターセプターからのユーザーフレンドリーメッセージを優先
      const userMessage = response.data?.userMessage || response.data?.detail || response.data?.message;
      setError({
        message: userMessage || 'エラーが発生しました。',
        code: 'UNKNOWN_ERROR'
      });
    } else if (error instanceof Error) {
      console.log('[useErrorHandler] Generic Error:', error.message);
      setError({
        message: error.message,
        code: 'CLIENT_ERROR'
      });
    } else {
      console.log('[useErrorHandler] Unknown error type:', error);
      setError({
        message: '予期しないエラーが発生しました。',
        code: 'UNKNOWN_ERROR'
      });
    }
  }, []);

  const executeAsync = useCallback(async <T,>(
    asyncFunction: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: unknown) => void;
      successMessage?: string;
    }
  ): Promise<T | null> => {
    try {
      console.log('[useErrorHandler] Starting async execution...');
      setIsLoading(true);
      clearError();
      
      const result = await asyncFunction();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.log('[useErrorHandler] Error caught:', error);
      handleError(error);
      
      if (options?.onError) {
        options.onError(error);
      }
      
      return null;
    } finally {
      console.log('[useErrorHandler] Setting isLoading to false');
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    validationErrors,
    isLoading,
    clearError,
    handleError,
    executeAsync,
    setValidationErrors,
  };
};