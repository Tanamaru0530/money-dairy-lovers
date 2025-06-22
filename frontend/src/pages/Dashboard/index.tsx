import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from '../../components/common/Navigation';
import { dashboardService, DashboardSummary } from '../../services/dashboardService';
import { formatAmount } from '../../utils/format';
import styles from './Dashboard.module.scss';

// Chart.js の登録
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('ダッシュボードデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 前月比の計算
  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) return '±0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // カテゴリチャートデータの準備
  const getCategoryChartData = () => {
    if (!summary) return null;

    const labels = summary.categories.map(cat => cat.category.name);
    const data = summary.categories.map(cat => cat.amount);
    const backgroundColor = summary.categories.map(cat => cat.category.color || '#9CA3AF');

    return {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 0,
      }],
    };
  };

  // 月次比較チャートデータの準備
  const getMonthlyComparisonData = () => {
    if (!summary) return null;

    return {
      labels: ['前月', '今月'],
      datasets: [
        {
          label: '収入',
          data: [summary.previous_month.income, summary.current_month.income],
          backgroundColor: '#10B981',
        },
        {
          label: '支出',
          data: [summary.previous_month.expense, summary.current_month.expense],
          backgroundColor: '#EF4444',
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Navigation />
        <main className={styles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>💕</div>
            <p>愛を込めて読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <Navigation />
        <main className={styles.mainContent}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>💔</div>
            <p>{error}</p>
            <button onClick={loadDashboardData} className={styles.retryButton}>
              もう一度試す
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Navigation />
      
      <main className={styles.mainContent}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            <span className={styles.icon}>💕</span>
            おかえりなさい、{user?.display_name || 'ユーザー'}さん！
          </h1>
          <p className={styles.welcomeSubtitle}>
            今日も愛を込めて家計管理をしましょう
          </p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>今月の収入</h3>
              <p className={styles.statValue}>{formatAmount(summary?.current_month.income || 0)}</p>
              <p className={styles.statChange}>
                先月比 {calculateChange(
                  summary?.current_month.income || 0,
                  summary?.previous_month.income || 0
                )}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💸</div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>今月の支出</h3>
              <p className={styles.statValue}>{formatAmount(summary?.current_month.expense || 0)}</p>
              <p className={styles.statChange}>
                先月比 {calculateChange(
                  summary?.current_month.expense || 0,
                  summary?.previous_month.expense || 0
                )}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💝</div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>Love支出</h3>
              <p className={styles.statValue}>{formatAmount(summary?.love_stats.love_spending || 0)}</p>
              <p className={styles.statChange}>
                {summary?.love_stats.love_transactions || 0} 回の愛の記録
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💖</div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>Love評価</h3>
              <p className={styles.statValue}>
                {summary?.love_stats.average_love_rating 
                  ? `${summary.love_stats.average_love_rating.toFixed(1)} / 5.0`
                  : '---'}
              </p>
              <p className={styles.statChange}>愛の満足度</p>
            </div>
          </div>
        </div>

        <div className={styles.chartsSection}>
          <div className={styles.chartContainer}>
            <h2 className={styles.sectionTitle}>カテゴリ別支出</h2>
            {summary && summary.categories.length > 0 ? (
              <div className={styles.doughnutChart}>
                <Doughnut 
                  data={getCategoryChartData()!}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 12,
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className={styles.emptyChart}>
                <p>まだ支出データがありません 💕</p>
              </div>
            )}
          </div>

          <div className={styles.chartContainer}>
            <h2 className={styles.sectionTitle}>月次比較</h2>
            {summary ? (
              <div className={styles.barChart}>
                <Bar 
                  data={getMonthlyComparisonData()!}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className={styles.emptyChart}>
                <p>データを読み込み中... 💕</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.recentTransactions}>
          <h2 className={styles.sectionTitle}>最近の取引</h2>
          {summary && summary.recent_transactions.length > 0 ? (
            <div className={styles.transactionList}>
              {summary.recent_transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className={styles.transactionItem}>
                  <div className={styles.transactionIcon}>
                    {transaction.category?.icon || '💰'}
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionName}>
                      {transaction.category?.name || 'その他'}
                    </div>
                    <div className={styles.transactionDescription}>
                      {transaction.description || '---'}
                    </div>
                  </div>
                  <div className={styles.transactionAmount}>
                    <span className={transaction.transaction_type === 'income' ? styles.income : styles.expense}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
              <Link to="/transactions" className={styles.viewAllLink}>
                すべての取引を見る →
              </Link>
            </div>
          ) : (
            <div className={styles.emptyTransactions}>
              <p>まだ取引がありません</p>
              <Link to="/transactions/add" className={styles.addFirstTransaction}>
                最初の取引を追加する 💕
              </Link>
            </div>
          )}
        </div>

        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>クイックアクション</h2>
          <div className={styles.actionGrid}>
            <Link to="/transactions/add" className={styles.actionCard}>
              <div className={styles.actionIcon}>➕</div>
              <span className={styles.actionText}>取引を追加</span>
            </Link>
            
            <Link to="/categories" className={styles.actionCard}>
              <div className={styles.actionIcon}>📁</div>
              <span className={styles.actionText}>カテゴリ管理</span>
            </Link>
            
            <Link to="/reports" className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <span className={styles.actionText}>レポート表示</span>
            </Link>
            
            <Link to="/love/events" className={styles.actionCard}>
              <div className={styles.actionIcon}>💕</div>
              <span className={styles.actionText}>Love イベント</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};