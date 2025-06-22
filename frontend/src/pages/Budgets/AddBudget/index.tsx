import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Navigation } from '../../../components/common/Navigation'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorMessage } from '../../../components/common/ErrorMessage'
import { budgetService } from '../../../services/budgetService'
import { categoryService } from '../../../services/categoryService'
import { partnershipService } from '../../../services/partnershipService'
import { ValidationRules } from '../../../utils/validation'
import { useAsyncOperation } from '../../../hooks/useAsyncOperation'
// import { toast } from 'react-hot-toast'
import type { BudgetCreate, BudgetUpdate } from '../../../types/budget'
import type { Category } from '../../../types/category'
import type { PartnershipStatus } from '../../../types/user'
import styles from './AddBudget.module.scss'

interface FormData {
  name: string
  amount: number
  period: 'monthly' | 'yearly' | 'custom'
  start_date: string
  end_date?: string
  category_id?: string
  alert_threshold: number
  is_love_budget: boolean
  is_shared: boolean
}

export const AddBudget: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  
  const [categories, setCategories] = useState<Category[]>([])
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const { execute, isLoading, error, reset: clearError } = useAsyncOperation()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      period: 'monthly',
      alert_threshold: 80,
      is_love_budget: false,
      is_shared: false,
      start_date: new Date().toISOString().split('T')[0]
    }
  })
  
  const period = watch('period')
  const isShared = watch('is_shared')
  
  useEffect(() => {
    loadInitialData()
  }, [id])
  
  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      
      // カテゴリを取得
      const categoriesData = await categoryService.getCategories()
      setCategories(categoriesData.categories || [])
      
      // パートナーシップ状態を取得
      try {
        const status = await partnershipService.getStatus()
        setPartnershipStatus(status)
      } catch (error) {
        console.log('No partnership found')
      }
      
      // 編集モードの場合、既存の予算データを取得
      if (isEdit && id) {
        const budget = await budgetService.getBudget(id)
        setValue('name', budget.name)
        setValue('amount', budget.amount)
        setValue('period', budget.period)
        setValue('start_date', budget.start_date)
        setValue('end_date', budget.end_date || '')
        setValue('category_id', budget.category_id || '')
        setValue('alert_threshold', budget.alert_threshold)
        setValue('is_love_budget', budget.is_love_budget)
        setValue('is_shared', !!budget.partnership_id)
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoadingData(false)
    }
  }
  
  const onSubmit = async (data: FormData) => {
    await execute(
      async () => {
        const budgetData: BudgetCreate = {
          name: data.name,
          amount: Number(data.amount),
          period: data.period,
          start_date: data.start_date,
          end_date: data.period === 'custom' && data.end_date ? data.end_date : undefined,
          category_id: data.category_id || undefined,
          alert_threshold: data.alert_threshold,
          is_love_budget: data.is_love_budget,
          partnership_id: data.is_shared && partnershipStatus?.partnership?.id 
            ? partnershipStatus.partnership.id 
            : undefined
        }
        
        if (isEdit && id) {
          const updateData: BudgetUpdate = {
            name: budgetData.name,
            amount: budgetData.amount,
            end_date: budgetData.end_date,
            alert_threshold: budgetData.alert_threshold
          }
          await budgetService.updateBudget(id, updateData)
          console.log('予算を更新しました 💕')
        } else {
          await budgetService.createBudget(budgetData)
          console.log('予算を作成しました 💕')
        }
        
        navigate('/budgets')
      },
      {
        successMessage: isEdit ? '予算を更新しました 💕' : '予算を作成しました 💕',
        errorMessage: '予算の保存に失敗しました'
      }
    )
  }
  
  const loveCategories = Array.isArray(categories) ? categories.filter(c => c.is_love_category) : []
  
  if (loadingData) {
    return (
      <div className={styles.addBudgetPage}>
        <Navigation />
        <LoadingSpinner message="予算データを読み込んでいます..." />
      </div>
    )
  }
  
  return (
    <div className={styles.addBudgetPage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            💰 {isEdit ? '予算を編集' : '新しい予算を作成'}
          </h1>
          <p className={styles.pageSubtitle}>
            支出をコントロールして、目標を達成しましょう
          </p>
        </div>
        
        {error && (
          <ErrorMessage 
            message={error.message || 'エラーが発生しました'}
            onClose={clearError}
          />
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.budgetForm}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.icon}>📝</span>
              基本情報
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                予算名 <span className={styles.required}>*</span>
              </label>
              <input
                {...register('name', { 
                  required: '予算名を入力してください',
                  validate: {
                    maxLength: (value) => ValidationRules.maxLength(value, 100, '予算名') || true
                  }
                })}
                type="text"
                id="name"
                className={styles.input}
                placeholder="例：今月の食費予算"
              />
              {errors.name && (
                <span className={styles.error}>{errors.name.message}</span>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="amount" className={styles.label}>
                予算金額 <span className={styles.required}>*</span>
              </label>
              <div className={styles.amountInput}>
                <span className={styles.currency}>¥</span>
                <input
                  {...register('amount', { 
                    required: '金額を入力してください',
                    validate: {
                      positive: (value) => ValidationRules.positiveNumber(value, '予算金額') || true,
                      range: (value) => ValidationRules.numberRange(value, 1, 99999999, '予算金額') || true
                    },
                    valueAsNumber: true
                  })}
                  type="number"
                  id="amount"
                  className={styles.input}
                  placeholder="50000"
                />
              </div>
              {errors.amount && (
                <span className={styles.error}>{errors.amount.message}</span>
              )}
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="period" className={styles.label}>
                  期間 <span className={styles.required}>*</span>
                </label>
                <select
                  {...register('period')}
                  id="period"
                  className={styles.select}
                >
                  <option value="monthly">月次</option>
                  <option value="yearly">年次</option>
                  <option value="custom">カスタム</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="category_id" className={styles.label}>
                  カテゴリ
                </label>
                <select
                  {...register('category_id')}
                  id="category_id"
                  className={styles.select}
                >
                  <option value="">全体予算</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {period === 'custom' && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="start_date" className={styles.label}>
                    開始日 <span className={styles.required}>*</span>
                  </label>
                  <input
                    {...register('start_date', { required: '開始日を選択してください' })}
                    type="date"
                    id="start_date"
                    className={styles.input}
                  />
                  {errors.start_date && (
                    <span className={styles.error}>{errors.start_date.message}</span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="end_date" className={styles.label}>
                    終了日
                  </label>
                  <input
                    {...register('end_date')}
                    type="date"
                    id="end_date"
                    className={styles.input}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.icon}>⚙️</span>
              詳細設定
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="alert_threshold" className={styles.label}>
                アラート閾値（%）
              </label>
              <input
                {...register('alert_threshold', {
                  validate: {
                    range: (value) => ValidationRules.numberRange(value, 0, 100, 'アラート閾値') || true
                  },
                  valueAsNumber: true
                })}
                type="number"
                id="alert_threshold"
                className={styles.input}
                placeholder="80"
              />
              <p className={styles.help}>
                予算の何%に達したらアラートを表示するか設定します
              </p>
              {errors.alert_threshold && (
                <span className={styles.error}>{errors.alert_threshold.message}</span>
              )}
            </div>
            
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  {...register('is_love_budget')}
                  type="checkbox"
                />
                <span className={styles.checkboxLabel}>
                  💕 Love予算として設定
                </span>
              </label>
              <p className={styles.help}>
                デート代やプレゼント代など、愛に関する予算として管理します
              </p>
            </div>
            
            {partnershipStatus?.has_partner && (
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    {...register('is_shared')}
                    type="checkbox"
                  />
                  <span className={styles.checkboxLabel}>
                    👫 パートナーと共有
                  </span>
                </label>
                <p className={styles.help}>
                  この予算をパートナーと共有して管理します
                </p>
              </div>
            )}
          </div>
          
          {loveCategories.length > 0 && (
            <div className={styles.loveSuggestion}>
              <h3>💕 Love予算のおすすめカテゴリ</h3>
              <div className={styles.loveCategoryList}>
                {loveCategories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setValue('category_id', category.id)
                      setValue('is_love_budget', true)
                    }}
                    className={styles.loveCategoryButton}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate('/budgets')}
              className={styles.cancelButton}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? '保存中...' : isEdit ? '更新する' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}