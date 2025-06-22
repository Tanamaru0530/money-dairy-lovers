import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '読み込み中...', 
  size = 'medium',
  fullScreen = false 
}) => {
  const content = (
    <div className={`${styles.loadingContainer} ${styles[size]}`}>
      <div className={styles.loadingSpinner}>💕</div>
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreenContainer}>
        {content}
      </div>
    );
  }

  return content;
};