import React from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from './Modal'
import styles from './PasswordChangeModal.module.scss'

interface PasswordChangeFormData {
  current_password: string
  new_password: string
  confirm_password: string
}

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { current_password: string; new_password: string }) => Promise<void>
  isLoading?: boolean
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<PasswordChangeFormData>()

  const handleFormSubmit = async (data: PasswordChangeFormData) => {
    await onSubmit({
      current_password: data.current_password,
      new_password: data.new_password
    })
    reset()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="パスワード変更"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="current_password">現在のパスワード</label>
          <input
            {...register('current_password', {
              required: '現在のパスワードを入力してください'
            })}
            type="password"
            className={styles.input}
            placeholder="現在のパスワード"
          />
          {errors.current_password && (
            <span className={styles.error}>{errors.current_password.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="new_password">新しいパスワード</label>
          <input
            {...register('new_password', {
              required: '新しいパスワードを入力してください',
              minLength: {
                value: 8,
                message: 'パスワードは8文字以上で入力してください'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'パスワードは大文字、小文字、数字、特殊文字を含む必要があります'
              }
            })}
            type="password"
            className={styles.input}
            placeholder="新しいパスワード"
          />
          {errors.new_password && (
            <span className={styles.error}>{errors.new_password.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirm_password">新しいパスワード（確認）</label>
          <input
            {...register('confirm_password', {
              required: '確認用パスワードを入力してください',
              validate: value => value === watch('new_password') || 'パスワードが一致しません'
            })}
            type="password"
            className={styles.input}
            placeholder="新しいパスワード（確認）"
          />
          {errors.confirm_password && (
            <span className={styles.error}>{errors.confirm_password.message}</span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? '変更中...' : 'パスワードを変更'}
          </button>
        </div>
      </form>
    </Modal>
  )
}