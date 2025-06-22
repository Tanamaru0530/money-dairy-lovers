import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { LoginRequest } from '@/types/auth'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AuthForm.module.scss'

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    try {
      setError('')
      await login(data)
      navigate('/dashboard')
    } catch (err: any) {
      // APIクライアントで付加されたuserMessageを優先的に使用
      const errorMessage = err.response?.data?.userMessage || 
                          err.response?.data?.detail || 
                          err.message ||
                          'ログインに失敗しました'
      setError(errorMessage)
    }
  }

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
        <h2 className={styles.title}>
          <span className={styles.icon}>💕</span>
          Money Dairy Lovers
        </h2>
        <p className={styles.subtitle}>愛を育む家計簿アプリ</p>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            {...register('email', {
              required: 'メールアドレスを入力してください',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '有効なメールアドレスを入力してください',
              },
            })}
            placeholder="love@example.com"
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            {...register('password', {
              required: 'パスワードを入力してください',
            })}
            placeholder="••••••••"
          />
          {errors.password && (
            <span className={styles.fieldError}>{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </button>

        <div className={styles.links}>
          {/* TODO: Implement forgot password functionality */}
          {/* <Link to="/forgot-password" className={styles.link}>
            パスワードをお忘れですか？
          </Link> */}
          <Link to="/auth/register" className={styles.link}>
            新規登録はこちら 💝
          </Link>
        </div>
      </form>
    </div>
  )
}