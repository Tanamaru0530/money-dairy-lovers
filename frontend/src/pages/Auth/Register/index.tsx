import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService, { RegisterData } from '../../../services/authService';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import styles from './Register.module.scss';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  agreeToTerms: boolean;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        display_name: data.displayName,
        love_theme_preference: 'default', // テーマは凍結されたのでデフォルト固定
      };

      await authService.register(registerData);
      
      // 登録後、自動的にログイン
      await authService.login({
        email: data.email,
        password: data.password,
      });

      // メール確認画面へ遷移
      navigate('/auth/verify-email');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response details:', JSON.stringify(err.response?.data, null, 2));
      
      if (err.response?.status === 400) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string' && detail.includes('already exists')) {
          setError('このメールアドレスは既に登録されています 💔');
        } else {
          setError('入力内容に誤りがあります。確認してください。');
        }
      } else if (err.response?.status === 422) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // FastAPIのバリデーションエラーは配列形式で返される
          const errorMessages = detail.map((error: any) => {
            const field = error.loc?.[error.loc.length - 1] || 'unknown';
            return `${field}: ${error.msg}`;
          }).join(', ');
          setError(`入力エラー: ${errorMessages}`);
        } else {
          setError('入力内容に誤りがあります。確認してください。');
        }
      } else {
        setError('登録に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['register-page']}>
      <div className={styles['register-container']}>
        <div className={styles['register-card']}>
          <div className={styles['register-header']}>
            <h1 className={styles['register-title']}>
              <span className={styles['love-gradient']}>愛の記録を始めましょう</span>
            </h1>
            <p className={styles['register-subtitle']}>
              二人の未来のために、今日から始める家計管理 💕
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles['register-form']}>
            {error && (
              <div className={styles['error-banner']}>
                {error}
              </div>
            )}

            <Input
              type="text"
              label="お名前（ニックネーム）"
              placeholder="愛称を入力"
              isLoveThemed
              icon="👤"
              error={errors.displayName?.message}
              {...register('displayName', {
                required: 'お名前を入力してください',
                maxLength: {
                  value: 50,
                  message: 'お名前は50文字以内で入力してください',
                },
              })}
            />

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

            <Input
              type="password"
              label="パスワード"
              placeholder="8文字以上の安全なパスワード"
              isLoveThemed
              icon="🔐"
              error={errors.password?.message}
              helpText="大文字・小文字・数字・特殊文字を含む8文字以上"
              {...register('password', {
                required: 'パスワードを入力してください',
                minLength: {
                  value: 8,
                  message: 'パスワードは8文字以上で入力してください',
                },
                validate: {
                  hasUpperCase: (value) => /[A-Z]/.test(value) || '大文字を含む必要があります',
                  hasLowerCase: (value) => /[a-z]/.test(value) || '小文字を含む必要があります',
                  hasNumber: (value) => /\d/.test(value) || '数字を含む必要があります',
                  hasSpecialChar: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value) || '特殊文字(!@#$%^&*など)を含む必要があります',
                },
              })}
            />

            <Input
              type="password"
              label="パスワード（確認）"
              placeholder="もう一度パスワードを入力"
              isLoveThemed
              icon="🔐"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'パスワード（確認）を入力してください',
                validate: (value) => value === password || 'パスワードが一致しません',
              })}
            />


            <label className={styles['terms-checkbox']}>
              <input
                type="checkbox"
                {...register('agreeToTerms', {
                  required: '利用規約に同意してください',
                })}
                className={styles['checkbox']}
              />
              <span>
                <Link to="/terms" className={styles['terms-link']}>利用規約</Link>
                と
                <Link to="/privacy" className={styles['terms-link']}>プライバシーポリシー</Link>
                に同意します
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className={styles['terms-error']}>{errors.agreeToTerms.message}</span>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              variant="love-special"
              icon="✨"
              iconPosition="right"
            >
              愛の記録を開始する
            </Button>

            <div className={styles['login-section']}>
              <p>既にアカウントをお持ちの方は</p>
              <Link to="/auth/login" className={styles['login-link']}>
                ログインはこちら
              </Link>
            </div>
          </form>
        </div>

        <div className={styles['features-section']}>
          <h2 className={styles['features-title']}>
            Money Dairy Lovers でできること
          </h2>
          <div className={styles['features-list']}>
            <div className={styles['feature-item']}>
              <span className={styles['feature-icon']}>💕</span>
              <div>
                <h3>愛の支出を記録</h3>
                <p>デート代や記念日の支出を特別に管理</p>
              </div>
            </div>
            <div className={styles['feature-item']}>
              <span className={styles['feature-icon']}>👫</span>
              <div>
                <h3>共有支出の管理</h3>
                <p>二人の支出を公平に分割・記録</p>
              </div>
            </div>
            <div className={styles['feature-item']}>
              <span className={styles['feature-icon']}>🎯</span>
              <div>
                <h3>共同目標の設定</h3>
                <p>結婚資金や旅行など、二人の夢を実現</p>
              </div>
            </div>
            <div className={styles['feature-item']}>
              <span className={styles['feature-icon']}>📊</span>
              <div>
                <h3>Love Analytics</h3>
                <p>愛の統計で二人の関係を見える化</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};