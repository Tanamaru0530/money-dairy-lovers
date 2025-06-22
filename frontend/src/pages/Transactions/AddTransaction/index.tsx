import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/common/Navigation';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { transactionService } from '@/services/transactionService';
import { categoryService } from '@/services/categoryService';
import { TransactionFormData } from '@/types/transaction';
import { CategoryWithStats } from '@/types/category';
import { useToastContext } from '@/contexts/ToastContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import styles from './AddTransaction.module.scss';

export const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const { error, isLoading, executeAsync, clearError } = useErrorHandler();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    await executeAsync(
      async () => {
        const data = await categoryService.getCategories(false);
        setCategories(data.categories);
      },
      {
        onError: () => {
          toast.error('カテゴリの読み込みに失敗しました');
        }
      }
    );
    setLoadingCategories(false);
  };

  const handleSubmit = async (data: TransactionFormData) => {
    await executeAsync(
      async () => {
        await transactionService.createTransaction(data);
        toast.success('取引を登録しました 💕');
        navigate('/dashboard');
      },
      {
        onError: () => {
          toast.error('取引の登録に失敗しました');
        }
      }
    );
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loadingCategories) {
    return (
      <div className={styles.addTransactionPage}>
        <Navigation />
        <div className={styles.pageWrapper}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>💕</div>
            <p>愛を込めて準備中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.addTransactionPage}>
      <Navigation />
      
      <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
          <button onClick={handleCancel} className={styles.backButton}>
            ← 戻る
          </button>
          <h1 className={styles.pageTitle}>💝 新しい取引を登録</h1>
        </div>

        <div className={styles.pageContent}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>取引情報を入力してください</h2>
            <p className={styles.formSubtitle}>
              大切な思い出も一緒に記録しましょう 💕
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
          />
        </div>

        <div className={styles.tips}>
          <h3 className={styles.tipsTitle}>💡 ヒント</h3>
          <ul className={styles.tipsList}>
            <li>レシートの写真を撮って保存できます</li>
            <li>共有支出は自動的にパートナーと分割されます</li>
            <li>タグを使って取引を分類できます</li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
};