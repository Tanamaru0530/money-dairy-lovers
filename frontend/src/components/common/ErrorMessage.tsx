import React from 'react';
import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onClose,
  type = 'error' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`${styles.errorMessage} ${styles[type]}`}>
      <span className={styles.icon}>{getIcon()}</span>
      <span className={styles.message}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="エラーを閉じる"
        >
          ✕
        </button>
      )}
    </div>
  );
};