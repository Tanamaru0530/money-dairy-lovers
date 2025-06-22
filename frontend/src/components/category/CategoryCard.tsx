import React from 'react';
import { CategoryWithStats } from '@/types/category';
import { formatAmount } from '@/utils/format';
import { Button } from '@/components/common/Button';
import styles from './CategoryCard.module.scss';

interface CategoryCardProps {
  category: CategoryWithStats;
  isLove?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (category: CategoryWithStats) => void;
  onDelete?: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isLove = false,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={`${styles.categoryCard} ${isLove ? styles.loveCard : ''}`}>
      <div className={styles.cardHeader}>
        <div 
          className={styles.categoryIcon}
          style={{ backgroundColor: category.color || '#e5e7eb' }}
        >
          <span className={styles.iconText}>{category.icon || '📁'}</span>
        </div>
        <h3 className={styles.categoryName}>{category.name}</h3>
        {isLove && <span className={styles.loveBadge}>💕 Love</span>}
      </div>

      <div className={styles.cardBody}>
        {(category.transaction_count || 0) === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyMessage}>まだ取引がありません</span>
          </div>
        ) : (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>取引件数</span>
              <span className={styles.statValue}>
                {category.transaction_count || 0}件
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>合計金額</span>
              <span className={styles.statValue}>
                {formatAmount(category.total_amount || 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {(canEdit || canDelete) && (
        <div className={styles.cardActions}>
          {canEdit && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              icon="✏️"
            >
              編集
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id)}
              icon="🗑️"
              className={styles.deleteButton}
            >
              削除
            </Button>
          )}
        </div>
      )}
    </div>
  );
};