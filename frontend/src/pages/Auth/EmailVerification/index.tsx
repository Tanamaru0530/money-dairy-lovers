import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToastContext } from '@/contexts/ToastContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/common/Button';
import styles from './EmailVerification.module.scss';

export const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const toast = useToastContext();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // 未認証の場合はログイン画面へ
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    // 既にメール確認済みの場合はダッシュボードへ
    if (user.emailVerified) {
      toast.info('メールアドレスは既に確認済みです');
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    // カウントダウンタイマー
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // 1文字のみ許可
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // 自動的に次の入力欄へフォーカス
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // バックスペースで前の入力欄へ
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...verificationCode];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setVerificationCode(newCode);
    
    // 最後の入力欄にフォーカス
    const lastIndex = Math.min(pastedData.length - 1, 5);
    const lastInput = document.getElementById(`code-${lastIndex}`);
    lastInput?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('6桁の確認コードを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(code);
      if (response.verified) {
        toast.success('メールアドレスの確認が完了しました！');
        // ユーザー情報を再取得してから遷移
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    try {
      await authService.resendVerificationEmail();
      toast.success('確認コードを再送信しました');
      setTimeLeft(60); // 60秒のクールダウン
      setVerificationCode(['', '', '', '', '', '']); // コードをリセット
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'エラーが発生しました');
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = verificationCode.every(digit => digit !== '');

  return (
    <div className={styles.verificationPage}>
      <div className={styles.verificationContainer}>
        <div className={styles.verificationCard}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>💌</span>
            </div>
            <h1 className={styles.title}>
              メールアドレスの確認
            </h1>
            <p className={styles.subtitle}>
              {user?.email} に送信された6桁の確認コードを入力してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.codeInputContainer}>
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={styles.codeInput}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={!isCodeComplete || isLoading}
              loading={isLoading}
            >
              確認する
            </Button>

            {/* 開発環境用: デバッグボタン */}
            {import.meta.env.VITE_ENVIRONMENT === 'development' && (
              <Button
                type="button"
                variant="outline-love"
                fullWidth
                size="sm"
                onClick={() => {
                  setVerificationCode(['1', '2', '3', '4', '5', '6']);
                  const lastInput = document.getElementById('code-5');
                  lastInput?.focus();
                }}
                style={{ marginTop: '0.5rem' }}
              >
                🔧 開発用: 123456 を入力
              </Button>
            )}
          </form>

          <div className={styles.resendSection}>
            <p className={styles.resendText}>
              確認コードが届きませんか？
            </p>
            {timeLeft > 0 ? (
              <p className={styles.cooldownText}>
                再送信まで {timeLeft}秒
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className={styles.resendButton}
              >
                {isResending ? '送信中...' : '確認コードを再送信'}
              </button>
            )}
          </div>

          <div className={styles.helpSection}>
            <div className={styles.helpItem}>
              <span className={styles.helpIcon}>💡</span>
              <p className={styles.helpText}>
                確認コードは30分間有効です
              </p>
            </div>
            <div className={styles.helpItem}>
              <span className={styles.helpIcon}>📧</span>
              <p className={styles.helpText}>
                迷惑メールフォルダもご確認ください
              </p>
            </div>
            {import.meta.env.VITE_ENVIRONMENT === 'development' && (
              <div className={styles.helpItem} style={{ background: '#fef3c7' }}>
                <span className={styles.helpIcon}>🔧</span>
                <p className={styles.helpText}>
                  開発環境: 確認コードは <strong>123456</strong> です
                </p>
              </div>
            )}
          </div>

          <div className={styles.backLink}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className={styles.skipButton}
            >
              後で確認する
            </button>
          </div>
        </div>

        <div className={styles.decoration}>
          <div className={styles.floatingHearts}>
            <span className={styles.heart}>💕</span>
            <span className={styles.heart}>💌</span>
            <span className={styles.heart}>💝</span>
          </div>
        </div>
      </div>
    </div>
  );
};