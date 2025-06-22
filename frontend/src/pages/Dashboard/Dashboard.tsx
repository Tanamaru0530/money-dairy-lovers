import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../../components/layout/PageLayout';
import { dashboardService } from '../../services/dashboard';
import { transactionService } from '../../services/transactionService';
import { loveService } from '../../services/loveService';
import { DashboardSummary, Transaction, CategoryBreakdown } from '../../types';
import { LoveGoalWithProgress } from '../../types/love';
import { WelcomeModal } from '../../components/welcome/WelcomeModal';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useErrorHandler, ErrorState } from '../../hooks/useErrorHandler';
import {
  SkeletonDashboardSummary,
  SkeletonChart,
  SkeletonTransactionList,
  SkeletonLoveGoals
} from '../../components/common/Skeleton';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './Dashboard.module.scss';

// Chart.js の登録
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loveGoals, setLoveGoals] = useState<LoveGoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // 月次サマリー、カテゴリ別内訳、最近の取引、Love Goalsを並行で取得
      const [summaryData, categoryData, transactionsData, goalsData] = await Promise.all([
        dashboardService.getMonthSummary(year, month),
        dashboardService.getCategoryBreakdown(year, month),
        transactionService.getTransactions(1),
        loveService.getGoals({ isActive: true }).catch(() => []) // エラー時は空配列
      ]);

      setSummary(summaryData);
      setCategoryBreakdown(categoryData);
      // 最新10件のみ表示
      setRecentTransactions(transactionsData.transactions.slice(0, 10));
      // 最初の2つのLove Goalsのみ表示
      setLoveGoals(goalsData.slice(0, 2));
      
      // 初回ログインかどうかをチェック（取引がない場合）
      const isFirstLogin = transactionsData.transactions.length === 0;
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      
      if (isFirstLogin && !hasSeenWelcome && user) {
        setShowWelcome(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      const errorInfo = handleError(err, {
        showToast: false, // ダッシュボードではエラーメッセージを直接表示
        onRetry: loadDashboardData
      });
      setError(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className={styles.dashboard}>
          {/* ヘッダー */}
          <div className={styles.header}>
            <div className={styles.greeting}>
              <h1>💕 こんにちは、{user?.displayName || user?.display_name}さん</h1>
              <p className={styles.subtitle}>今月も愛のある家計管理を頑張りましょう！</p>
            </div>
          </div>

          {/* スケルトンローディング */}
          <SkeletonDashboardSummary />
          
          <div className={styles.contentGrid}>
            <div className={styles.chartSection}>
              <SkeletonChart height={300} />
            </div>
            
            <div className={styles.sidebar}>
              <div className={styles.recentTransactions}>
                <h2 className={styles.sectionTitle}>💰 最近の取引</h2>
                <SkeletonTransactionList count={5} />
              </div>
              
              <div className={styles.loveGoals}>
                <h2 className={styles.sectionTitle}>🎯 Love Goals</h2>
                <SkeletonLoveGoals count={2} />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorMessage
          message={error.message}
          onRetry={loadDashboardData}
          isRetryable={error.isRetryable}
          suggestedAction={error.suggestedAction}
          fullPage
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.dashboard}>
        {/* ヘッダー */}
        <div className={styles.header}>
        <div className={styles.greeting}>
          <h1>💕 こんにちは、{user?.displayName || user?.display_name}さん</h1>
          <p className={styles.subtitle}>今月も愛のある家計管理を頑張りましょう！</p>
        </div>
        {user?.partnership && (
          <div className={styles.anniversaryCountdown}>
            <span className={styles.countdownLabel}>記念日まで</span>
            <span className={styles.countdownValue}>14</span>
          </div>
        )}
      </div>

      {/* 月次サマリー */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.income}`}>
          <div className={styles.summaryIcon}>💰</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>今月の収入</div>
            <div className={styles.summaryValue}>
              ¥{(summary?.totalIncome || summary?.total_income || 0).toLocaleString()}
            </div>
            {(summary?.incomeChange !== undefined || summary?.income_change !== undefined) && (
              <div className={`${styles.summaryChange} ${(summary.incomeChange || summary.income_change || 0) >= 0 ? styles.positive : styles.negative}`}>
                {(summary.incomeChange || summary.income_change || 0) >= 0 ? '↗️ +' : '↘️ '}
                {Math.abs(summary.incomeChange || summary.income_change || 0)}%
              </div>
            )}
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.expense}`}>
          <div className={styles.summaryIcon}>💸</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>今月の支出</div>
            <div className={styles.summaryValue}>
              ¥{(summary?.totalExpense || summary?.total_expense || 0).toLocaleString()}
            </div>
            {(summary?.expenseChange !== undefined || summary?.expense_change !== undefined) && (
              <div className={`${styles.summaryChange} ${(summary.expenseChange || summary.expense_change || 0) <= 0 ? styles.positive : styles.negative}`}>
                {(summary.expenseChange || summary.expense_change || 0) >= 0 ? '↗️ +' : '↘️ '}
                {Math.abs(summary.expenseChange || summary.expense_change || 0)}%
              </div>
            )}
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.balance}`}>
          <div className={styles.summaryIcon}>📊</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>収支バランス</div>
            <div className={`${styles.summaryValue} ${((summary?.totalIncome || summary?.total_income || 0) - (summary?.totalExpense || summary?.total_expense || 0)) >= 0 ? styles.positive : styles.negative}`}>
              ¥{((summary?.totalIncome || summary?.total_income || 0) - (summary?.totalExpense || summary?.total_expense || 0)).toLocaleString()}
            </div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.love}`}>
          <div className={styles.summaryIcon}>💕</div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>Love支出</div>
            <div className={styles.summaryValue}>
              ¥{(summary?.loveExpense || summary?.love_expense || 0).toLocaleString()}
            </div>
            <div className={styles.loveRating}>
              {'⭐'.repeat(Math.round(summary?.avgLoveRating || summary?.avg_love_rating || 0))}
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツグリッド */}
      <div className={styles.contentGrid}>
        {/* チャートセクション */}
        <div className={styles.chartSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>📊 カテゴリ別支出</h2>
              <span className={styles.chartPeriod}>今月</span>
            </div>
            <div className={styles.chartContainer}>
              {categoryBreakdown.length > 0 ? (
                <Doughnut
                  data={{
                    labels: categoryBreakdown.map(cat => cat.category.name),
                    datasets: [
                      {
                        data: categoryBreakdown.map(cat => cat.amount),
                        backgroundColor: categoryBreakdown.map(cat => cat.category.color || '#95A5A6'),
                        borderColor: '#fff',
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          padding: 15,
                          font: {
                            size: 12,
                          },
                          generateLabels: (chart) => {
                            const data = chart.data;
                            if (data.labels!.length && data.datasets.length) {
                              return data.labels!.map((label, i) => {
                                const dataset = data.datasets[0];
                                const percentage = categoryBreakdown[i].percentage;
                                const backgroundColor = Array.isArray(dataset.backgroundColor) 
                                  ? dataset.backgroundColor[i] 
                                  : dataset.backgroundColor;
                                return {
                                  text: `${label} (${percentage.toFixed(1)}%)`,
                                  fillStyle: backgroundColor as string,
                                  hidden: false,
                                  index: i,
                                };
                              });
                            }
                            return [];
                          },
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = categoryBreakdown[context.dataIndex].percentage;
                            return `${label}: ¥${value.toLocaleString()} (${percentage.toFixed(1)}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <p className={styles.placeholder}>データがありません</p>
              )}
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className={styles.sidebar}>
          {/* 最近の取引 */}
          <div className={styles.recentTransactions}>
            <h2 className={styles.sectionTitle}>💰 最近の取引</h2>
            <div className={styles.transactionList}>
              {recentTransactions.length === 0 ? (
                <p className={styles.emptyMessage}>取引がありません</p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`${styles.transactionItem} ${
                      transaction.love_rating ? styles.love : ''
                    }`}
                  >
                    <div className={styles.itemInfo}>
                      <div className={styles.itemCategory}>
                        {transaction.category?.icon} {transaction.category?.name}
                      </div>
                      <div className={styles.itemDescription}>
                        {transaction.description}
                      </div>
                      <div className={styles.itemDate}>
                        {new Date(transaction.transaction_date).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <div className={`${styles.itemAmount} ${
                      transaction.transaction_type === 'expense' ? styles.expense : styles.income
                    }`}>
                      {transaction.transaction_type === 'expense' ? '-' : '+'}
                      ¥{(transaction.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Love Goals */}
          <div className={styles.loveGoals}>
            <h2 className={styles.sectionTitle}>🎯 Love Goals</h2>
            {loveGoals.length === 0 ? (
              <p className={styles.emptyMessage}>Love Goalsを設定しましょう！</p>
            ) : (
              loveGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`${styles.goalItem} ${goal.isAchieved ? styles.achieved : ''}`}
                >
                  <div className={styles.goalName}>
                    {goal.name}
                    {goal.isAchieved && ' ✅'}
                  </div>
                  <div className={styles.goalProgress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ 
                          width: `${Math.min(goal.progressPercentage, 100)}%`,
                          backgroundColor: goal.isAchieved ? '#10b981' : undefined
                        }}
                      ></div>
                    </div>
                    <div className={styles.progressText}>
                      <span>¥{(goal.spentAmount || 0).toLocaleString()}</span>
                      <span>¥{(goal.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  {goal.daysRemaining !== undefined && goal.daysRemaining > 0 && (
                    <div className={styles.goalMeta}>
                      残り{goal.daysRemaining}日
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* ウェルカムモーダル */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={user?.displayName || user?.display_name}
      />
    </PageLayout>
  );
};

export default Dashboard;