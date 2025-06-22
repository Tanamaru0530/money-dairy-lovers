import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/common/Navigation'
import { useNotification } from '@/contexts/NotificationContext'
import { useToastContext } from '@/contexts/ToastContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { api } from '@/services/api'
import styles from './Notifications.module.scss'

interface Notification {
  id: string
  type: 'budget_warning' | 'budget_exceeded' | 'partner_transaction' | 'love_event' | 'goal_achieved'
  title: string
  message: string
  data?: any
  is_read: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  action_url?: string
  created_at: string
}

export const Notifications: React.FC = () => {
  const { refreshCounts } = useNotification()
  const toast = useToastContext()
  const { error, isLoading, executeAsync } = useErrorHandler()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    await executeAsync(
      async () => {
        const params = filter === 'unread' ? { is_read: false } : {}
        const response = await api.get('/notifications', { params })
        setNotifications(response.data.notifications || [])
      },
      {
        onError: () => {
          toast.error('通知の読み込みに失敗しました')
        }
      }
    )
  }

  const markAsRead = async (notificationId: string) => {
    await executeAsync(
      async () => {
        await api.put(`/notifications/${notificationId}/read`)
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        await refreshCounts()
      },
      {
        onError: () => {
          toast.error('通知の更新に失敗しました')
        }
      }
    )
  }

  const markAllAsRead = async () => {
    await executeAsync(
      async () => {
        await api.put('/notifications/read-all')
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        await refreshCounts()
        toast.success('すべての通知を既読にしました')
      },
      {
        onError: () => {
          toast.error('通知の更新に失敗しました')
        }
      }
    )
  }

  const deleteNotification = async (notificationId: string) => {
    if (!window.confirm('この通知を削除しますか？')) return

    await executeAsync(
      async () => {
        await api.delete(`/notifications/${notificationId}`)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        await refreshCounts()
        toast.success('通知を削除しました')
      },
      {
        onError: () => {
          toast.error('通知の削除に失敗しました')
        }
      }
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'budget_warning': return '⚠️'
      case 'budget_exceeded': return '🚨'
      case 'partner_transaction': return '👫'
      case 'love_event': return '💕'
      case 'goal_achieved': return '🎉'
      default: return '📢'
    }
  }

  const getNotificationStyle = (priority: Notification['priority'], isRead: boolean) => {
    if (isRead) return styles.notificationRead
    switch (priority) {
      case 'urgent': return styles.notificationUrgent
      case 'high': return styles.notificationHigh
      default: return styles.notificationNormal
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else if (diffHours < 48) {
      return '昨日'
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className={styles.notificationsPage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>
              <span className={styles.icon}>🔔</span>
              通知
            </h1>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className={styles.markAllReadButton}
              onClick={markAllAsRead}
              disabled={isLoading}
            >
              すべて既読にする
            </button>
          )}
        </div>

        <div className={styles.filterSection}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            すべて
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
            onClick={() => setFilter('unread')}
          >
            未読のみ
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>🔔</div>
            <p>読み込み中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔕</div>
            <h3>通知はありません</h3>
            <p>新しい通知があるとここに表示されます</p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${getNotificationStyle(notification.priority, notification.is_read)}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className={styles.notificationContent}>
                  <h3 className={styles.notificationTitle}>
                    {notification.title}
                    {!notification.is_read && <span className={styles.unreadDot}>●</span>}
                  </h3>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  
                  {notification.action_url && (
                    <a
                      href={notification.action_url}
                      className={styles.actionLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      詳細を見る →
                    </a>
                  )}
                  
                  <div className={styles.notificationMeta}>
                    <span className={styles.notificationTime}>
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  title="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}