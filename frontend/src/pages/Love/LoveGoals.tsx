import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { loveService } from '../../services/loveService';
import { LoveGoalWithProgress, LoveGoalCreate, LoveGoalUpdate } from '../../types/love';
import { useToastContext } from '../../contexts/ToastContext';
import styles from './LoveGoals.module.scss';

export const LoveGoals: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [goals, setGoals] = useState<LoveGoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LoveGoalWithProgress | null>(null);
  const [formData, setFormData] = useState<LoveGoalCreate>({
    name: '',
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    categoryId: null,
    alertThreshold: 80
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loveService.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to load Love Goals:', err);
      setError('Love Goalsの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const newGoal = await loveService.createGoal(formData);
      setGoals([...goals, newGoal]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Love Goalを作成しました！💕');
      
      // 目標達成の通知（新規作成時のみチェック）
      if (newGoal.isAchieved) {
        toast.success(`🎉 目標「${newGoal.name}」を達成しました！`);
      }
    } catch (err) {
      console.error('Failed to create Love Goal:', err);
      toast.error('Love Goalの作成に失敗しました');
    }
  };

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return;

    try {
      const updateData: LoveGoalUpdate = {
        name: formData.name,
        amount: formData.amount,
        isActive: true
      };
      
      const updatedGoal = await loveService.updateGoal(selectedGoal.id, updateData);
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      setShowEditModal(false);
      setSelectedGoal(null);
      resetForm();
      toast.success('Love Goalを更新しました！💕');
      
      // 目標達成の通知
      if (updatedGoal.isAchieved && !selectedGoal.isAchieved) {
        toast.success(`🎉 目標「${updatedGoal.name}」を達成しました！`);
      }
    } catch (err) {
      console.error('Failed to update Love Goal:', err);
      toast.error('Love Goalの更新に失敗しました');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('このLove Goalを削除してもよろしいですか？')) return;

    try {
      await loveService.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
      toast.success('Love Goalを削除しました');
    } catch (err) {
      console.error('Failed to delete Love Goal:', err);
      toast.error('Love Goalの削除に失敗しました');
    }
  };

  const handleEdit = (goal: LoveGoalWithProgress) => {
    setSelectedGoal(goal);
    setFormData({
      name: goal.name,
      amount: goal.amount,
      period: goal.period,
      startDate: goal.startDate,
      categoryId: goal.categoryId,
      alertThreshold: goal.alertThreshold
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      categoryId: null,
      alertThreshold: 80
    });
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getGoalStatusColor = (goal: LoveGoalWithProgress) => {
    if (goal.isAchieved) return styles.achieved;
    if (goal.progressPercentage >= goal.alertThreshold) return styles.warning;
    return '';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className={styles.loading}>
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorMessage message={error} onRetry={loadGoals} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.loveGoals}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>💕 Love Goals</h1>
            <p className={styles.subtitle}>二人の愛の目標を管理しましょう</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className={styles.createButton}
          >
            <span className={styles.buttonIcon}>🎯</span>
            新しい目標を作成
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💝</div>
            <h2>Love Goalsがまだありません</h2>
            <p>二人の夢や目標を設定してみましょう！</p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className={styles.emptyButton}
            >
              最初の目標を作成
            </Button>
          </div>
        ) : (
          <div className={styles.goalsList}>
            {goals.map((goal) => (
              <div 
                key={goal.id} 
                className={`${styles.goalCard} ${getGoalStatusColor(goal)}`}
              >
                <div className={styles.goalHeader}>
                  <h3 className={styles.goalName}>
                    {goal.name}
                    {goal.isAchieved && <span className={styles.achievedBadge}>✅ 達成</span>}
                  </h3>
                  <div className={styles.goalActions}>
                    <button
                      onClick={() => handleEdit(goal)}
                      className={styles.editButton}
                      aria-label="編集"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className={styles.deleteButton}
                      aria-label="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className={styles.goalProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${Math.min(goal.progressPercentage, 100)}%`,
                        backgroundColor: goal.isAchieved ? '#10b981' : undefined
                      }}
                    />
                  </div>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressText}>
                      {formatAmount(goal.spentAmount)} / {formatAmount(goal.amount)}
                    </span>
                    <span className={styles.progressPercentage}>
                      {goal.progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className={styles.goalMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>📅</span>
                    <span>{goal.period === 'monthly' ? '毎月' : goal.period === 'yearly' ? '年間' : 'カスタム'}</span>
                  </div>
                  {goal.daysRemaining !== undefined && goal.daysRemaining > 0 && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>⏰</span>
                      <span>残り{goal.daysRemaining}日</span>
                    </div>
                  )}
                  {goal.progressPercentage >= goal.alertThreshold && !goal.isAchieved && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>⚠️</span>
                      <span>予算の{goal.alertThreshold}%に到達</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 作成モーダル */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="新しいLove Goal"
        >
          <div className={styles.modalContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                目標名 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                placeholder="例: 月のデート代、結婚資金"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                目標金額 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className={styles.input}
                placeholder="50000"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>期間</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                className={styles.select}
              >
                <option value="monthly">毎月</option>
                <option value="yearly">年間</option>
                <option value="custom">カスタム</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>開始日</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>アラート閾値 (%)</label>
              <input
                type="number"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: Number(e.target.value) })}
                className={styles.input}
                min="0"
                max="100"
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateGoal}
                disabled={!formData.name || formData.amount <= 0}
              >
                作成
              </Button>
            </div>
          </div>
        </Modal>

        {/* 編集モーダル */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedGoal(null);
            resetForm();
          }}
          title="Love Goalを編集"
        >
          <div className={styles.modalContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                目標名 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                目標金額 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className={styles.input}
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedGoal(null);
                  resetForm();
                }}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateGoal}
                disabled={!formData.name || formData.amount <= 0}
              >
                更新
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageLayout>
  );
};