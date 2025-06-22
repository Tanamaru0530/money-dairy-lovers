import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Navigation } from '@/components/common/Navigation'
import { AmountInput } from '@/components/common/AmountInput'
import { categoryService } from '@/services/categoryService'
import { recurringTransactionService } from '@/services/recurringTransactionService'
import { useToastContext } from '@/contexts/ToastContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import type { CategoryWithStats } from '@/types/category'
import type { RecurringTransactionCreate, RecurringTransactionUpdate } from '@/types/recurringTransaction'
import styles from './AddRecurringTransaction.module.scss'

type FormData = {
  amount: number
  category_id: string
  transaction_type: 'income' | 'expense'
  payment_method: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval_value: number
  day_of_month?: number
  day_of_week?: number
  next_execution_date: string
  end_date?: string
  is_active: boolean
}

export const AddRecurringTransaction: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const toast = useToastContext()
  const { error, isLoading, executeAsync } = useErrorHandler()
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      transaction_type: 'expense',
      payment_method: 'bank_transfer',
      frequency: 'monthly',
      interval_value: 1,
      is_active: true,
      next_execution_date: new Date().toISOString().split('T')[0],
      description: ''
    }
  })

  const frequency = watch('frequency')
  const transactionType = watch('transaction_type')

  useEffect(() => {
    loadCategories()
    if (id) {
      loadRecurringTransaction()
    }
  }, [id])

  const loadCategories = async () => {
    await executeAsync(
      async () => {
        const response = await categoryService.getCategories()
        setCategories(response.categories)
      },
      {
        onError: () => {
          toast.error('カテゴリの読み込みに失敗しました')
        }
      }
    )
  }

  const loadRecurringTransaction = async () => {
    if (!id) return

    await executeAsync(
      async () => {
        const data = await recurringTransactionService.getRecurringTransaction(id)
        setValue('amount', data.amount)
        setValue('category_id', data.category_id)
        setValue('transaction_type', data.transaction_type)
        setValue('payment_method', data.payment_method || 'bank_transfer')
        setValue('description', data.description || '')
        setValue('frequency', data.frequency)
        setValue('interval_value', data.interval_value)
        setValue('day_of_month', data.day_of_month || undefined)
        setValue('day_of_week', data.day_of_week || undefined)
        setValue('next_execution_date', data.next_execution_date)
        setValue('end_date', data.end_date || undefined)
        setValue('is_active', data.is_active)
      },
      {
        onError: () => {
          toast.error('定期取引の読み込みに失敗しました')
          navigate('/recurring-transactions')
        }
      }
    )
  }

  const onSubmit = async (data: FormData) => {
    console.log('[AddRecurringTransaction] Form data:', data)
    console.log('[AddRecurringTransaction] Amount value:', data.amount, typeof data.amount)
    
    await executeAsync(
      async () => {
        const payload: any = {
          amount: data.amount,
          category_id: data.category_id,
          transaction_type: data.transaction_type,
          sharing_type: 'personal', // 定期取引は常に個人
          payment_method: data.payment_method,
          frequency: data.frequency,
          interval_value: data.interval_value,
          next_execution_date: data.next_execution_date,
          is_active: data.is_active
        }
        
        console.log('[AddRecurringTransaction] Payload to send:', payload)
        
        // Optional fields
        if (data.description && data.description.trim()) {
          payload.description = data.description
        }
        if (frequency === 'monthly' && data.day_of_month) {
          payload.day_of_month = data.day_of_month
        }
        if (frequency === 'weekly' && data.day_of_week !== undefined) {
          payload.day_of_week = data.day_of_week
        }
        if (data.end_date) {
          payload.end_date = data.end_date
        }

        if (id) {
          await recurringTransactionService.updateRecurringTransaction(id, payload as RecurringTransactionUpdate)
          toast.success('定期取引を更新しました')
        } else {
          await recurringTransactionService.createRecurringTransaction(payload as RecurringTransactionCreate)
          toast.success('定期取引を作成しました')
        }
        navigate('/recurring-transactions')
      },
      {
        onError: () => {
          toast.error(id ? '定期取引の更新に失敗しました' : '定期取引の作成に失敗しました')
        }
      }
    )
  }


  const filteredCategories = (categories || []).filter(cat => {
    if (transactionType === 'income') {
      return ['給与', 'ボーナス', '副収入', '投資収益', '臨時収入', 'その他収入'].includes(cat.name)
    }
    return !['給与', 'ボーナス', '副収入', '投資収益', '臨時収入', 'その他収入'].includes(cat.name)
  })

  return (
    <div className={styles.addRecurringTransactionPage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <button onClick={() => navigate('/recurring-transactions')} className={styles.backButton}>
            <span className={styles.icon}>←</span>
            戻る
          </button>
          <h1 className={styles.pageTitle}>
            <span className={styles.icon}>🔄</span>
            {id ? '定期取引を編集' : '定期取引を追加'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>基本情報</h2>
            
            <div className={styles.formGroup}>
              <label>取引種別</label>
              <div className={styles.typeButtons}>
                <label className={`${styles.typeButton} ${transactionType === 'expense' ? styles.active : ''}`}>
                  <input
                    type="radio"
                    value="expense"
                    {...register('transaction_type', { required: true })}
                  />
                  <span className={styles.icon}>💸</span>
                  支出
                </label>
                <label className={`${styles.typeButton} ${transactionType === 'income' ? styles.active : ''}`}>
                  <input
                    type="radio"
                    value="income"
                    {...register('transaction_type', { required: true })}
                  />
                  <span className={styles.icon}>💵</span>
                  収入
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount">金額 <span className={styles.required}>*</span></label>
              <Controller
                name="amount"
                control={control}
                rules={{ 
                  required: '金額を入力してください',
                  min: { value: 1, message: '1円以上を入力してください' }
                }}
                render={({ field }) => (
                  <AmountInput
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.amount?.message}
                  />
                )}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category_id">カテゴリ <span className={styles.required}>*</span></label>
              <select
                {...register('category_id', { required: 'カテゴリを選択してください' })}
                className={styles.select}
              >
                <option value="">選択してください</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className={styles.error}>{errors.category_id.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="payment_method">支払い方法</label>
              <select {...register('payment_method')} className={styles.select}>
                <option value="cash">現金</option>
                <option value="credit_card">クレジットカード</option>
                <option value="bank_transfer">銀行振込</option>
                <option value="digital_wallet">電子マネー</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">説明</label>
              <textarea
                {...register('description')}
                className={styles.textarea}
                rows={3}
                placeholder="例: 家賃、電気代、サブスクリプション料金など"
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>スケジュール設定</h2>

            <div className={styles.infoBox}>
              <span className={styles.infoIcon}>ℹ️</span>
              初回実行日から定期実行が開始されます。実行後は自動的に次回実行日が計算されるため、重複実行の心配はありません。
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="frequency">頻度 <span className={styles.required}>*</span></label>
              <select
                {...register('frequency', { required: true })}
                className={styles.select}
              >
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
                <option value="yearly">毎年</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="interval_value">間隔</label>
              <input
                type="number"
                {...register('interval_value', { 
                  required: true,
                  min: { value: 1, message: '1以上を入力してください' }
                })}
                className={styles.input}
                min="1"
              />
              <span className={styles.intervalSuffix}>
                {frequency === 'daily' && '日ごと'}
                {frequency === 'weekly' && '週間ごと'}
                {frequency === 'monthly' && 'ヶ月ごと'}
                {frequency === 'yearly' && '年ごと'}
              </span>
              {errors.interval_value && <span className={styles.error}>{errors.interval_value.message}</span>}
            </div>

            {frequency === 'monthly' && (
              <div className={styles.formGroup}>
                <label htmlFor="day_of_month">毎月の実行日</label>
                <input
                  type="number"
                  {...register('day_of_month', {
                    min: { value: 1, message: '1〜31の値を入力してください' },
                    max: { value: 31, message: '1〜31の値を入力してください' }
                  })}
                  className={styles.input}
                  min="1"
                  max="31"
                  placeholder="例: 25日"
                />
                <span className={styles.helpText}>毎月この日に実行されます</span>
                {errors.day_of_month && <span className={styles.error}>{errors.day_of_month.message}</span>}
              </div>
            )}

            {frequency === 'weekly' && (
              <div className={styles.formGroup}>
                <label htmlFor="day_of_week">実行曜日</label>
                <select {...register('day_of_week')} className={styles.select}>
                  <option value="0">月曜日</option>
                  <option value="1">火曜日</option>
                  <option value="2">水曜日</option>
                  <option value="3">木曜日</option>
                  <option value="4">金曜日</option>
                  <option value="5">土曜日</option>
                  <option value="6">日曜日</option>
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="next_execution_date">初回実行日 <span className={styles.required}>*</span></label>
              <input
                type="date"
                {...register('next_execution_date', { required: '初回実行日を選択してください' })}
                className={styles.input}
                min={new Date().toISOString().split('T')[0]}
              />
              <span className={styles.helpText}>この日から定期実行が開始されます</span>
              {errors.next_execution_date && <span className={styles.error}>{errors.next_execution_date.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="end_date">終了日（オプション）</label>
              <input
                type="date"
                {...register('end_date')}
                className={styles.input}
              />
            </div>


            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className={styles.checkbox}
                />
                有効にする
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate('/recurring-transactions')}
              className={styles.cancelButton}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : (id ? '更新する' : '作成する')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}