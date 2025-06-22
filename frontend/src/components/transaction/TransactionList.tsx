import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, PaginatedTransactions } from '../../types/transaction';
import { TransactionCard } from './TransactionCard';
import { SkeletonTransactionList } from '../common/Skeleton';
import styles from './TransactionList.module.scss';

interface TransactionListProps {
  fetchTransactions: (page: number) => Promise<PaginatedTransactions>;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  filters?: any;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  fetchTransactions,
  onEdit,
  onDelete,
  filters,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTransactionElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    // フィルターが変更されたら最初のページから読み込み直す
    if (page === 1) {
      loadTransactions();
    } else {
      setPage(1);
      setTransactions([]);
      setHasMore(true);
    }
  }, [filters]);

  useEffect(() => {
    if (page > 1) {
      loadTransactions();
    }
  }, [page]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTransactions(page);
      
      // デバッグ: 最初の取引データを確認
      if (response.transactions.length > 0) {
        console.log('[TransactionList] First transaction data:', response.transactions[0]);
        console.log('[TransactionList] Date fields:', {
          transaction_date: response.transactions[0].transaction_date,
          transactionDate: response.transactions[0].transactionDate,
          created_at: response.transactions[0].created_at,
          createdAt: response.transactions[0].createdAt
        });
      }
      
      if (page === 1) {
        setTransactions(response.transactions);
      } else {
        setTransactions((prev) => [...prev, ...response.transactions]);
      }
      
      setHasMore(response.pagination.has_next);
    } catch (err) {
      setError('取引の読み込みに失敗しました');
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setTransactions([]);
    setHasMore(true);
    setIsInitialLoading(true);
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach((transaction) => {
      // transaction_dateまたはtransactionDateを使用（camelCase対応）
      let dateStr = transaction.transaction_date || transaction.transactionDate || '';
      
      // もしtransaction_dateが存在しない場合、created_atを使用
      if (!dateStr && (transaction.created_at || transaction.createdAt)) {
        dateStr = transaction.created_at || transaction.createdAt || '';
      }
      
      // デバッグ: 日付文字列を確認
      console.log('[TransactionList] Processing date:', dateStr, 'for transaction:', transaction.id);
      
      let date: Date;
      
      // 日付文字列の解析を改善
      if (!dateStr) {
        date = new Date(); // デフォルトで今日の日付
      } else if (dateStr.includes('T')) {
        // ISO形式の日時文字列の場合
        date = new Date(dateStr);
      } else {
        // YYYY-MM-DD形式の日付文字列の場合
        // 日本時間として解釈するため、時刻を追加
        date = new Date(`${dateStr}T00:00:00`);
      }
      
      // 日付が無効な場合のフォールバック
      const key = isNaN(date.getTime()) 
        ? '日付不明' 
        : date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(transaction);
    });
    
    return groups;
  };


  const groupedTransactions = groupTransactionsByDate(transactions);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={handleRefresh} className={styles.retryButton}>
          再試行
        </button>
      </div>
    );
  }

  if (isInitialLoading) {
    return <SkeletonTransactionList count={10} />;
  }

  if (!isLoading && transactions.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>💸</div>
        <h3 className={styles.emptyTitle}>取引がまだありません</h3>
        <p className={styles.emptyDescription}>
          最初の取引を記録して、お金の管理を始めましょう！
        </p>
      </div>
    );
  }

  return (
    <div className={styles.transactionList}>
      {Object.entries(groupedTransactions).map(([date, dayTransactions], groupIndex) => (
        <div key={date} className={styles.dateGroup}>
          <div className={styles.dateHeader}>
            <h3 className={styles.date}>{date}</h3>
          </div>
          
          <div className={styles.transactions}>
            {dayTransactions.map((transaction, index) => {
              const isLastTransaction =
                groupIndex === Object.keys(groupedTransactions).length - 1 &&
                index === dayTransactions.length - 1;
              
              return (
                <div
                  key={transaction.id}
                  ref={isLastTransaction ? lastTransactionElementRef : null}
                >
                  <TransactionCard
                    transaction={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {isLoading && !isInitialLoading && (
        <SkeletonTransactionList count={3} />
      )}
      
      {!hasMore && transactions.length > 0 && (
        <div className={styles.endMessage}>
          <p>すべての取引を表示しました 💕</p>
        </div>
      )}
    </div>
  );
};