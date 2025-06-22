import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/AuthContext';
import { useToastContext } from '../../../contexts/ToastContext';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { ValidationRules } from '../../../utils/validation';
import styles from './Login.module.scss';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToastContext();
  const { error, isLoading, handleError, clearError } = useErrorHandler();
  
  // デバッグ用ログ
  React.useEffect(() => {
    console.log('[Login] Error state:', error);
    console.log('[Login] isLoading:', isLoading);
  }, [error, isLoading]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      
      await login({
        email: data.email,
        password: data.password,
      });
      
      // ログイン成功後、ダッシュボードへ遷移
      toast.success('ログインしました 💕');
      navigate('/dashboard');
    } catch (err: any) {
      console.log('Login error details:', {
        error: err,
        response: err.response,
        responseData: err.response?.data,
        userMessage: err.response?.data?.userMessage,
      });
      handleError(err);
    }
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-container']}>
        <div className={styles['login-card']}>
          <div className={styles['login-header']}>
            <h1 className={styles['login-title']}>
              <span className={styles['love-gradient']}>おかえりなさい</span>
            </h1>
            <p className={styles['login-subtitle']}>
              愛する人との大切な記録を続けましょう 💕
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles['login-form']}>
            {error && (
              <ErrorMessage 
                message={error.message} 
                onClose={clearError}
              />
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
                validate: {
                  email: (value) => ValidationRules.email(value) || true
                }
              })}
            />

            <Input
              type="password"
              label="パスワード"
              placeholder="あなたの秘密のパスワード"
              isLoveThemed
              icon="🔐"
              error={errors.password?.message}
              {...register('password', {
                required: 'パスワードを入力してください',
                validate: {
                  minLength: (value) => ValidationRules.minLength(value, 8, 'パスワード') || true
                }
              })}
            />

            <div className={styles['form-options']}>
              <label className={styles['remember-me']}>
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className={styles['checkbox']}
                />
                <span>ログイン状態を保持する 💝</span>
              </label>
              
              <Link to="/auth/forgot-password" className={styles['forgot-link']}>
                パスワードを忘れた方はこちら
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              loveAnimation="heartbeat"
              icon="💕"
              iconPosition="right"
            >
              ログイン
            </Button>

            <div className={styles['divider']}>
              <span>または</span>
            </div>

            <div className={styles['register-section']}>
              <p>まだアカウントをお持ちでない方は</p>
              <Link to="/auth/register" className={styles['register-link']}>
                <Button
                  type="button"
                  variant="outline-love"
                  fullWidth
                  icon="✨"
                >
                  新規登録して愛を記録する
                </Button>
              </Link>
            </div>
          </form>
        </div>

        <div className={styles['love-decoration']}>
          <div className={styles['floating-hearts']}>
            <span className={styles['heart']}>💕</span>
            <span className={styles['heart']}>💝</span>
            <span className={styles['heart']}>💖</span>
            <span className={styles['heart']}>💗</span>
          </div>
          <p className={styles['love-quote']}>
            "愛とお金、どちらも大切に育てていきましょう"
          </p>
        </div>
      </div>
    </div>
  );
};