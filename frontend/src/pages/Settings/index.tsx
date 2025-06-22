import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigation } from '@/components/common/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useToastContext } from '@/contexts/ToastContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { userService } from '@/services/userService'
import { partnershipService } from '@/services/partnershipService'
import { PartnershipStatus } from '@/types/user'
import { PasswordChangeModal } from '@/components/common/PasswordChangeModal'
import styles from './Settings.module.scss'

type ProfileFormData = {
  display_name: string
  email: string
  love_theme_preference: 'default' | 'pink' | 'blue' | 'custom'
}

type NotificationSettings = {
  email_notifications: boolean
  push_notifications: boolean
  budget_alerts: boolean
  partner_transaction_alerts: boolean
  love_event_reminders: boolean
}

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth()
  const { themeMode, themeColor, setThemeMode, setThemeColor } = useTheme()
  const toast = useToastContext()
  const { error, isLoading, executeAsync } = useErrorHandler()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'partner'>('profile')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus | null>(null)
  const [anniversaryDate, setAnniversaryDate] = useState('')
  const [relationshipType, setRelationshipType] = useState('dating')
  
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    defaultValues: {
      display_name: user?.displayName || '',
      email: user?.email || '',
      love_theme_preference: user?.loveThemePreference || 'default'
    }
  })

  const {
    register: registerNotifications,
    handleSubmit: handleSubmitNotifications,
    watch: watchNotifications,
    reset: resetNotifications
  } = useForm<NotificationSettings>({
    defaultValues: {
      email_notifications: true,
      push_notifications: true,
      budget_alerts: true,
      partner_transaction_alerts: true,
      love_event_reminders: true
    }
  })

  useEffect(() => {
    if (user) {
      resetProfile({
        display_name: user.displayName,
        email: user.email,
        love_theme_preference: user.loveThemePreference || 'default'
      })
      // 通知設定をユーザーデータから読み込む（実装後）
      
      // パートナーシップ情報を読み込む
      if (user.hasPartner) {
        loadPartnershipStatus()
      }
    }
  }, [user, resetProfile])
  
  const loadPartnershipStatus = async () => {
    try {
      const data = await partnershipService.getStatus()
      setPartnershipStatus(data)
      if (data.partnership?.loveAnniversary) {
        setAnniversaryDate(data.partnership.loveAnniversary)
      }
      if (data.partnership?.relationshipType) {
        setRelationshipType(data.partnership.relationshipType)
      }
    } catch (error) {
      console.error('Failed to load partnership status:', error)
    }
  }

  const handleProfileUpdate = async (data: ProfileFormData) => {
    await executeAsync(
      async () => {
        const updatedUser = await userService.updateProfile({
          display_name: data.display_name,
          love_theme_preference: data.love_theme_preference
        })
        updateUser(updatedUser)
        // テーマカラーも更新
        setThemeColor(data.love_theme_preference)
        toast.success('プロフィールを更新しました')
      },
      {
        onError: () => {
          toast.error('プロフィールの更新に失敗しました')
        }
      }
    )
  }

  const handleNotificationUpdate = async (data: NotificationSettings) => {
    await executeAsync(
      async () => {
        await userService.updateNotificationSettings(data)
        toast.success('通知設定を更新しました')
      },
      {
        onError: () => {
          toast.error('通知設定の更新に失敗しました')
        }
      }
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('画像サイズは2MB以下にしてください')
        return
      }
      
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!profileImage) return

    await executeAsync(
      async () => {
        const result = await userService.uploadProfileImage(profileImage)
        if (user) {
          updateUser({ ...user, profileImageUrl: result.profile_image_url })
        }
        setProfileImage(null)
        setProfileImagePreview(null)
        toast.success('プロフィール画像を更新しました')
      },
      {
        onError: () => {
          toast.error('画像のアップロードに失敗しました')
        }
      }
    )
  }

  const handlePasswordChange = async (data: { current_password: string; new_password: string }) => {
    await executeAsync(
      async () => {
        await userService.changePassword(data)
        toast.success('パスワードを変更しました')
        setShowPasswordModal(false)
      },
      {
        onError: () => {
          toast.error('パスワードの変更に失敗しました')
        }
      }
    )
  }
  
  const handleUpdatePartnership = async () => {
    await executeAsync(
      async () => {
        await partnershipService.updatePartnership({
          love_anniversary: anniversaryDate || undefined,
          relationship_type: relationshipType
        })
        toast.success('パートナーシップ情報を更新しました💕')
        await loadPartnershipStatus()
      },
      {
        onError: () => {
          toast.error('更新に失敗しました')
        }
      }
    )
  }
  
  const handleDeletePartnership = async () => {
    if (!window.confirm('本当にパートナーシップを解除しますか？\n\nこの操作は取り消せません。共有データへのアクセスが制限され、Love機能が使用できなくなります。')) {
      return
    }
    
    if (!window.confirm('最終確認：本当に解除してもよろしいですか？')) {
      return
    }
    
    await executeAsync(
      async () => {
        await partnershipService.deletePartnership()
        toast.success('パートナーシップを解除しました')
        // ページをリロードして状態を更新
        window.location.reload()
      },
      {
        onError: () => {
          toast.error('解除に失敗しました')
        }
      }
    )
  }

  return (
    <div className={styles.settingsPage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <span className={styles.icon}>⚙️</span>
            設定
          </h1>
          <p className={styles.pageSubtitle}>
            アカウントとアプリの設定を管理します
          </p>
        </div>

        <div className={styles.settingsContainer}>
          <div className={styles.tabMenu}>
            <button
              className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className={styles.tabIcon}>👤</span>
              プロフィール
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'notifications' ? styles.active : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className={styles.tabIcon}>🔔</span>
              通知設定
            </button>
            {/* テーマ設定は一時的に非表示
            <button
              className={`${styles.tabButton} ${activeTab === 'theme' ? styles.active : ''}`}
              onClick={() => setActiveTab('theme')}
            >
              <span className={styles.tabIcon}>🎨</span>
              テーマ
            </button>
            */}
            <button
              className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className={styles.tabIcon}>🔒</span>
              セキュリティ
            </button>
            {user?.hasPartner && (
              <button
                className={`${styles.tabButton} ${activeTab === 'partner' ? styles.active : ''}`}
                onClick={() => setActiveTab('partner')}
              >
                <span className={styles.tabIcon}>💑</span>
                パートナー設定
              </button>
            )}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'profile' && (
              <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>プロフィール設定</h2>
                
                <div className={styles.profileImageSection}>
                  <div className={styles.imagePreview}>
                    {profileImagePreview || user?.profileImageUrl ? (
                      <img 
                        src={profileImagePreview || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user?.profileImageUrl}`} 
                        alt="プロフィール画像"
                        className={styles.profileImage}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span className={styles.placeholderIcon}>👤</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="profileImage" className={styles.uploadButton}>
                      画像を選択
                    </label>
                    {profileImage && (
                      <button 
                        onClick={handleImageUpload}
                        className={styles.saveImageButton}
                        disabled={isLoading}
                      >
                        画像を保存
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className={styles.profileForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="display_name">表示名</label>
                    <input
                      {...registerProfile('display_name', { 
                        required: '表示名を入力してください',
                        maxLength: { value: 20, message: '20文字以内で入力してください' }
                      })}
                      className={styles.input}
                      placeholder="田中太郎"
                    />
                    {profileErrors.display_name && (
                      <span className={styles.error}>{profileErrors.display_name.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">メールアドレス</label>
                    <input
                      {...registerProfile('email')}
                      className={styles.input}
                      type="email"
                      disabled
                    />
                    <span className={styles.helpText}>メールアドレスは変更できません</span>
                  </div>

                  <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    プロフィールを更新
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className={styles.notificationSection}>
                <h2 className={styles.sectionTitle}>通知設定</h2>
                
                <form onSubmit={handleSubmitNotifications(handleNotificationUpdate)} className={styles.notificationForm}>
                  <div className={styles.notificationGroup}>
                    <h3 className={styles.groupTitle}>基本設定</h3>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        {...registerNotifications('email_notifications')}
                        className={styles.checkbox}
                      />
                      <span className={styles.labelText}>メール通知を受け取る</span>
                    </label>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        {...registerNotifications('push_notifications')}
                        className={styles.checkbox}
                      />
                      <span className={styles.labelText}>プッシュ通知を受け取る</span>
                    </label>
                  </div>

                  <div className={styles.notificationGroup}>
                    <h3 className={styles.groupTitle}>通知タイプ</h3>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        {...registerNotifications('budget_alerts')}
                        className={styles.checkbox}
                      />
                      <span className={styles.labelText}>予算アラート</span>
                      <span className={styles.labelDescription}>予算の80%に達した時に通知</span>
                    </label>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        {...registerNotifications('partner_transaction_alerts')}
                        className={styles.checkbox}
                      />
                      <span className={styles.labelText}>パートナーの取引通知</span>
                      <span className={styles.labelDescription}>パートナーが共有取引を追加した時に通知</span>
                    </label>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        {...registerNotifications('love_event_reminders')}
                        className={styles.checkbox}
                      />
                      <span className={styles.labelText}>Love イベントリマインダー</span>
                      <span className={styles.labelDescription}>記念日や特別な日の前に通知</span>
                    </label>
                  </div>

                  <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    通知設定を保存
                  </button>
                </form>
              </div>
            )}

            {/* テーマ設定は一時的に非表示
            {activeTab === 'theme' && (
              <div className={styles.themeSection}>
                <h2 className={styles.sectionTitle}>テーマ設定</h2>
                
                <div className={styles.darkModeToggle}>
                  <h3 className={styles.subsectionTitle}>表示モード</h3>
                  <div className={styles.toggleContainer}>
                    <label className={styles.toggleLabel}>
                      <span className={styles.toggleText}>ダークモード</span>
                      <div className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={themeMode === 'dark'}
                          onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                          className={styles.toggleInput}
                        />
                        <span className={styles.toggleSlider}>
                          <span className={styles.toggleIcon}>
                            {themeMode === 'dark' ? '🌙' : '☀️'}
                          </span>
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <h3 className={styles.subsectionTitle}>カラーテーマ</h3>
                <div className={styles.themeOptions}>
                  <label className={styles.themeOption}>
                    <input
                      type="radio"
                      value="default"
                      checked={themeColor === 'default'}
                      onChange={() => {
                        setThemeColor('default')
                        handleSubmitProfile(handleProfileUpdate)({ 
                          display_name: user?.displayName || '',
                          email: user?.email || '',
                          love_theme_preference: 'default'
                        })
                      }}
                      className={styles.hiddenInput}
                    />
                    <div className={`${styles.themeCard} ${themeColor === 'default' ? styles.selected : ''}`}>
                      <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
                        <span className={styles.themeIcon}>💕</span>
                      </div>
                      <span className={styles.themeName}>デフォルト</span>
                    </div>
                  </label>
                  
                  <label className={styles.themeOption}>
                    <input
                      type="radio"
                      value="pink"
                      checked={themeColor === 'pink'}
                      onChange={() => {
                        setThemeColor('pink')
                        handleSubmitProfile(handleProfileUpdate)({ 
                          display_name: user?.displayName || '',
                          email: user?.email || '',
                          love_theme_preference: 'pink'
                        })
                      }}
                      className={styles.hiddenInput}
                    />
                    <div className={`${styles.themeCard} ${themeColor === 'pink' ? styles.selected : ''}`}>
                      <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}>
                        <span className={styles.themeIcon}>🌸</span>
                      </div>
                      <span className={styles.themeName}>ピンク</span>
                    </div>
                  </label>
                  
                  <label className={styles.themeOption}>
                    <input
                      type="radio"
                      value="blue"
                      checked={themeColor === 'blue'}
                      onChange={() => {
                        setThemeColor('blue')
                        handleSubmitProfile(handleProfileUpdate)({ 
                          display_name: user?.displayName || '',
                          email: user?.email || '',
                          love_theme_preference: 'blue'
                        })
                      }}
                      className={styles.hiddenInput}
                    />
                    <div className={`${styles.themeCard} ${themeColor === 'blue' ? styles.selected : ''}`}>
                      <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                        <span className={styles.themeIcon}>💙</span>
                      </div>
                      <span className={styles.themeName}>ブルー</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
            */}

            {activeTab === 'security' && (
              <div className={styles.securitySection}>
                <h2 className={styles.sectionTitle}>セキュリティ設定</h2>
                
                <div className={styles.securityItem}>
                  <h3 className={styles.itemTitle}>パスワード変更</h3>
                  <p className={styles.itemDescription}>アカウントのパスワードを変更します</p>
                  <button 
                    className={styles.actionButton}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    パスワードを変更
                  </button>
                </div>
                
                <div className={styles.securityItem}>
                  <h3 className={styles.itemTitle}>二要素認証</h3>
                  <p className={styles.itemDescription}>アカウントのセキュリティを強化します</p>
                  <button className={styles.actionButton} disabled>
                    設定する（準備中）
                  </button>
                </div>
                
                <div className={styles.securityItem}>
                  <h3 className={styles.itemTitle}>ログインセッション</h3>
                  <p className={styles.itemDescription}>現在ログイン中のデバイス: 1台</p>
                  <button className={styles.actionButton}>
                    他のデバイスからログアウト
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'partner' && user?.hasPartner && (
              <div className={styles.partnerSection}>
                <h2 className={styles.sectionTitle}>パートナー設定</h2>
                
                {partnershipStatus?.partnership && (
                  <>
                    <div className={styles.partnerInfo}>
                      <h3 className={styles.subsectionTitle}>パートナー情報</h3>
                      <div className={styles.partnerCard}>
                        <div className={styles.partnerAvatar}>
                          {partnershipStatus.partnership.partner?.profileImageUrl ? (
                            <img 
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${partnershipStatus.partnership.partner.profileImageUrl}`}
                              alt={partnershipStatus.partnership.partner?.displayName} 
                            />
                          ) : (
                            <div className={styles.avatarPlaceholder}>👤</div>
                          )}
                        </div>
                        <div className={styles.partnerDetails}>
                          <p className={styles.partnerName}>
                            {partnershipStatus.partnership.partner?.displayName}
                          </p>
                          <p className={styles.partnerEmail}>
                            {partnershipStatus.partnership.partner?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.relationshipSettings}>
                      <h3 className={styles.subsectionTitle}>関係性の詳細</h3>
                      <div className={styles.formGroup}>
                        <label htmlFor="anniversary">記念日</label>
                        <input
                          type="date"
                          id="anniversary"
                          value={anniversaryDate}
                          onChange={(e) => setAnniversaryDate(e.target.value)}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="relationshipType">関係性</label>
                        <select
                          id="relationshipType"
                          value={relationshipType}
                          onChange={(e) => setRelationshipType(e.target.value)}
                          className={styles.select}
                        >
                          <option value="dating">交際中 💑</option>
                          <option value="engaged">婚約中 💍</option>
                          <option value="married">結婚 👰🤵</option>
                        </select>
                      </div>
                      <button
                        onClick={handleUpdatePartnership}
                        className={styles.submitButton}
                        disabled={isLoading}
                      >
                        関係性を更新
                      </button>
                    </div>
                    
                    <div className={styles.dangerZone}>
                      <h3 className={styles.subsectionTitle}>危険な操作</h3>
                      <p className={styles.warningText}>
                        パートナーシップを解除すると、共有データへのアクセスが制限されます。
                        この操作は取り消せません。
                      </p>
                      <button
                        onClick={handleDeletePartnership}
                        className={`${styles.actionButton} ${styles.dangerButton}`}
                      >
                        パートナーシップを解除
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
        isLoading={isLoading}
      />
    </div>
  )
}