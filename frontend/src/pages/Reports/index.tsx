import React, { useState, useEffect } from 'react'
import { Navigation } from '../../components/common/Navigation'
import { reportService } from '../../services/reportService'
import { categoryService } from '../../services/categoryService'
import { exportMonthlyReportToCSV, exportYearlyReportToCSV } from '../../utils/csvExport'
import type { MonthlyReport, YearlyReport, LoveStatistics } from '../../types/report'
import type { Category } from '../../types/category'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import styles from './Reports.module.scss'

// Chart.js の登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

type ReportType = 'monthly' | 'yearly' | 'love'

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('monthly')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null)
  const [yearlyReport, setYearlyReport] = useState<YearlyReport | null>(null)
  const [loveStats, setLoveStats] = useState<LoveStatistics | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadReport()
  }, [reportType, selectedYear, selectedMonth])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data.categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadReport = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (reportType === 'monthly') {
        const report = await reportService.getMonthlyReport(selectedYear, selectedMonth)
        setMonthlyReport(report)
        if (report.love_statistics) {
          setLoveStats(report.love_statistics)
        }
      } else if (reportType === 'yearly') {
        const report = await reportService.getYearlyReport(selectedYear)
        setYearlyReport(report)
      } else if (reportType === 'love') {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
        const stats = await reportService.getLoveSummary({ start_date: startDate, end_date: endDate })
        if ('message' in stats) {
          setLoveStats(null)
        } else {
          setLoveStats(stats)
        }
      }
    } catch (error) {
      console.error('Failed to load report:', error)
      setError('レポートの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (reportType === 'monthly' && monthlyReport) {
      exportMonthlyReportToCSV(monthlyReport, selectedYear, selectedMonth)
    } else if (reportType === 'yearly' && yearlyReport) {
      exportYearlyReportToCSV(yearlyReport, selectedYear)
    }
  }

  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const renderMonthlyReport = () => {
    if (!monthlyReport) return null

    const expenseByCategory = monthlyReport.expenseByCategory || monthlyReport.expense_by_category || []
    console.log('Monthly Report expense by category:', expenseByCategory)
    
    const categoryChartData = {
      labels: expenseByCategory.map(cat => `${cat.categoryIcon} ${cat.categoryName}`),
      datasets: [{
        data: expenseByCategory.map(cat => cat.totalAmount),
        backgroundColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
          '#FFEAA7',
          '#DDA0DD',
          '#FF69B4',
          '#FF1493',
          '#FF6347',
          '#95A5A6'
        ],
      }]
    }

    return (
      <div className={styles.reportContent}>
        {/* 月次サマリー */}
        <div className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>📊</span>
            {selectedYear}年{selectedMonth}月のサマリー
          </h2>
          
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}>💰</div>
              <div className={styles.cardContent}>
                <h3>収入</h3>
                <p className={styles.amount}>¥{(monthlyReport.totalIncome || monthlyReport.total_income || 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}>💸</div>
              <div className={styles.cardContent}>
                <h3>支出</h3>
                <p className={styles.amount}>¥{(monthlyReport.totalExpense || monthlyReport.total_expense || 0).toLocaleString()}</p>
                {(monthlyReport.expenseChangePercentage !== null || monthlyReport.expense_change_percentage !== null) && (
                  <p className={`${styles.change} ${(monthlyReport.expenseChangePercentage || monthlyReport.expense_change_percentage || 0) > 0 ? styles.increase : styles.decrease}`}>
                    前月比: {(monthlyReport.expenseChangePercentage || monthlyReport.expense_change_percentage || 0) > 0 ? '+' : ''}{Math.round(monthlyReport.expenseChangePercentage || monthlyReport.expense_change_percentage || 0)}%
                  </p>
                )}
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}>💵</div>
              <div className={styles.cardContent}>
                <h3>収支</h3>
                <p className={`${styles.amount} ${(monthlyReport.balance || 0) >= 0 ? styles.positive : styles.negative}`}>
                  ¥{(monthlyReport.balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}>📝</div>
              <div className={styles.cardContent}>
                <h3>取引数</h3>
                <p className={styles.amount}>{monthlyReport.transactionCount || monthlyReport.transaction_count || 0}件</p>
                <p className={styles.meta}>日平均: ¥{Math.round(monthlyReport.dailyAverageExpense || monthlyReport.daily_average_expense || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* カテゴリ別支出 */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>🍩</span>
            カテゴリ別支出
          </h2>
          
          <div className={styles.chartContainer}>
            <Doughnut data={categoryChartData} options={chartOptions} />
          </div>
          
          <div className={styles.categoryList}>
            {expenseByCategory.map((cat, index) => (
              <div key={cat.categoryId} className={styles.categoryItem}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryIcon}>{cat.categoryIcon}</span>
                  <span className={styles.categoryName}>{cat.categoryName}</span>
                  {cat.isLoveCategory && <span className={styles.loveBadge}>💕</span>}
                </div>
                <div className={styles.categoryStats}>
                  <span className={styles.categoryAmount}>¥{(cat.totalAmount || 0).toLocaleString()}</span>
                  <span className={styles.categoryPercentage}>{Math.round(cat.percentage || 0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 共有支出 */}
        <div className={styles.sharingSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>👫</span>
            支出タイプ
          </h2>
          
          <div className={styles.sharingGrid}>
            <div className={styles.sharingCard}>
              <h4>個人支出</h4>
              <p className={styles.sharingAmount}>¥{(monthlyReport.personalExpense || monthlyReport.personal_expense || 0).toLocaleString()}</p>
              <p className={styles.sharingPercentage}>{Math.round(100 - (monthlyReport.sharedPercentage || monthlyReport.shared_percentage || 0))}%</p>
            </div>
            <div className={styles.sharingCard}>
              <h4>共有支出</h4>
              <p className={styles.sharingAmount}>¥{(monthlyReport.sharedExpense || monthlyReport.shared_expense || 0).toLocaleString()}</p>
              <p className={styles.sharingPercentage}>{Math.round(monthlyReport.sharedPercentage || monthlyReport.shared_percentage || 0)}%</p>
            </div>
          </div>
        </div>

        {/* 最大支出 */}
        {(monthlyReport.largestExpense || monthlyReport.largest_expense) && (
          <div className={styles.highlightSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.icon}>🏆</span>
              今月の最大支出
            </h2>
            <div className={styles.highlightCard}>
              <p className={styles.highlightAmount}>¥{((monthlyReport.largestExpense || monthlyReport.largest_expense)?.amount || 0).toLocaleString()}</p>
              <p className={styles.highlightDescription}>{(monthlyReport.largestExpense || monthlyReport.largest_expense)?.description || ''}</p>
              <p className={styles.highlightDate}>{(monthlyReport.largestExpense || monthlyReport.largest_expense)?.date || ''}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderYearlyReport = () => {
    if (!yearlyReport) return null

    const monthlyTrends = yearlyReport.monthlyTrends || yearlyReport.monthly_trends || []
    
    const monthlyTrendData = {
      labels: monthlyTrends.map(trend => {
        const [year, month] = trend.month.split('-')
        return `${parseInt(month)}月`
      }),
      datasets: [
        {
          label: '収入',
          data: monthlyTrends.map(trend => trend.income),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
        {
          label: '支出',
          data: monthlyTrends.map(trend => trend.expense),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Love支出',
          data: monthlyTrends.map(trend => trend.love_spending),
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.4,
        }
      ]
    }

    return (
      <div className={styles.reportContent}>
        {/* 年間サマリー */}
        <div className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>📈</span>
            {selectedYear}年の年間サマリー
          </h2>
          
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}>💰</div>
              <div className={styles.cardContent}>
                <h3>年間収入</h3>
                <p className={styles.amount}>¥{(yearlyReport.totalIncome || yearlyReport.total_income || 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}>💸</div>
              <div className={styles.cardContent}>
                <h3>年間支出</h3>
                <p className={styles.amount}>¥{(yearlyReport.totalExpense || yearlyReport.total_expense || 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}>💵</div>
              <div className={styles.cardContent}>
                <h3>年間収支</h3>
                <p className={`${styles.amount} ${(yearlyReport.totalBalance || yearlyReport.total_balance || 0) >= 0 ? styles.positive : styles.negative}`}>
                  ¥{(yearlyReport.totalBalance || yearlyReport.total_balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
            
            {(yearlyReport.yearlyLoveStatistics || yearlyReport.yearly_love_statistics) && (
              <div className={styles.summaryCard}>
                <div className={styles.cardIcon}>💕</div>
                <div className={styles.cardContent}>
                  <h3>Love支出</h3>
                  <p className={styles.amount}>¥{((yearlyReport.yearlyLoveStatistics || yearlyReport.yearly_love_statistics)?.totalLoveSpending || (yearlyReport.yearlyLoveStatistics || yearlyReport.yearly_love_statistics)?.total_love_spending || 0).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 月次トレンド */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>📊</span>
            月次トレンド
          </h2>
          
          <div className={styles.chartContainer} style={{ height: '400px' }}>
            <Line data={monthlyTrendData} options={chartOptions} />
          </div>
        </div>

        {/* 最高・最低 */}
        <div className={styles.extremesSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>📈</span>
            最高・最低記録
          </h2>
          
          <div className={styles.extremesGrid}>
            <div className={styles.extremeCard}>
              <h4>最高支出月</h4>
              <p className={styles.extremeMonth}>{yearlyReport.highestExpenseMonth || yearlyReport.highest_expense_month || '-'}</p>
            </div>
            <div className={styles.extremeCard}>
              <h4>最低支出月</h4>
              <p className={styles.extremeMonth}>{yearlyReport.lowestExpenseMonth || yearlyReport.lowest_expense_month || '-'}</p>
            </div>
            <div className={styles.extremeCard}>
              <h4>最高収入月</h4>
              <p className={styles.extremeMonth}>{yearlyReport.highestIncomeMonth || yearlyReport.highest_income_month || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderLoveReport = () => {
    if (!loveStats) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💕</div>
          <h3>Love取引がありません</h3>
          <p>この期間のLove取引を記録して、愛の統計を見てみましょう</p>
        </div>
      )
    }

    const loveTrend = loveStats.loveTrend || loveStats.love_trend || []
    
    const loveTrendData = {
      labels: loveTrend.map(trend => {
        const date = new Date(trend.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      datasets: [{
        label: 'Love支出',
        data: loveTrend.map(trend => trend.amount),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    }

    return (
      <div className={styles.reportContent}>
        {/* Love統計サマリー */}
        <div className={styles.loveSummarySection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>💕</span>
            Love統計
          </h2>
          
          <div className={styles.loveGrid}>
            <div className={styles.loveCard}>
              <div className={styles.loveIcon}>💰</div>
              <h3>Love支出合計</h3>
              <p className={styles.loveAmount}>¥{(loveStats.totalLoveSpending || loveStats.total_love_spending || 0).toLocaleString()}</p>
            </div>
            
            <div className={styles.loveCard}>
              <div className={styles.loveIcon}>🎯</div>
              <h3>Love取引数</h3>
              <p className={styles.loveAmount}>{loveStats.loveTransactionCount || loveStats.love_transaction_count || 0}件</p>
            </div>
            
            <div className={styles.loveCard}>
              <div className={styles.loveIcon}>⭐</div>
              <h3>平均Love評価</h3>
              <p className={styles.loveAmount}>{(loveStats.averageLoveRating || loveStats.average_love_rating || 0).toFixed(1)}</p>
            </div>
            
            <div className={styles.loveCard}>
              <div className={styles.loveIcon}>📊</div>
              <h3>支出に占める割合</h3>
              <p className={styles.loveAmount}>{Math.round(loveStats.loveSpendingPercentage || loveStats.love_spending_percentage || 0)}%</p>
            </div>
          </div>
        </div>

        {/* Love支出推移 */}
        {loveTrend.length > 0 && (
          <div className={styles.chartSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.icon}>📈</span>
              Love支出の推移
            </h2>
            
            <div className={styles.chartContainer} style={{ height: '300px' }}>
              <Line data={loveTrendData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Loveカテゴリ内訳 */}
        <div className={styles.loveCategorySection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>🎁</span>
            Loveカテゴリ内訳
          </h2>
          
          <div className={styles.loveCategoryList}>
            {(loveStats.loveSpendingByCategory || loveStats.love_spending_by_category || []).map(cat => (
              <div key={cat.categoryId} className={styles.loveCategoryItem}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryIcon}>{cat.categoryIcon}</span>
                  <span className={styles.categoryName}>{cat.categoryName}</span>
                </div>
                <div className={styles.categoryStats}>
                  <span className={styles.categoryAmount}>¥{(cat.totalAmount || 0).toLocaleString()}</span>
                  <span className={styles.categoryCount}>{cat.transactionCount || 0}件</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* お気に入りLoveカテゴリ */}
        {(loveStats.favoriteLoveCategory || loveStats.favorite_love_category) && (
          <div className={styles.favoriteSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.icon}>🏆</span>
              最も愛されたカテゴリ
            </h2>
            <div className={styles.favoriteCard}>
              <div className={styles.favoriteIcon}>{(loveStats.favoriteLoveCategory || loveStats.favorite_love_category)?.categoryIcon}</div>
              <h3>{(loveStats.favoriteLoveCategory || loveStats.favorite_love_category)?.categoryName}</h3>
              <p className={styles.favoriteAmount}>¥{((loveStats.favoriteLoveCategory || loveStats.favorite_love_category)?.totalAmount || 0).toLocaleString()}</p>
              <p className={styles.favoriteMeta}>{(loveStats.favoriteLoveCategory || loveStats.favorite_love_category)?.transactionCount || 0}回の愛の記録</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.reportsPage}>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>📊</div>
          <p>レポートを生成中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.reportsPage}>
      <Navigation />
      
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>📊 レポート</h1>
            <p className={styles.pageSubtitle}>収支を分析して、より良い家計管理を</p>
          </div>
          {(reportType === 'monthly' && monthlyReport) || (reportType === 'yearly' && yearlyReport) ? (
            <button 
              className={styles.exportButton}
              onClick={handleExportCSV}
              title="CSVファイルをダウンロード"
            >
              <span className={styles.exportIcon}>📥</span>
              CSVエクスポート
            </button>
          ) : null}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* レポートタイプ選択 */}
        <div className={styles.reportTypeSelector}>
          <button
            className={`${styles.typeButton} ${reportType === 'monthly' ? styles.active : ''}`}
            onClick={() => setReportType('monthly')}
          >
            <span className={styles.icon}>📅</span>
            月次レポート
          </button>
          <button
            className={`${styles.typeButton} ${reportType === 'yearly' ? styles.active : ''}`}
            onClick={() => setReportType('yearly')}
          >
            <span className={styles.icon}>📈</span>
            年次レポート
          </button>
          <button
            className={`${styles.typeButton} ${reportType === 'love' ? styles.active : ''}`}
            onClick={() => setReportType('love')}
          >
            <span className={styles.icon}>💕</span>
            Love統計
          </button>
        </div>

        {/* 期間選択 */}
        <div className={styles.periodSelector}>
          <div className={styles.yearSelector}>
            <label>年</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={styles.select}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i
                return <option key={year} value={year}>{year}年</option>
              })}
            </select>
          </div>
          
          {(reportType === 'monthly' || reportType === 'love') && (
            <div className={styles.monthSelector}>
              <label>月</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className={styles.select}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}月</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* レポート表示 */}
        {reportType === 'monthly' && renderMonthlyReport()}
        {reportType === 'yearly' && renderYearlyReport()}
        {reportType === 'love' && renderLoveReport()}
      </div>
    </div>
  )
}