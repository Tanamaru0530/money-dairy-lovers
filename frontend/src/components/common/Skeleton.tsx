import React from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'button';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  count?: number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  count = 1,
  style
}) => {
  const skeletonStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style
  };

  const skeletonClass = `${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`;

  if (count > 1) {
    return (
      <div className={styles.skeletonWrapper}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={skeletonClass}
            style={skeletonStyle}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={skeletonClass}
      style={skeletonStyle}
    />
  );
};

// 複合スケルトンコンポーネント
interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  lastLineWidth?: string | number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  width = '100%',
  lastLineWidth = '60%'
}) => {
  return (
    <div className={styles.skeletonTextWrapper}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : width}
          height={20}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </div>
  );
};

// カードスケルトン
interface SkeletonCardProps {
  showAvatar?: boolean;
  showActions?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  showActions = false,
  lines = 3
}) => {
  return (
    <div className={styles.skeletonCard}>
      {showAvatar && (
        <div className={styles.skeletonCardHeader}>
          <Skeleton variant="circular" width={40} height={40} />
          <div className={styles.skeletonCardHeaderText}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
        </div>
      )}
      
      <SkeletonText lines={lines} />
      
      {showActions && (
        <div className={styles.skeletonCardActions}>
          <Skeleton variant="button" width={80} height={32} />
          <Skeleton variant="button" width={80} height={32} />
        </div>
      )}
    </div>
  );
};

// ダッシュボード用スケルトン
export const SkeletonDashboardSummary: React.FC = () => {
  return (
    <div className={styles.skeletonDashboardSummary}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={styles.skeletonSummaryCard}>
          <Skeleton variant="circular" width={48} height={48} />
          <div className={styles.skeletonSummaryContent}>
            <Skeleton variant="text" width="80%" height={16} />
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
};

// チャートスケルトン
export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 300 }) => {
  return (
    <div className={styles.skeletonChart}>
      <div className={styles.skeletonChartHeader}>
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="text" width="20%" height={20} />
      </div>
      <Skeleton variant="rectangular" width="100%" height={height} />
    </div>
  );
};

// トランザクションリストスケルトン
export const SkeletonTransactionList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className={styles.skeletonTransactionList}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonTransactionItem}>
          <div className={styles.skeletonTransactionLeft}>
            <Skeleton variant="circular" width={32} height={32} />
            <div className={styles.skeletonTransactionInfo}>
              <Skeleton variant="text" width="80%" height={18} />
              <Skeleton variant="text" width="60%" height={14} />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
          </div>
          <Skeleton variant="text" width={80} height={20} />
        </div>
      ))}
    </div>
  );
};

// Love Goals スケルトン
export const SkeletonLoveGoals: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div className={styles.skeletonLoveGoals}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonGoalItem}>
          <Skeleton variant="text" width="70%" height={18} />
          <div className={styles.skeletonProgressBar}>
            <Skeleton variant="rectangular" width="100%" height={8} />
          </div>
          <div className={styles.skeletonProgressText}>
            <Skeleton variant="text" width="30%" height={14} />
            <Skeleton variant="text" width="30%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
};

// カテゴリカードスケルトン
export const SkeletonCategoryCard: React.FC = () => {
  return (
    <div className={styles.skeletonCategoryCard}>
      <div className={styles.skeletonCategoryHeader}>
        <Skeleton variant="circular" width={48} height={48} />
        <div className={styles.skeletonCategoryInfo}>
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={16} />
        </div>
      </div>
      <div className={styles.skeletonCategoryStats}>
        <div className={styles.skeletonStatItem}>
          <Skeleton variant="text" width="40%" height={14} />
          <Skeleton variant="text" width="60%" height={18} />
        </div>
        <div className={styles.skeletonStatItem}>
          <Skeleton variant="text" width="40%" height={14} />
          <Skeleton variant="text" width="60%" height={18} />
        </div>
      </div>
    </div>
  );
};

// カテゴリグリッドスケルトン
export const SkeletonCategoryGrid: React.FC<{ count?: number; isLove?: boolean }> = ({ 
  count = 6, 
  isLove = false 
}) => {
  return (
    <div className={`${styles.skeletonCategoryGrid} ${isLove ? styles.love : ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCategoryCard key={index} />
      ))}
    </div>
  );
};