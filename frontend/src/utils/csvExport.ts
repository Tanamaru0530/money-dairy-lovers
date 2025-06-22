import type { Transaction } from '@/types/transaction';
import type { MonthlyReport, YearlyReport } from '@/types/report';

// CSVエスケープ処理
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// 配列をCSV文字列に変換
const arrayToCSV = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.map(escapeCSV).join(',');
  const csvRows = data.map(row => 
    headers.map(header => escapeCSV(row[header])).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
};

// CSVファイルをダウンロード
const downloadCSV = (csv: string, filename: string) => {
  const bom = '\uFEFF'; // UTF-8 BOM
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // URLを解放
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// 取引データをCSVエクスポート
export const exportTransactionsToCSV = (transactions: Transaction[], filename?: string) => {
  const data = transactions.map(transaction => {
    const paymentMethodMap: Record<string, string> = {
      cash: '現金',
      credit_card: 'クレジットカード',
      bank_transfer: '銀行振込',
      digital_wallet: '電子マネー'
    };
    
    return {
      日付: transaction.transaction_date,
      タイプ: transaction.transaction_type === 'income' ? '収入' : '支出',
      カテゴリ: transaction.category?.name || '',
      金額: transaction.amount,
      支払い方法: transaction.payment_method ? paymentMethodMap[transaction.payment_method] || transaction.payment_method : '',
      共有タイプ: transaction.sharing_type === 'shared' ? '共有' : '個人',
      説明: transaction.description || '',
      タグ: transaction.tags?.join('、') || '',
      'Love評価': transaction.love_rating || transaction.loveRating || ''
    };
  });

  const headers = ['日付', 'タイプ', 'カテゴリ', '金額', '支払い方法', '共有タイプ', '説明', 'タグ', 'Love評価'];
  const csv = arrayToCSV(data, headers);
  
  const defaultFilename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename || defaultFilename);
};

// 月次レポートをCSVエクスポート
export const exportMonthlyReportToCSV = (report: MonthlyReport, year: number, month: number) => {
  // サマリーデータ
  const summaryData = [{
    期間: `${year}年${month}月`,
    収入合計: report.total_income || report.totalIncome || 0,
    支出合計: report.total_expense || report.totalExpense || 0,
    収支: report.balance || ((report.total_income || report.totalIncome || 0) - (report.total_expense || report.totalExpense || 0)),
    取引数: report.transaction_count || report.transactionCount || 0,
    日平均支出: report.daily_average_expense || report.dailyAverageExpense || 0,
    個人支出: report.personal_expense || report.personalExpense || 0,
    共有支出: report.shared_expense || report.sharedExpense || 0,
    共有支出割合: `${Math.round(report.shared_percentage || report.sharedPercentage || 0)}%`
  }];

  // カテゴリ別データ（snake_caseとcamelCase両方に対応）
  const expenseByCategory = report.expense_by_category || report.expenseByCategory || [];
  const categoryData = expenseByCategory.map(cat => ({
    カテゴリ: cat.categoryName || '',
    金額: cat.totalAmount || 0,
    割合: `${Math.round(cat.percentage || 0)}%`,
    取引数: cat.transactionCount || 0,
    Love: cat.isLoveCategory ? '○' : ''
  }));

  // CSVを生成
  const summaryHeaders = ['期間', '収入合計', '支出合計', '収支', '取引数', '日平均支出', '個人支出', '共有支出', '共有支出割合'];
  const categoryHeaders = ['カテゴリ', '金額', '割合', '取引数', 'Love'];
  
  const summaryCSV = arrayToCSV(summaryData, summaryHeaders);
  const categoryCSV = arrayToCSV(categoryData, categoryHeaders);
  
  const fullCSV = `【月次サマリー】\n${summaryCSV}\n\n【カテゴリ別支出】\n${categoryCSV}`;
  
  downloadCSV(fullCSV, `monthly_report_${year}_${String(month).padStart(2, '0')}.csv`);
};

// 年次レポートをCSVエクスポート
export const exportYearlyReportToCSV = (report: YearlyReport, year: number) => {
  // 年間サマリー
  const loveStats = report.yearly_love_statistics || report.yearlyLoveStatistics || {};
  const summaryData = [{
    年: year,
    年間収入: report.total_income || report.totalIncome || 0,
    年間支出: report.total_expense || report.totalExpense || 0,
    年間収支: report.total_balance || report.totalBalance || 0,
    月平均収入: Math.round((report.total_income || report.totalIncome || 0) / 12),
    月平均支出: Math.round((report.total_expense || report.totalExpense || 0) / 12),
    最高支出月: report.highest_expense_month || report.highestExpenseMonth || '-',
    最低支出月: report.lowest_expense_month || report.lowestExpenseMonth || '-',
    最高収入月: report.highest_income_month || report.highestIncomeMonth || '-',
    Love支出合計: loveStats.total_love_spending || loveStats.totalLoveSpending || 0,
    Love取引数: loveStats.love_transaction_count || loveStats.loveTransactionCount || 0
  }];

  // 月次トレンド
  const monthlyTrends = report.monthly_trends || report.monthlyTrends || [];
  const monthlyData = monthlyTrends.map(trend => ({
    月: trend.month,
    収入: trend.income,
    支出: trend.expense,
    収支: trend.balance,
    Love支出: trend.love_spending
  }));

  // CSVを生成
  const summaryHeaders = ['年', '年間収入', '年間支出', '年間収支', '月平均収入', '月平均支出', '最高支出月', '最低支出月', '最高収入月', 'Love支出合計', 'Love取引数'];
  const monthlyHeaders = ['月', '収入', '支出', '収支', 'Love支出'];
  
  const summaryCSV = arrayToCSV(summaryData, summaryHeaders);
  const monthlyCSV = arrayToCSV(monthlyData, monthlyHeaders);
  
  const fullCSV = `【年間サマリー】\n${summaryCSV}\n\n【月次トレンド】\n${monthlyCSV}`;
  
  downloadCSV(fullCSV, `yearly_report_${year}.csv`);
};