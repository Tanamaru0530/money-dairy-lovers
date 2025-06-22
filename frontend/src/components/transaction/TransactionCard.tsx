import React from 'react';
import { Transaction } from '../../types/transaction';
import { formatDate, formatNumber } from '../../utils/format';
import styles from './TransactionCard.module.scss';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const formatAmount = (amount: number) => {
    return formatNumber(Math.floor(amount));
  };

  const getAmountClassName = () => {
    if (transaction.transaction_type === 'income' || transaction.transactionType === 'income') return styles.amountIncome;
    if (transaction.category?.is_love_category || transaction.category?.isLoveCategory) return styles.amountLove;
    return styles.amountExpense;
  };

  const renderLoveRating = () => {
    if (!transaction.love_rating && !transaction.loveRating) return null;

    return (
      <div className={styles.loveRating}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < (transaction.love_rating || transaction.loveRating || 0) ? styles.starActive : styles.starInactive}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('この取引を削除してもよろしいですか？')) {
      onDelete(transaction.id);
    }
  };

  return (
    <div className={`${styles.transactionCard} ${(transaction.category?.is_love_category || transaction.category?.isLoveCategory) ? styles.loveCard : ''}`}>
      <div className={styles.transactionHeader}>
        <div className={styles.transactionCategory}>
          <span className={styles.categoryIcon}>{transaction.category?.icon || '💰'}</span>
          <span className={styles.categoryName}>{transaction.category?.name || 'その他'}</span>
        </div>
        <div className={`${styles.transactionAmount} ${getAmountClassName()}`}>
          {(transaction.transaction_type === 'income' || transaction.transactionType === 'income') ? '+' : '-'}¥{formatAmount(transaction.amount)}
        </div>
      </div>

      <div className={styles.transactionContent}>
        {transaction.description && (
          <p className={styles.transactionDescription}>{transaction.description}</p>
        )}

        <div className={styles.transactionMeta}>
          <div className={styles.transactionDate}>
            {formatDate(
              transaction.transaction_date || 
              transaction.transactionDate || 
              transaction.created_at || 
              transaction.createdAt || 
              ''
            )}
          </div>

          <div className={styles.transactionTags}>
            {(transaction.sharing_type === 'shared' || transaction.sharingType === 'shared') && (
              <span className={`${styles.tag} ${styles.tagShared}`}>
                👫 共有
              </span>
            )}
            {(transaction.payment_method || transaction.paymentMethod) && (
              <span className={styles.tag}>
                {(transaction.payment_method === 'cash' || transaction.paymentMethod === 'cash') && '💵 現金'}
                {(transaction.payment_method === 'credit_card' || transaction.paymentMethod === 'credit_card') && '💳 カード'}
                {(transaction.payment_method === 'bank_transfer' || transaction.paymentMethod === 'bank_transfer') && '🏦 振込'}
                {(transaction.payment_method === 'digital_wallet' || transaction.paymentMethod === 'digital_wallet') && '📱 電子マネー'}
              </span>
            )}
          </div>
        </div>

        {(transaction.shared_transaction || transaction.sharedTransaction) && (
          <div className={styles.sharedInfo}>
            <div className={styles.sharedDetails}>
              <span className={styles.sharedLabel}>支払者:</span>
              <span className={styles.sharedValue}>
                {transaction.payer?.display_name || 'あなた'}
              </span>
            </div>
            {transaction.shared_transaction.split_type === 'equal' && (
              <div className={styles.sharedDetails}>
                <span className={styles.sharedLabel}>分割:</span>
                <span className={styles.sharedValue}>均等割り</span>
              </div>
            )}
            {transaction.shared_transaction.notes && (
              <div className={styles.sharedNotes}>
                💬 {transaction.shared_transaction.notes}
              </div>
            )}
          </div>
        )}

        {renderLoveRating()}

        {transaction.tags && transaction.tags.length > 0 && (
          <div className={styles.customTags}>
            {transaction.tags.map((tag, index) => (
              <span key={index} className={styles.customTag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {transaction.location && (
          <div className={styles.location}>
            📍 {transaction.location}
          </div>
        )}
      </div>

      <div className={styles.transactionActions}>
        {onEdit && (
          <button
            onClick={handleEdit}
            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
          >
            編集
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
};