import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '../../../services/authService';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import styles from '../Login/Login.module.scss';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.requestPasswordReset(data.email);
      setSuccess(true);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('このメールアドレスは登録されていません');
      } else {
        setError('エラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles['login-page']}>
        <div className={styles['login-container']}>
          <div className={styles['login-card']}>
            <div className={styles['login-header']}>
              <h1 className={styles['login-title']}>
                <span className={styles['love-gradient']}>メールを送信しました 💌</span>
              </h1>
              <p className={styles['login-subtitle']}>
                パスワードリセットの手順をメールでお送りしました。
                メールボックスをご確認ください。
              </p>
            </div>

            <div className={styles['login-form']}>
              <Link to="/auth/login">
                <Button
                  type="button"
                  fullWidth
                  size="lg"
                  variant="outline-love"
                  icon="←"
                  iconPosition="left"
                >
                  ログイン画面に戻る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-container']}>
        <div className={styles['login-card']}>
          <div className={styles['login-header']}>
            <h1 className={styles['login-title']}>
              <span className={styles['love-gradient']}>パスワードリセット 💔</span>
            </h1>
            <p className={styles['login-subtitle']}>
              登録したメールアドレスを入力してください。
              パスワードリセットの手順をお送りします。
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles['login-form']}>
            {error && (
              <div className={styles['error-banner']}>
                {error}
              </div>
            )}

            <Input
              type="email"
              label="メールアドレス"
              placeholder="love@example.com"
              isLoveThemed
              icon="📧"
              error={errors.email?.message}
              {...register('email', {
                required: 'メールアドレスを入力してください',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '有効なメールアドレスを入力してください',
                },
              })}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              variant="love-special"
              icon="📧"
              iconPosition="right"
            >
              リセットメールを送信
            </Button>

            <div className={styles['register-section']}>
              <Link to="/auth/login" className={styles['register-link']}>
                ← ログイン画面に戻る
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};