// 共通のバリデーション関数

export const ValidationRules = {
  // 必須チェック
  required: (value: any, fieldName: string = 'この項目') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName}は必須です`;
    }
    return null;
  },

  // メールアドレス
  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '有効なメールアドレスを入力してください';
    }
    return null;
  },

  // パスワード（8文字以上、英数字含む）
  password: (value: string) => {
    if (!value) return null;
    if (value.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }
    if (!/[a-zA-Z]/.test(value)) {
      return 'パスワードには英字を含めてください';
    }
    if (!/[0-9]/.test(value)) {
      return 'パスワードには数字を含めてください';
    }
    return null;
  },

  // パスワード確認
  passwordConfirm: (value: string, password: string) => {
    if (!value) return null;
    if (value !== password) {
      return 'パスワードが一致しません';
    }
    return null;
  },

  // 最小文字数
  minLength: (value: string, min: number, fieldName: string = 'この項目') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName}は${min}文字以上で入力してください`;
    }
    return null;
  },

  // 最大文字数
  maxLength: (value: string, max: number, fieldName: string = 'この項目') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName}は${max}文字以内で入力してください`;
    }
    return null;
  },

  // 数値範囲
  numberRange: (value: number, min?: number, max?: number, fieldName: string = 'この値') => {
    if (value === null || value === undefined) return null;
    if (min !== undefined && value < min) {
      return `${fieldName}は${min}以上で入力してください`;
    }
    if (max !== undefined && value > max) {
      return `${fieldName}は${max}以下で入力してください`;
    }
    return null;
  },

  // 正の数値
  positiveNumber: (value: number, fieldName: string = '金額') => {
    if (value === null || value === undefined) return null;
    if (value <= 0) {
      return `${fieldName}は0より大きい値を入力してください`;
    }
    return null;
  },

  // 日付（未来日付不可）
  pastDate: (value: string | Date, fieldName: string = '日付') => {
    if (!value) return null;
    const date = typeof value === 'string' ? new Date(value) : value;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (date > today) {
      return `${fieldName}は今日以前の日付を選択してください`;
    }
    return null;
  },

  // 日付（過去日付不可）
  futureDate: (value: string | Date, fieldName: string = '日付') => {
    if (!value) return null;
    const date = typeof value === 'string' ? new Date(value) : value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return `${fieldName}は今日以降の日付を選択してください`;
    }
    return null;
  },

  // URL
  url: (value: string) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return '有効なURLを入力してください';
    }
  },

  // ファイルサイズ（MB単位）
  fileSize: (file: File | null, maxSizeMB: number) => {
    if (!file) return null;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `ファイルサイズは${maxSizeMB}MB以内にしてください`;
    }
    return null;
  },

  // ファイル形式
  fileType: (file: File | null, allowedTypes: string[]) => {
    if (!file) return null;
    const fileType = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return fileType === type || extension === type.replace('.', '');
    });
    
    if (!isValidType) {
      return `ファイル形式は${allowedTypes.join(', ')}のいずれかにしてください`;
    }
    return null;
  },

  // カスタムバリデーション
  custom: (value: any, validator: (value: any) => boolean, errorMessage: string) => {
    if (!validator(value)) {
      return errorMessage;
    }
    return null;
  }
};

// バリデーションヘルパー
export class ValidationHelper {
  private errors: Record<string, string> = {};

  // エラーを追加
  addError(field: string, message: string) {
    this.errors[field] = message;
  }

  // フィールドのバリデーション
  validateField(field: string, value: any, rules: Array<(value: any) => string | null>) {
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        this.addError(field, error);
        break;
      }
    }
  }

  // エラーがあるかチェック
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  // エラーを取得
  getErrors(): Record<string, string> {
    return this.errors;
  }

  // 特定フィールドのエラーを取得
  getError(field: string): string | undefined {
    return this.errors[field];
  }

  // エラーをクリア
  clearErrors() {
    this.errors = {};
  }
}

// フォームデータのサニタイズ
export const sanitize = {
  // HTMLタグを除去
  stripHtml: (value: string): string => {
    if (!value) return '';
    return value.replace(/<[^>]*>/g, '');
  },

  // 前後の空白を除去
  trim: (value: string): string => {
    if (!value) return '';
    return value.trim();
  },

  // 数値に変換
  toNumber: (value: string | number): number => {
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  },

  // 整数に変換
  toInteger: (value: string | number): number => {
    if (typeof value === 'number') return Math.floor(value);
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  },

  // 日付に変換
  toDate: (value: string | Date): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
};