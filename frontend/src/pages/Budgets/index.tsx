import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../../components/layout/PageLayout'
import { budgetService } from '../../services/budgetService'
import { categoryService } from '../../services/categoryService'
import type { BudgetWithProgress, BudgetSummary } from '../../types/budget'
import type { Category } from '../../types/category'
import styles from './Budgets.module.scss'

export const Budgets: React.FC = () => {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [selectedPeriod, selectedCategory])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // カテゴリを取得
      const categoriesData = await categoryService.getCategories()
      setCategories(categoriesData.categories)
      
      // サマリーを取得
      const summaryData = await budgetService.getBudgetSummary()
      setSummary(summaryData)
      
      // 予算一覧を取得
      const params: any = {}
      if (selectedPeriod !== 'all') params.period = selectedPeriod
      if (selectedCategory !== 'all') params.category_id = selectedCategory
      
      const budgetsData = await budgetService.getBudgets(params)
      setBudgets(budgetsData)
    } catch (error) {
      console.error('Failed to load budgets:', error)
      setError('予算データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.confirm('この予算を削除しますか？')) {
      return
    }
    
    try {
      await budgetService.deleteBudget(budgetId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete budget:', error)
      setError('予算の削除に失敗しました')
    }
  }

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return '全体'
    const category = categories.find(c => c.id === categoryId)
    return category ? `${category.icon} ${category.name}` : 'カテゴリ'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return styles.progressDanger
    if (percentage >= 80) return styles.progressWarning
    return styles.progressSafe
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className={styles.budgetsPage}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>💰</div>
            <p>読み込み中...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className={styles.budgetsPage}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>💰 予算管理</h1>
          <p className={styles.pageSubtitle}>支出をコントロールして、目標を達成しましょう</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* 予算サマリー */}
        {summary && (
          <div className={styles.summarySection}>
            <div className={styles.summaryGrid}>
              <div className={`${styles.summaryCard} ${styles.totalBudget}`}>
                <div className={styles.cardIcon}>💰</div>
                <div className={styles.cardContent}>
                  <h3>総予算</h3>
                  <p className={styles.amount}>¥{(summary.totalBudget || summary.total_budget || 0).toLocaleString()}</p>
                  <p className={styles.meta}>{summary.activeBudgetsCount || summary.active_budgets_count || 0}件のアクティブ予算</p>
                </div>
              </div>
              
              <div className={`${styles.summaryCard} ${styles.totalSpent}`}>
                <div className={styles.cardIcon}>💸</div>
                <div className={styles.cardContent}>
                  <h3>使用済み</h3>
                  <p className={styles.amount}>¥{(summary.totalSpent || summary.total_spent || 0).toLocaleString()}</p>
                  <p className={styles.meta}>{Math.round(summary.overallUsagePercentage || summary.overall_usage_percentage || 0)}%</p>
                </div>
              </div>
              
              <div className={`${styles.summaryCard} ${styles.totalRemaining}`}>
                <div className={styles.cardIcon}>💵</div>
                <div className={styles.cardContent}>
                  <h3>残額</h3>
                  <p className={styles.amount}>¥{(summary.totalRemaining || summary.total_remaining || 0).toLocaleString()}</p>
                  <p className={styles.meta}>あと使える金額</p>
                </div>
              </div>
              
              <div className={`${styles.summaryCard} ${styles.alerts}`}>
                <div className={styles.cardIcon}>
                  {summary.over_budget_count > 0 ? '🚨' : '✅'}
                </div>
                <div className={styles.cardContent}>
                  <h3>アラート</h3>
                  <p className={styles.amount}>{summary.alert_count}件</p>
                  <p className={styles.meta}>
                    {summary.over_budget_count > 0 && `${summary.over_budget_count}件超過`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フィルター */}
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label>期間</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">すべて</option>
              <option value="monthly">月次</option>
              <option value="yearly">年次</option>
              <option value="custom">カスタム</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>カテゴリ</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">すべて</option>
              <option value="">全体予算</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => navigate('/budgets/add')}
            className={styles.addButton}
          >
            <span className={styles.icon}>➕</span>
            予算を追加
          </button>
        </div>

        {/* 予算リスト */}
        <div className={styles.budgetList}>
          {budgets.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💰</div>
              <h3>予算がありません</h3>
              <p>予算を設定して、支出を管理しましょう</p>
              <button 
                onClick={() => navigate('/budgets/add')}
                className={styles.emptyButton}
              >
                最初の予算を作成
              </button>
            </div>
          ) : (
            budgets.map(budget => (
              <div 
                key={budget.id} 
                className={`${styles.budgetCard} ${budget.is_love_budget ? styles.loveBudget : ''}`}
              >
                <div className={styles.budgetHeader}>
                  <div className={styles.budgetInfo}>
                    <h3 className={styles.budgetName}>
                      {budget.is_love_budget && '💕 '}
                      {budget.name}
                    </h3>
                    <p className={styles.budgetCategory}>
                      {getCategoryName(budget.category_id)}
                    </p>
                  </div>
                  <div className={styles.budgetPeriod}>
                    <span className={styles.periodIcon}>📅</span>
                    {budget.period === 'monthly' && '月次'}
                    {budget.period === 'yearly' && '年次'}
                    {budget.period === 'custom' && 'カスタム'}
                  </div>
                </div>
                
                <div className={styles.budgetProgress}>
                  <div className={styles.progressHeader}>
                    <div className={styles.progressAmount}>
                      <span className={styles.spent}>¥{(budget.spentAmount || budget.spent_amount || 0).toLocaleString()}</span>
                      <span className={styles.separator}>/</span>
                      <span className={styles.total}>¥{(budget.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.progressPercentage}>
                      {Math.round(budget.usagePercentage || budget.usage_percentage || 0)}%
                    </div>
                  </div>
                  
                  <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${getProgressColor(budget.usagePercentage || budget.usage_percentage || 0)}`}
                      style={{ width: `${Math.min(budget.usagePercentage || budget.usage_percentage || 0, 100)}%` }}
                    />
                  </div>
                  
                  <div className={styles.progressMeta}>
                    <div className={styles.remaining}>
                      残り: ¥{Math.max(budget.remainingAmount || budget.remaining_amount || 0, 0).toLocaleString()}
                    </div>
                    <div className={styles.daysRemaining}>
                      {budget.days_remaining}日残り
                    </div>
                  </div>
                </div>
                
                <div className={styles.budgetStatus}>
                  {budget.is_over_budget && (
                    <span className={styles.statusBadge}>
                      <span className={styles.icon}>🚨</span>
                      予算超過
                    </span>
                  )}
                  {budget.is_alert_threshold_reached && !budget.is_over_budget && (
                    <span className={styles.statusBadge}>
                      <span className={styles.icon}>⚠️</span>
                      アラート
                    </span>
                  )}
                  {!budget.is_alert_threshold_reached && (
                    <span className={styles.statusBadge}>
                      <span className={styles.icon}>✅</span>
                      正常
                    </span>
                  )}
                </div>
                
                <div className={styles.budgetActions}>
                  <button 
                    onClick={() => navigate(`/budgets/edit/${budget.id}`)}
                    className={styles.editButton}
                  >
                    編集
                  </button>
                  <button 
                    onClick={() => handleDeleteBudget(budget.id)}
                    className={styles.deleteButton}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  )
}