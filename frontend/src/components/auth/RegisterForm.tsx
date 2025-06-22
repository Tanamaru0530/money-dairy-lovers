import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { RegisterRequest } from '@/types/auth'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AuthForm.module.scss'

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest & { confirmPassword: string }>()

  const password = watch('password')

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    try {
      setError('')
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || '登録に失敗しました')
    }
  }

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
        <h2 className={styles.title}>
          <span className={styles.icon}>💝</span>
          新規登録
        </h2>
        <p className={styles.subtitle}>二人の愛の家計簿を始めましょう</p>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="display_name" className={styles.label}>
            お名前 <span className={styles.required}>*</span>
          </label>
          <input
            id="display_name"
            type="text"
            className={`${styles.input} ${errors.display_name ? styles.inputError : ''}`}
            {...register('display_name', {
              required: 'お名前を入力してください',
              minLength: {
                value: 2,
                message: 'お名前は2文字以上で入力してください',
              },
              maxLength: {
                value: 100,
                message: 'お名前は100文字以内で入力してください',
              },
            })}
            placeholder="田中 太郎"
          />
          {errors.display_name && (
            <span className={styles.fieldError}>{errors.display_name.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            メールアドレス <span className={styles.required}>*</span>
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
            パスワード <span className={styles.required}>*</span>
          </label>
          <input
            id="password"
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            {...register('password', {
              required: 'パスワードを入力してください',
              minLength: {
                value: 8,
                message: 'パスワードは8文字以上で入力してください',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'パスワードは大文字、小文字、数字、特殊文字を含む必要があります',
              },
            })}
            placeholder="••••••••"
          />
          {errors.password && (
            <span className={styles.fieldError}>{errors.password.message}</span>
          )}
          <p className={styles.helpText}>
            8文字以上、大文字・小文字・数字・特殊文字を含む
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            パスワード（確認） <span className={styles.required}>*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            {...register('confirmPassword', {
              required: 'パスワード（確認）を入力してください',
              validate: (value) =>
                value === password || 'パスワードが一致しません',
            })}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <span className={styles.fieldError}>{errors.confirmPassword.message}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? '登録中...' : '登録する'}
        </button>

        <div className={styles.links}>
          <Link to="/login" className={styles.link}>
            すでにアカウントをお持ちの方 💕
          </Link>
        </div>
      </form>
    </div>
  )
}