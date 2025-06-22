import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}

export interface ErrorResponse {
  detail?: string | ApiError[];
  message?: string;
  error?: string;
  error_code?: string;
}

/**
 * APIエラーをユーザーフレンドリーなメッセージに変換
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'エラーが発生しました';
  }

  // Axiosエラーの場合
  if (error instanceof AxiosError) {
    const response = error.response;
    
    // ネットワークエラー
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        return 'リクエストがタイムアウトしました。もう一度お試しください。';
      }
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }

    // HTTPステータスコードによる処理
    switch (response.status) {
      case 400:
        return parseApiError(response.data) || '入力内容に誤りがあります';
      case 401:
        return 'ログインが必要です';
      case 403:
        return 'この操作を行う権限がありません';
      case 404:
        return '指定されたデータが見つかりません';
      case 409:
        return parseApiError(response.data) || 'データの競合が発生しました';
      case 422:
        return parseValidationError(response.data) || '入力内容を確認してください';
      case 429:
        return 'リクエストが多すぎます。しばらくしてからお試しください。';
      case 500:
        return 'サーバーエラーが発生しました。しばらくしてからお試しください。';
      case 502:
      case 503:
      case 504:
        return 'サービスが一時的に利用できません。しばらくしてからお試しください。';
      default:
        return parseApiError(response.data) || 'エラーが発生しました';
    }
  }

  // 通常のErrorの場合
  if (error instanceof Error) {
    return error.message;
  }

  // 文字列の場合
  if (typeof error === 'string') {
    return error;
  }

  return 'エラーが発生しました';
}

/**
 * APIエラーレスポンスを解析
 */
function parseApiError(data: ErrorResponse): string | null {
  if (!data) return null;

  // detailが文字列の場合
  if (typeof data.detail === 'string') {
    return data.detail;
  }

  // detailが配列の場合（バリデーションエラー）
  if (Array.isArray(data.detail)) {
    const errors = data.detail.map(err => {
      if (typeof err === 'string') return err;
      return err.message || err.msg || 'エラーが発生しました';
    });
    return errors.join('\n');
  }

  // その他のエラーメッセージ
  return data.message || data.error || null;
}

/**
 * バリデーションエラーを解析
 */
function parseValidationError(data: ErrorResponse): string | null {
  if (!data || !data.detail) return null;

  if (Array.isArray(data.detail)) {
    const errors = data.detail.map(err => {
      if (typeof err === 'object' && err.field) {
        return `${getFieldName(err.field)}: ${err.message || 'エラー'}`;
      }
      if (typeof err === 'object' && err.loc) {
        const field = err.loc[err.loc.length - 1];
        return `${getFieldName(field)}: ${err.msg || 'エラー'}`;
      }
      return typeof err === 'string' ? err : 'エラーが発生しました';
    });
    return errors.join('\n');
  }

  return null;
}

/**
 * フィールド名を日本語に変換
 */
function getFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    email: 'メールアドレス',
    password: 'パスワード',
    display_name: '表示名',
    displayName: '表示名',
    amount: '金額',
    description: '説明',
    category_id: 'カテゴリ',
    categoryId: 'カテゴリ',
    transaction_date: '取引日',
    transactionDate: '取引日',
    name: '名前',
    start_date: '開始日',
    startDate: '開始日',
    end_date: '終了日',
    endDate: '終了日',
  };

  return fieldMap[field] || field;
}

/**
 * エラーの種類を判定
 */
export function getErrorType(error: unknown): 'network' | 'validation' | 'auth' | 'server' | 'unknown' {
  if (!error || !(error instanceof AxiosError)) {
    return 'unknown';
  }

  const response = error.response;

  if (!response) {
    return 'network';
  }

  switch (response.status) {
    case 400:
    case 422:
      return 'validation';
    case 401:
    case 403:
      return 'auth';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'server';
    default:
      return 'unknown';
  }
}

/**
 * リトライ可能なエラーかどうかを判定
 */
export function isRetryableError(error: unknown): boolean {
  const errorType = getErrorType(error);
  return errorType === 'network' || errorType === 'server';
}

/**
 * エラーコードからアクションを提案
 */
export function getSuggestedAction(error: unknown): string | null {
  const errorType = getErrorType(error);

  switch (errorType) {
    case 'network':
      return 'インターネット接続を確認してください';
    case 'auth':
      return 'ログインし直してください';
    case 'server':
      return 'しばらくしてからもう一度お試しください';
    default:
      return null;
  }
}