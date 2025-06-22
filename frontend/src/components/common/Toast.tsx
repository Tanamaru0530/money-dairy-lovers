import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Toast.module.scss';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ 
  toast, 
  onRemove 
}) => {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove();
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <span className={styles.icon}>{getIcon()}</span>
      <span className={styles.message}>{toast.message}</span>
      <button
        onClick={onRemove}
        className={styles.closeButton}
        aria-label="閉じる"
      >
        ✕
      </button>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ messages, onRemove }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || messages.length === 0) return null;

  return ReactDOM.createPortal(
    <div className={styles.toastContainer}>
      {messages.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};