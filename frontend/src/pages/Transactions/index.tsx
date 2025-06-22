import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { TransactionList } from '../../components/transaction/TransactionList';
import { TransactionFilters } from '../../components/transaction/TransactionFilters';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { TransactionFilter, PaginatedTransactions, TransactionStats } from '../../types/transaction';
import { CategoryWithStats } from '../../types/category';
import { Skeleton } from '../../components/common/Skeleton';
import styles from './Transactions.module.scss';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [monthlyStats, setMonthlyStats] = useState<TransactionStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadCategories();
    loadMonthlyStats();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories(false);
      console.log('[Transactions] Categories data:', data);
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      setIsLoadingStats(true);
      const now = new Date();
      const stats = await transactionService.getMonthlyStats(now.getFullYear(), now.getMonth() + 1);
      setMonthlyStats(stats);
    } catch (error) {
      console.error('Failed to load monthly stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchTransactions = useCallback(
    async (page: number): Promise<PaginatedTransactions> => {
      const response = await transactionService.getTransactions(page, filters);
      // デバッグ: APIレスポンスの構造を確認
      if (response.transactions && response.transactions.length > 0) {
        console.log('API Response - First transaction:', response.transactions[0]);
        console.log('Transaction date field:', response.transactions[0].transaction_date);
        console.log('Transaction date field (camel):', response.transactions[0].transactionDate);
      }
      return response;
    },
    [filters]
  );

  const handleEdit = (transaction: any) => {
    navigate(`/transactions/edit/${transaction.id}`);
  };

  const handleDelete = async (transactionId: string) => {
    try {
      await transactionService.deleteTransaction(transactionId);
      // リストを再読み込み（TransactionListコンポーネントに通知する方法を実装）
      window.location.reload(); // 簡易的な実装
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('取引の削除に失敗しました');
    }
  };

  const handleFilterChange = (newFilters: TransactionFilter) => {
    setFilters(newFilters);
  };

  const formatAmount = (amount: number | undefined) => {
    return Math.floor(amount || 0).toLocaleString('ja-JP');
  };

  return (
    <PageLayout>
      <div className={styles.transactionsPage}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>💰 取引履歴</h1>
          <div className={styles.headerActions}>
            <Link to="/transactions/add" className={styles.addButton}>
              <span className={styles.addIcon}>➕</span>
              新規登録
            </Link>
          </div>
        </div>

      {isLoadingStats ? (
        <div className={styles.monthlyStats}>
          <Skeleton variant="text" width="30%" height={28} style={{ marginBottom: 16 }} />
          <div className={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.statCard}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="60%" height={16} style={{ marginTop: 8 }} />
                <Skeleton variant="text" width="80%" height={24} style={{ marginTop: 4 }} />
              </div>
            ))}
          </div>
          <div className={styles.statDetails}>
            <Skeleton variant="text" width="45%" height={16} />
            <Skeleton variant="text" width="45%" height={16} />
          </div>
        </div>
      ) : monthlyStats && (
        <div className={styles.monthlyStats}>
          <h2 className={styles.statsTitle}>
            {monthlyStats.year}年{monthlyStats.month}月の収支
          </h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statLabel}>収入</div>
              <div className={`${styles.statValue} ${styles.income}`}>
                +¥{formatAmount(monthlyStats.totalIncome || monthlyStats.total_income)}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💸</div>
              <div className={styles.statLabel}>支出</div>
              <div className={`${styles.statValue} ${styles.expense}`}>
                -¥{formatAmount(monthlyStats.totalExpense || monthlyStats.total_expense)}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statLabel}>収支</div>
              <div className={`${styles.statValue} ${(monthlyStats.balance || 0) >= 0 ? styles.positive : styles.negative}`}>
                {(monthlyStats.balance || 0) >= 0 ? '+' : ''}¥{formatAmount(Math.abs(monthlyStats.balance || 0))}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💕</div>
              <div className={styles.statLabel}>Love支出</div>
              <div className={`${styles.statValue} ${styles.love}`}>
                ¥{formatAmount(monthlyStats.loveExpense || monthlyStats.love_expense)}
              </div>
            </div>
          </div>
          <div className={styles.statDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>個人支出:</span>
              <span className={styles.detailValue}>¥{formatAmount(monthlyStats.personalExpense || monthlyStats.personal_expense)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>共有支出:</span>
              <span className={styles.detailValue}>¥{formatAmount(monthlyStats.sharedExpense || monthlyStats.shared_expense)}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filtersSection}>
        <TransactionFilters
          categories={categories}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      <div className={styles.transactionListSection}>
        <TransactionList
          fetchTransactions={fetchTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          filters={filters}
        />
      </div>
    </div>
    </PageLayout>
  );
};