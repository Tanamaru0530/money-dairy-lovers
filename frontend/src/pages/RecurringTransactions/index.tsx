import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '@/components/common/Navigation'
import { recurringTransactionService } from '@/services/recurringTransactionService'
import { useToastContext } from '@/contexts/ToastContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { formatNumber, formatAmount } from '@/utils/format'
import type { RecurringTransaction } from '@/types/recurringTransaction'
import styles from './RecurringTransactions.module.scss'

export const RecurringTransactions: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToastContext()
  const { error, isLoading, executeAsync, clearError } = useErrorHandler()
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState({
    is_active: true,
    transaction_type: 'all',
  })

  useEffect(() => {
    loadRecurringTransactions()
  }, [filter])

  const loadRecurringTransactions = async () => {
    await executeAsync(
      async () => {
        const params = {
          is_active: filter.is_active,
          transaction_type: filter.transaction_type === 'all' ? undefined : filter.transaction_type,
        }
        const data = await recurringTransactionService.getRecurringTransactions(params)
        console.log('[RecurringTransactions] API response:', data)
        
        // camelCase変換を考慮
        const transactions = data.recurringTransactions || data.recurring_transactions || []
        
        // 最初の取引の金額を詳細に確認
        if (transactions.length > 0) {
          console.log('[RecurringTransactions] First transaction amount details:', {
            amount: transactions[0].amount,
            amountType: typeof transactions[0].amount,
            amountString: String(transactions[0].amount),
            amountNumber: Number(transactions[0].amount),
            mathFloor: Math.floor(transactions[0].amount),
            formatted: formatNumber(Math.floor(transactions[0].amount))
          })
        }
        
        // デバッグ: 最初の取引の日付フィールドを確認
        if (transactions.length > 0) {
          console.log('[RecurringTransactions] First transaction dates:', {
            next_execution_date: transactions[0].next_execution_date,
            nextExecutionDate: (transactions[0] as any).nextExecutionDate,
            last_execution_date: transactions[0].last_execution_date,
            lastExecutionDate: (transactions[0] as any).lastExecutionDate,
          })
        }
        
        setRecurringTransactions(transactions)
        setTotal(data.total || 0)
      },
      {
        onError: () => {
          toast.error('定期取引の読み込みに失敗しました')
        }
      }
    )
  }

  const handleExecute = async (id: string) => {
    if (!window.confirm('この定期取引を今すぐ実行しますか？')) {
      return
    }

    await executeAsync(
      async () => {
        const result = await recurringTransactionService.executeRecurringTransaction(id)
        toast.success(`定期取引を実行しました`)
        await loadRecurringTransactions()
      },
      {
        onError: () => {
          toast.error('定期取引の実行に失敗しました')
        }
      }
    )
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('この定期取引を削除しますか？')) {
      return
    }

    await executeAsync(
      async () => {
        await recurringTransactionService.deleteRecurringTransaction(id)
        toast.success('定期取引を削除しました')
        await loadRecurringTransactions()
      },
      {
        onError: () => {
          toast.error('定期取引の削除に失敗しました')
        }
      }
    )
  }

  const formatFrequency = (frequency: string, interval: number) => {
    const freqMap: Record<string, string> = {
      daily: '日',
      weekly: '週',
      monthly: 'ヶ月',
      yearly: '年'
    }
    return interval > 1 ? `${interval}${freqMap[frequency]}ごと` : `毎${freqMap[frequency]}`
  }

  const formatNextExecution = (date: string) => {
    if (!date) return '未定'
    
    // 日付文字列の解析を改善
    let nextDate: Date
    if (date.includes('T')) {
      // ISO形式の日時文字列
      nextDate = new Date(date)
    } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // YYYY-MM-DD形式の日付文字列
      nextDate = new Date(`${date}T00:00:00`)
    } else {
      nextDate = new Date(date)
    }
    
    // 日付が無効な場合
    if (isNaN(nextDate.getTime())) {
      return '日付エラー'
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 時刻をリセット
    nextDate.setHours(0, 0, 0, 0) // 時刻をリセット
    
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '明日'
    if (diffDays > 1 && diffDays <= 7) return `${diffDays}日後`
    
    return nextDate.toLocaleDateString('ja-JP')
  }

  return (
    <div className={styles.recurringTransactionsPage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>
              <span className={styles.icon}>🔄</span>
              定期取引
            </h1>
            <p className={styles.pageSubtitle}>
              毎月の固定費を自動で管理
            </p>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => navigate('/recurring-transactions/add')}
          >
            <span className={styles.icon}>➕</span>
            定期取引を追加
          </button>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>状態</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${filter.is_active ? styles.active : ''}`}
                onClick={() => setFilter({ ...filter, is_active: true })}
              >
                有効
              </button>
              <button
                className={`${styles.filterButton} ${!filter.is_active ? styles.active : ''}`}
                onClick={() => setFilter({ ...filter, is_active: false })}
              >
                無効
              </button>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>種別</label>
            <select
              className={styles.filterSelect}
              value={filter.transaction_type}
              onChange={(e) => setFilter({ ...filter, transaction_type: e.target.value })}
            >
              <option value="all">すべて</option>
              <option value="income">収入</option>
              <option value="expense">支出</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>🔄</div>
            <p>読み込み中...</p>
          </div>
        ) : recurringTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>定期取引がありません</h3>
            <p>毎月の固定費を登録して、自動で管理しましょう</p>
            <button 
              className={styles.addButtonEmpty}
              onClick={() => navigate('/recurring-transactions/add')}
            >
              定期取引を追加
            </button>
          </div>
        ) : (
          <div className={styles.transactionsList}>
            {recurringTransactions.map((rt) => {
              console.log('[RecurringTransactions] Transaction:', rt.id, 'Amount:', rt.amount, typeof rt.amount)
              console.log('[RecurringTransactions] String(rt.amount):', String(rt.amount))
              console.log('[RecurringTransactions] Number(rt.amount):', Number(rt.amount))
              console.log('[RecurringTransactions] formatAmount(rt.amount):', formatAmount(rt.amount))
              return (
              <div key={rt.id} className={styles.transactionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryIcon} style={{ color: rt.category_color || (rt as any).categoryColor || '#6B7280' }}>
                      {rt.category_icon || (rt as any).categoryIcon || '📂'}
                    </span>
                    <span className={styles.categoryName}>{rt.category_name || (rt as any).categoryName || 'カテゴリ未設定'}</span>
                  </div>
                  <div className={styles.amount} data-type={rt.transaction_type || (rt as any).transactionType}>
                    {(rt.transaction_type || (rt as any).transactionType) === 'income' ? '+' : '-'}{formatAmount(rt.amount)}
                  </div>
                </div>

                {rt.description && (
                  <p className={styles.description}>{rt.description}</p>
                )}
                
                <div className={styles.transactionDetails}>
                  {(rt.payment_method || (rt as any).paymentMethod) && (
                    <span className={styles.tag}>
                      {(rt.payment_method || (rt as any).paymentMethod) === 'cash' && '💵 現金'}
                      {(rt.payment_method || (rt as any).paymentMethod) === 'credit_card' && '💳 カード'}
                      {(rt.payment_method || (rt as any).paymentMethod) === 'bank_transfer' && '🏦 振込'}
                      {(rt.payment_method || (rt as any).paymentMethod) === 'digital_wallet' && '📱 電子マネー'}
                    </span>
                  )}
                  
                  <span className={styles.tag}>
                    {(rt.sharing_type || (rt as any).sharingType) === 'shared' ? '👫 共有' : '👤 個人'}
                  </span>
                </div>

                <div className={styles.scheduleInfo}>
                  <div className={styles.frequency}>
                    <span className={styles.icon}>🔄</span>
                    {formatFrequency(rt.frequency, rt.interval_value || (rt as any).intervalValue || 1)}
                    {rt.frequency === 'monthly' && (rt.day_of_month || (rt as any).dayOfMonth) && (
                      <span className={styles.dayInfo}> (毎月{rt.day_of_month || (rt as any).dayOfMonth}日)</span>
                    )}
                    {rt.frequency === 'weekly' && (rt.day_of_week !== null || (rt as any).dayOfWeek !== null) && (
                      <span className={styles.dayInfo}> ({['月', '火', '水', '木', '金', '土', '日'][rt.day_of_week ?? (rt as any).dayOfWeek]}曜日)</span>
                    )}
                  </div>

                  <div className={styles.nextExecution}>
                    <span className={styles.icon}>📅</span>
                    次回: {formatNextExecution(rt.next_execution_date || (rt as any).nextExecutionDate)}
                  </div>
                </div>

                <div className={styles.metaInfo}>
                  <div className={styles.executionInfo}>
                    <span className={styles.count}>実行回数: {rt.execution_count || (rt as any).executionCount || 0}回</span>
                  </div>
                  {rt.end_date && (
                    <div className={styles.endDate}>
                      <span className={styles.icon}>🏁</span>
                      終了日: {(() => {
                        const endDate = rt.end_date.includes('T') 
                          ? new Date(rt.end_date) 
                          : new Date(`${rt.end_date}T00:00:00`)
                        return isNaN(endDate.getTime()) 
                          ? '日付エラー' 
                          : endDate.toLocaleDateString('ja-JP')
                      })()}
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.executeButton}
                    onClick={() => handleExecute(rt.id)}
                    disabled={!(rt.is_active ?? (rt as any).isActive)}
                  >
                    <span className={styles.icon}>▶️</span>
                    今すぐ実行
                  </button>
                  <button
                    className={styles.editButton}
                    onClick={() => navigate(`/recurring-transactions/edit/${rt.id}`)}
                  >
                    <span className={styles.icon}>✏️</span>
                    編集
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(rt.id)}
                  >
                    <span className={styles.icon}>🗑️</span>
                    削除
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}