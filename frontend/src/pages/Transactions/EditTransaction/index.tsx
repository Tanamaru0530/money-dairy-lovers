import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '@/components/common/Navigation';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { transactionService } from '@/services/transactionService';
import { categoryService } from '@/services/categoryService';
import { TransactionFormData, Transaction } from '@/types/transaction';
import { CategoryWithStats } from '@/types/category';
import { useToastContext } from '@/contexts/ToastContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import styles from './EditTransaction.module.scss';

export const EditTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToastContext();
  const { error, isLoading, executeAsync, clearError } = useErrorHandler();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    } else {
      navigate('/transactions');
    }
  }, [id]);

  const loadData = async () => {
    setLoadingData(true);
    await executeAsync(
      async () => {
        // カテゴリと取引データを並行して読み込み
        const [categoriesData, transactionData] = await Promise.all([
          categoryService.getCategories(false),
          transactionService.getTransaction(id!)
        ]);
        
        setCategories(categoriesData.categories);
        setTransaction(transactionData);
      },
      {
        onError: () => {
          toast.error('データの読み込みに失敗しました');
          navigate('/transactions');
        }
      }
    );
    setLoadingData(false);
  };

  const handleSubmit = async (data: TransactionFormData) => {
    if (!id) return;

    await executeAsync(
      async () => {
        await transactionService.updateTransaction(id, data);
        toast.success('取引を更新しました 💕');
        navigate('/transactions');
      },
      {
        onError: () => {
          toast.error('取引の更新に失敗しました');
        }
      }
    );
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  if (loadingData) {
    return (
      <div className={styles.editTransactionPage}>
        <Navigation />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>💕</div>
          <p>愛を込めて準備中...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className={styles.editTransactionPage}>
        <Navigation />
        <div className={styles.errorState}>
          <p>取引が見つかりませんでした</p>
          <button onClick={handleCancel} className={styles.backButton}>
            取引一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editTransactionPage}>
      <Navigation />
      
      <div className={styles.pageHeader}>
        <button onClick={handleCancel} className={styles.backButton}>
          ← 戻る
        </button>
        <h1 className={styles.pageTitle}>💝 取引を編集</h1>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>取引情報を編集してください</h2>
            <p className={styles.formSubtitle}>
              大切な思い出も一緒に更新しましょう 💕
            </p>
          </div>

          {error && (
            <ErrorMessage 
              message={error.message}
              onClose={clearError}
            />
          )}

          <TransactionForm
            onSubmit={handleSubmit}
            categories={categories}
            isLoading={isLoading}
            initialData={{
              amount: transaction.amount,
              transaction_type: transaction.transaction_type,
              category_id: transaction.category.id,
              description: transaction.description || '',
              transaction_date: transaction.transaction_date,
              payment_method: transaction.payment_method,
              sharing_type: transaction.sharing_type,
              tags: transaction.tags || [],
              location: transaction.location || '',
              shared_info: transaction.shared_transaction ? {
                split_type: transaction.shared_transaction.split_type,
                user1_amount: transaction.shared_transaction.user1_amount,
                user2_amount: transaction.shared_transaction.user2_amount,
                notes: transaction.shared_transaction.notes || ''
              } : undefined
            }}
          />
        </div>

        <div className={styles.tips}>
          <h3 className={styles.tipsTitle}>💡 ヒント</h3>
          <ul className={styles.tipsList}>
            <li>金額やカテゴリを変更できます</li>
            <li>Love度を更新して、思い出を記録しましょう</li>
            <li>共有設定を変更すると、分割額が再計算されます</li>
            <li>タグを追加・削除して整理できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
};