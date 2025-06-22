import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/common/Navigation';
import { partnershipService } from '../../services/partnershipService';
import { PartnershipStatus } from '../../types/user';
import styles from './Partnership.module.scss';

export const Partnership: React.FC = () => {
  const [status, setStatus] = useState<PartnershipStatus | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [relationshipType, setRelationshipType] = useState('dating');

  useEffect(() => {
    loadPartnershipStatus();
  }, []);

  const loadPartnershipStatus = async () => {
    try {
      setIsLoading(true);
      const data = await partnershipService.getStatus();
      setStatus(data);
      if (data.partnership?.loveAnniversary) {
        setAnniversaryDate(data.partnership.loveAnniversary);
      }
      if (data.partnership?.relationshipType) {
        setRelationshipType(data.partnership.relationshipType);
      }
    } catch (error) {
      console.error('Failed to load partnership status:', error);
      setError('パートナーシップ情報の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      setError(null);
      setSuccess(null);
      const response = await partnershipService.createInvitation();
      setInviteCode(response.invitationCode);
      setSuccess('招待コードを作成しました！パートナーに共有してください💕');
    } catch (error: any) {
      setError(error.response?.data?.detail || '招待コードの作成に失敗しました');
    }
  };

  const handleJoinPartnership = async () => {
    try {
      setError(null);
      setSuccess(null);
      if (!inputCode.trim()) {
        setError('招待コードを入力してください');
        return;
      }
      await partnershipService.joinPartnership(inputCode.trim());
      setSuccess('パートナーシップに参加しました！💕');
      setInputCode('');
      await loadPartnershipStatus();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'パートナーシップへの参加に失敗しました');
    }
  };

  const handleUpdatePartnership = async () => {
    try {
      setError(null);
      setSuccess(null);
      await partnershipService.updatePartnership({
        love_anniversary: anniversaryDate || undefined,
        relationship_type: relationshipType
      });
      setSuccess('パートナーシップ情報を更新しました💕');
      await loadPartnershipStatus();
    } catch (error: any) {
      setError(error.response?.data?.detail || '更新に失敗しました');
    }
  };

  const handleDeletePartnership = async () => {
    if (!window.confirm('本当にパートナーシップを解除しますか？この操作は取り消せません。')) {
      return;
    }
    try {
      setError(null);
      await partnershipService.deletePartnership();
      setSuccess('パートナーシップを解除しました');
      await loadPartnershipStatus();
    } catch (error: any) {
      setError(error.response?.data?.detail || '解除に失敗しました');
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setSuccess('招待コードをコピーしました！');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.partnershipPage}>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>💕</div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.partnershipPage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>💑 パートナーシップ</h1>
          <p className={styles.pageSubtitle}>大切な人と家計を共有しましょう</p>
        </div>

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

        <div className={styles.contentGrid}>
          {status?.hasPartner ? (
            // パートナーがいる場合
            <>
              <div className={styles.partnerCard}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.icon}>💕</span>
                  パートナー情報
                </h2>
                <div className={styles.partnerInfo}>
                  <div className={styles.partnerAvatar}>
                    {status.partnership?.partner.profileImageUrl ? (
                      <img 
                        src={status.partnership.partner.profileImageUrl} 
                        alt={status.partnership.partner.displayName} 
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>👤</div>
                    )}
                  </div>
                  <div className={styles.partnerDetails}>
                    <h3 className={styles.partnerName}>
                      {status.partnership?.partner.displayName}
                    </h3>
                    <p className={styles.partnerEmail}>
                      {status.partnership?.partner.email}
                    </p>
                    <p className={styles.partnershipDate}>
                      {status.partnership?.createdAt && 
                        `${new Date(status.partnership.createdAt).toLocaleDateString('ja-JP')}から`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.relationshipCard}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.icon}>🎉</span>
                  関係性の詳細
                </h2>
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
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  更新する
                </button>
              </div>

              <div className={styles.dangerZone}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.icon}>⚠️</span>
                  危険な操作
                </h2>
                <p className={styles.warningText}>
                  パートナーシップを解除すると、共有データへのアクセスが制限されます。
                </p>
                <button
                  onClick={handleDeletePartnership}
                  className={`${styles.button} ${styles.buttonDanger}`}
                >
                  パートナーシップを解除
                </button>
              </div>
            </>
          ) : (
            // パートナーがいない場合
            <>
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
                  パートナーシップとは？
                </h2>
                <ul className={styles.featureList}>
                  <li>💰 共有支出を自動で分割管理</li>
                  <li>📊 二人の収支を一緒に確認</li>
                  <li>🎯 共通の貯金目標を設定</li>
                  <li>💕 Love統計で愛の深さを可視化</li>
                  <li>🎉 記念日の支出を特別に記録</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};