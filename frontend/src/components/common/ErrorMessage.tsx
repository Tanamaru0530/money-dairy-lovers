import React from 'react';
import { Button } from './Button';
import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
  isRetryable?: boolean;
  suggestedAction?: string | null;
  fullPage?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onClose,
  onRetry,
  type = 'error',
  isRetryable = false,
  suggestedAction,
  fullPage = false
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

  const content = (
    <>
      <span className={styles.icon}>{getIcon()}</span>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        {suggestedAction && (
          <p className={styles.suggestion}>{suggestedAction}</p>
        )}
      </div>
      {(isRetryable || onRetry) && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className={styles.retryButton}
        >
          再試行
        </Button>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="エラーを閉じる"
        >
          ✕
        </button>
      )}
    </>
  );

  if (fullPage) {
    return (
      <div className={styles.fullPageError}>
        <div className={`${styles.errorMessage} ${styles[type]}`}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.errorMessage} ${styles[type]}`}>
      {content}
    </div>
  );
};