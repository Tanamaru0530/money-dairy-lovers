import React, { useState, useEffect } from 'react'
import { Navigation } from '../../components/common/Navigation'
import { loveService } from '../../services/loveService'
import { reportService } from '../../services/reportService'
import { partnershipService } from '../../services/partnershipService'
import { LoveEvent, LoveEventFormData, LoveMemory } from '../../types/love'
import { LoveStatistics } from '../../types/report'
import { PartnershipStatus } from '../../types/user'
import { formatAmount } from '../../utils/format'
import { Line, Doughnut } from 'react-chartjs-2'
import { LoveEventModal } from '../../components/love/LoveEventModal'
import { LoveMemoryModal } from '../../components/love/LoveMemoryModal'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Love.module.scss'

export const Love: React.FC = () => {
  const { user } = useAuth()
  const [loveEvents, setLoveEvents] = useState<LoveEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<LoveEvent[]>([])
  const [loveStats, setLoveStats] = useState<LoveStatistics | null>(null)
  const [loveMemories, setLoveMemories] = useState<LoveMemory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // デバッグ用
  console.log('[Love] Component state:', {
    loveEvents,
    upcomingEvents,
    loveStats,
    loveMemories,
    isLoading,
    hasPartner: user?.hasPartner
  })
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'memories'>('dashboard')
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<LoveEvent | undefined>()

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true)
      await loadPartnershipStatus()
      if (user?.hasPartner) {
        await loadLoveData()
      } else {
        setIsLoading(false)
      }
    }
    initializePage()
  }, [user])

  const loadPartnershipStatus = async () => {
    try {
      const data = await partnershipService.getStatus()
      setPartnershipStatus(data)
    } catch (error) {
      console.error('Failed to load partnership status:', error)
    }
  }

  const handleCreateInvitation = async () => {
    try {
      setError(null)
      setSuccess(null)
      const response = await partnershipService.createInvitation()
      setInviteCode(response.invitationCode)
      setSuccess('招待コードを作成しました！パートナーに共有してください💕')
    } catch (error: any) {
      setError(error.response?.data?.detail || '招待コードの作成に失敗しました')
    }
  }

  const handleJoinPartnership = async () => {
    try {
      setError(null)
      setSuccess(null)
      if (!inputCode.trim()) {
        setError('招待コードを入力してください')
        return
      }
      await partnershipService.joinPartnership(inputCode.trim())
      setSuccess('パートナーシップに参加しました！💕')
      setInputCode('')
      // ユーザー情報を再読み込みして画面を更新
      window.location.reload()
    } catch (error: any) {
      setError(error.response?.data?.detail || 'パートナーシップへの参加に失敗しました')
    }
  }

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      setSuccess('招待コードをコピーしました！')
    }
  }

  const loadLoveData = async () => {
    try {
      // Love統計を取得
      const currentDate = new Date()
      const stats = await reportService.getLoveSummary({
        start_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
      })
      
      if (!('message' in stats)) {
        setLoveStats(stats)
      }
      
      // Loveイベントを取得（パートナーシップがない場合はエラーになる可能性がある）
      try {
        const events = await loveService.getLoveEvents()
        setLoveEvents(events)
      } catch (error) {
        console.log('Failed to load love events:', error)
        setLoveEvents([])
      }
      
      // 今後のイベントを取得
      try {
        const upcoming = await loveService.getUpcomingEvents(30)
        setUpcomingEvents(upcoming)
      } catch (error) {
        console.log('Failed to load upcoming events:', error)
        setUpcomingEvents([])
      }
      
      // Love メモリーを取得
      try {
        const memories = await loveService.getLoveMemories()
        setLoveMemories(memories)
      } catch (error) {
        console.log('Failed to load love memories:', error)
        setLoveMemories([])
      }
    } catch (error) {
      console.error('Failed to load love data:', error)
    }
  }

  const handleCreateEvent = async (data: LoveEventFormData) => {
    try {
      if (editingEvent) {
        await loveService.updateLoveEvent(editingEvent.id, data)
      } else {
        await loveService.createLoveEvent(data)
      }
      await loadLoveData()
    } catch (error: any) {
      console.error('Failed to save event:', error)
      
      // エラーメッセージを取得
      const errorMessage = error.response?.data?.userMessage || 
                          error.response?.data?.detail || 
                          '記念日の保存に失敗しました'
      
      // パートナーシップが必要な場合の特別なメッセージ
      if (errorMessage.includes('パートナーシップ')) {
        alert('記念日を登録するには、まずパートナーを登録してください。\n\n設定ページからパートナーの招待コードを生成できます。')
      } else {
        alert(errorMessage)
      }
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('この記念日を削除してもよろしいですか？')) return
    
    try {
      await loveService.deleteLoveEvent(eventId)
      await loadLoveData()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('記念日の削除に失敗しました')
    }
  }

  const handleEditEvent = (event: LoveEvent) => {
    setEditingEvent(event)
    setIsEventModalOpen(true)
  }

  const handleCreateMemory = async (data: { title: string; description: string; event_id?: string }) => {
    try {
      await loveService.createLoveMemory(data)
      await loadLoveData()
    } catch (error) {
      console.error('Failed to create memory:', error)
      alert('思い出の保存に失敗しました')
    }
  }

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('この思い出を削除してもよろしいですか？')) return
    
    try {
      await loveService.deleteLoveMemory(memoryId)
      await loadLoveData()
    } catch (error) {
      console.error('Failed to delete memory:', error)
      alert('思い出の削除に失敗しました')
    }
  }

  const getDaysUntilEvent = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      anniversary: '💑',
      birthday: '🎂',
      valentine: '💝',
      christmas: '🎄',
      custom: '🎉'
    }
    return icons[eventType] || '🎉'
  }

  const renderDashboard = () => {
    if (!loveStats) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💕</div>
          <h3>Love データがありません</h3>
          <p>Love カテゴリの取引を記録して、愛の統計を見てみましょう</p>
        </div>
      )
    }

    const loveSpendingByCategory = loveStats?.loveSpendingByCategory || loveStats?.love_spending_by_category || []
    const categoryChartData = {
      labels: loveSpendingByCategory.map(cat => `${(cat as any).categoryIcon || (cat as any).category_icon} ${(cat as any).categoryName || (cat as any).category_name}`),
      datasets: [{
        data: loveSpendingByCategory.map(cat => (cat as any).totalAmount || (cat as any).total_amount),
        backgroundColor: ['#FF69B4', '#FF1493', '#FF6347', '#FFB6C1', '#FFC0CB'],
      }]
    }

    const loveTrend = loveStats?.loveTrend || loveStats?.love_trend || []
    const trendChartData = {
      labels: loveTrend.map(trend => {
        const date = new Date(trend.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      datasets: [{
        label: 'Love支出',
        data: loveTrend.map(trend => trend.amount),
        borderColor: '#FF69B4',
        backgroundColor: 'rgba(255, 105, 180, 0.1)',
        tension: 0.4,
      }]
    }

    return (
      <>
        {/* Love統計カード */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <h3>Love支出合計</h3>
              <p className={styles.statValue}>{formatAmount(loveStats.totalLoveSpending || loveStats.total_love_spending || 0)}</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>Love取引数</h3>
              <p className={styles.statValue}>{loveStats.loveTransactionCount || loveStats.love_transaction_count || 0}件</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <h3>平均Love評価</h3>
              <p className={styles.statValue}>{(loveStats.averageLoveRating || loveStats.average_love_rating || 0).toFixed(1)}</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💕</div>
            <div className={styles.statContent}>
              <h3>支出に占める割合</h3>
              <p className={styles.statValue}>{Math.round(loveStats.loveSpendingPercentage || loveStats.love_spending_percentage || 0)}%</p>
            </div>
          </div>
        </div>

        {/* グラフ */}
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <h3>Loveカテゴリ内訳</h3>
            <div className={styles.chartContainer}>
              <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className={styles.chartCard}>
            <h3>Love支出の推移</h3>
            <div className={styles.chartContainer}>
              <Line data={trendChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* 今後のイベント */}
        {upcomingEvents.length > 0 && (
          <div className={styles.upcomingEvents}>
            <h3>💕 今後のLoveイベント</h3>
            <div className={styles.eventsList}>
              {upcomingEvents.slice(0, 3).map(event => {
                const daysUntil = getDaysUntilEvent(event.event_date)
                return (
                  <div key={event.id} className={styles.eventCard}>
                    <div className={styles.eventIcon}>{getEventIcon(event.event_type)}</div>
                    <div className={styles.eventInfo}>
                      <h4>{event.name}</h4>
                      <p className={styles.eventDate}>
                        {new Date(event.event_date).toLocaleDateString('ja-JP')}
                        {daysUntil === 0 && <span className={styles.today}> - 今日！</span>}
                        {daysUntil > 0 && <span> - あと{daysUntil}日</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </>
    )
  }

  const renderEvents = () => (
    <div className={styles.eventsSection}>
      <div className={styles.sectionHeader}>
        <h2>💕 記念日管理</h2>
        <button 
          className={styles.addButton}
          onClick={() => {
            setEditingEvent(undefined)
            setIsEventModalOpen(true)
          }}
        >
          <span>➕</span>
          記念日を追加
        </button>
      </div>
      
      {loveEvents.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <h3>記念日がありません</h3>
          <p>大切な記念日を登録して、忘れないようにしましょう</p>
        </div>
      ) : (
        <div className={styles.eventsList}>
          {loveEvents.map(event => (
            <div key={event.id} className={styles.eventItem}>
              <div className={styles.eventIcon}>{getEventIcon(event.event_type)}</div>
              <div className={styles.eventDetails}>
                <h4>{event.name}</h4>
                <p className={styles.eventDate}>
                  {new Date(event.event_date).toLocaleDateString('ja-JP')}
                  {event.is_recurring && <span className={styles.recurring}> 🔄 毎年</span>}
                </p>
                {event.description && <p className={styles.eventDescription}>{event.description}</p>}
              </div>
              <div className={styles.eventActions}>
                <button 
                  className={styles.editButton}
                  onClick={() => handleEditEvent(event)}
                >
                  編集
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={() => handleDeleteEvent(event.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderMemories = () => (
    <div className={styles.memoriesSection}>
      <div className={styles.sectionHeader}>
        <h2>💕 Love メモリー</h2>
        <button 
          className={styles.addButton}
          onClick={() => setIsMemoryModalOpen(true)}
        >
          <span>➕</span>
          思い出を追加
        </button>
      </div>
      
      {loveMemories.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📸</div>
          <h3>思い出がありません</h3>
          <p>大切な思い出を写真と一緒に記録しましょう</p>
        </div>
      ) : (
        <div className={styles.memoriesList}>
          {loveMemories.map(memory => (
            <div key={memory.id} className={styles.memoryItem}>
              <div className={styles.memoryContent}>
                <h4>{memory.title}</h4>
                <p className={styles.memoryDescription}>{memory.description}</p>
                <p className={styles.memoryDate}>
                  {new Date(memory.created_at).toLocaleDateString('ja-JP')}
                </p>
                {memory.photos && memory.photos.length > 0 && (
                  <div className={styles.memoryPhotos}>
                    {(memory.photos || []).map((photo, index) => (
                      <img 
                        key={index} 
                        src={photo} 
                        alt={`${memory.title} - 写真 ${index + 1}`}
                        className={styles.memoryPhoto}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.memoryActions}>
                <button 
                  className={styles.deleteButton}
                  onClick={() => handleDeleteMemory(memory.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className={styles.lovePage}>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>💕</div>
          <p>愛を込めて読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.lovePage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>💕 Love Dashboard</h1>
          <p className={styles.pageSubtitle}>愛の記録と思い出を大切に</p>
        </div>

        {/* パートナーがいない場合の招待画面 */}
        {!user?.hasPartner && (
          <div className={styles.partnershipSection}>
            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✅</span>
                {success}
              </div>
            )}

            <div className={styles.inviteGrid}>
              <div className={styles.inviteCard}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.icon}>✉️</span>
                  パートナーを招待
                </h2>
                <p className={styles.description}>
                  招待コードを作成して、パートナーに共有しましょう
                </p>
                {inviteCode ? (
                  <div className={styles.inviteCodeDisplay}>
                    <div className={styles.codeBox}>
                      <span className={styles.code}>{inviteCode}</span>
                      <button
                        onClick={copyInviteCode}
                        className={styles.copyButton}
                        title="コピー"
                      >
                        📋
                      </button>
                    </div>
                    <p className={styles.codeNote}>
                      この招待コードは48時間有効です
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateInvitation}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                  >
                    招待コードを作成
                  </button>
                )}
              </div>

              <div className={styles.joinCard}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.icon}>🤝</span>
                  パートナーシップに参加
                </h2>
                <p className={styles.description}>
                  パートナーから受け取った招待コードを入力してください
                </p>
                <div className={styles.joinForm}>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="例: ABC123"
                    className={styles.input}
                    maxLength={6}
                  />
                  <button
                    onClick={handleJoinPartnership}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    disabled={!inputCode.trim()}
                  >
                    参加する
                  </button>
                </div>
              </div>

              <div className={styles.infoCard}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.icon}>💡</span>
                  Love Dashboardとは？
                </h2>
                <ul className={styles.featureList}>
                  <li>💕 デート代や記念日の支出を特別に記録</li>
                  <li>📊 愛の支出統計を可視化</li>
                  <li>🎯 二人の目標を設定・管理</li>
                  <li>📸 大切な思い出を写真付きで保存</li>
                  <li>🎉 記念日カウントダウンと通知</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* パートナーがいる場合のみタブを表示 */}
        {user?.hasPartner && (
          <>
            {/* タブナビゲーション */}
            <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className={styles.tabIcon}>📊</span>
            ダッシュボード
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'events' ? styles.active : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <span className={styles.tabIcon}>📅</span>
            記念日
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'memories' ? styles.active : ''}`}
            onClick={() => setActiveTab('memories')}
          >
            <span className={styles.tabIcon}>📸</span>
            思い出
          </button>
            </div>

            {/* タブコンテンツ */}
            <div className={styles.tabContent}>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'events' && renderEvents()}
              {activeTab === 'memories' && renderMemories()}
            </div>
          </>
        )}
      </div>

      {/* モーダル */}
      <LoveEventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setEditingEvent(undefined)
        }}
        onSubmit={handleCreateEvent}
        event={editingEvent}
      />
      
      <LoveMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        onSubmit={handleCreateMemory}
        events={loveEvents}
      />
    </div>
  )
}