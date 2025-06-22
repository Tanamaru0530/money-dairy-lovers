/**
 * 金額を日本円形式でフォーマット
 * @param amount 金額
 * @returns フォーマットされた金額文字列
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  // undefined, null, NaNの場合は¥0を返す
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '¥0';
  }
  
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * 日付を日本語形式でフォーマット
 * @param date 日付文字列またはDateオブジェクト
 * @param format フォーマット形式
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  let d: Date;
  
  if (!date) {
    return '---';
  }
  
  if (typeof date === 'string') {
    // 文字列の場合、形式に応じて適切に解析
    if (date.includes('T')) {
      // ISO形式の日時文字列
      d = new Date(date);
    } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // YYYY-MM-DD形式の日付文字列
      // 日本時間として解釈するため、時刻を追加
      d = new Date(`${date}T00:00:00`);
    } else {
      // その他の形式
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  if (isNaN(d.getTime())) {
    return '---';
  }
  
  switch (format) {
    case 'long':
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(d);
    case 'time':
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(d);
    case 'short':
    default:
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(d);
  }
};

/**
 * パーセンテージをフォーマット
 * @param value 値
 * @param decimals 小数点以下の桁数
 * @returns フォーマットされたパーセンテージ文字列
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * 数値を千単位でフォーマット
 * @param value 値
 * @returns フォーマットされた数値文字列
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ja-JP').format(value);
};

/**
 * 金額を円記号付きでフォーマット（小数点なし）
 * @param amount 金額
 * @returns フォーマットされた金額文字列（例: ¥1,234）
 */
export const formatAmount = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '¥0';
  }
  
  const roundedAmount = Math.floor(amount);
  return `¥${new Intl.NumberFormat('ja-JP').format(roundedAmount)}`;
};

