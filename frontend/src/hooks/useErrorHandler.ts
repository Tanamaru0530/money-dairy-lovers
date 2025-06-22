import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage, getErrorType, isRetryableError, getSuggestedAction } from '../utils/errorHandler';

export interface ErrorState {
  message: string;
  field?: string;
  code?: string;
  isRetryable?: boolean;
  suggestedAction?: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Type definitions for API error responses
interface ApiErrorResponse {
  detail?: string | ValidationErrorDetail[];
  message?: string;
  userMessage?: string;
}

interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
  onRetry?: () => void;
  customMessage?: string;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastContext();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      showToast: shouldShowToast = true,
      redirectOnAuth = true,
      onRetry,
      customMessage,
    } = options;

    // 統一されたエラーハンドラーを使用
    const errorMessage = customMessage || getErrorMessage(error);
    const errorType = getErrorType(error);
    const retryable = isRetryableError(error);
    const suggestedAction = getSuggestedAction(error);

    console.error('[useErrorHandler] Error occurred:', error);
    console.log('[useErrorHandler] Error type:', errorType);
    console.log('[useErrorHandler] Error message:', errorMessage);

    // エラーステートを設定
    setError({
      message: errorMessage,
      code: errorType.toUpperCase(),
      isRetryable: retryable,
      suggestedAction,
    });

    // AxiosErrorの場合の詳細処理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const response = axiosError.response;
      
      if (!response) {
        if (shouldShowToast) {
          toast.error(errorMessage);
        }
        return;
      }

      // バリデーションエラー（422）
      if (response.status === 422 && response.data?.detail) {
        const details = response.data.detail;
        
        if (Array.isArray(details)) {
          const errors: Record<string, string> = {};
          details.forEach((err) => {
            const field = String(err.loc?.[err.loc.length - 1] || 'general');
            errors[field] = err.msg || 'バリデーションエラー';
          });
          setValidationErrors(errors);
          setError({
            message: '入力内容に誤りがあります。',
            code: 'VALIDATION_ERROR'
          });
        } else if (typeof details === 'string') {
          setError({
            message: details,
            code: 'VALIDATION_ERROR'
          });
        }
        return;
      }

      // 認証エラー（401）
      if (response.status === 401) {
        const isLoginPage = window.location.pathname.includes('/auth/login');
        
        if (shouldShowToast) {
          toast.error(errorMessage);
        }
        
        // ログインページ以外でのみリダイレクト
        if (redirectOnAuth && !isLoginPage && !window.location.pathname.includes('/auth/')) {
          logout();
          navigate('/auth/login');
        }
        return;
      }

      // その他のHTTPエラー
      if (shouldShowToast) {
        toast.error(errorMessage);
        
        // リトライ可能なエラーでリトライ関数がある場合
        if (retryable && onRetry) {
          // リトライボタンを含むトーストを表示することも可能
          // 現在は単純にコールバックを保持
        }
      }
    } else if (error instanceof Error) {
      console.log('[useErrorHandler] Generic Error:', error.message);
      if (shouldShowToast) {
        toast.error(errorMessage);
      }
    } else {
      console.log('[useErrorHandler] Unknown error type:', error);
      if (shouldShowToast) {
        toast.error(errorMessage);
      }
    }
  }, [toast, logout, navigate]);

  const executeAsync = useCallback(async <T,>(
    asyncFunction: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: unknown) => void;
      successMessage?: string;
      errorOptions?: ErrorHandlerOptions;
    }
  ): Promise<T | null> => {
    try {
      console.log('[useErrorHandler] Starting async execution...');
      setIsLoading(true);
      clearError();
      
      const result = await asyncFunction();
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.log('[useErrorHandler] Error caught:', error);
      handleError(error, options?.errorOptions);
      
      if (options?.onError) {
        options.onError(error);
      }
      
      return null;
    } finally {
      console.log('[useErrorHandler] Setting isLoading to false');
      setIsLoading(false);
    }
  }, [clearError, handleError, toast]);

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