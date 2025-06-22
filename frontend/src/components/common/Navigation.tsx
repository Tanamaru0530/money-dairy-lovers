import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import partnershipService from '../../services/partnershipService';
import { PartnershipStatus } from '../../types/user';
import styles from './Navigation.module.scss';

export const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { counts } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // パートナーシップ情報を取得
  useEffect(() => {
    const fetchPartnershipStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await partnershipService.getStatus();
          setPartnershipStatus(status);
        } catch (error) {
          console.error('Failed to fetch partnership status:', error);
        }
      }
    };

    fetchPartnershipStatus();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* メール未確認の警告バナー */}
      {user && !user.emailVerified && (
        <div className={styles.emailWarningBanner}>
          <span className={styles.warningIcon}>⚠️</span>
          <span className={styles.warningText}>
            メールアドレスが未確認です
          </span>
          <Link to="/auth/verify-email" className={styles.verifyLink}>
            確認する
          </Link>
        </div>
      )}
      
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <Link to="/dashboard" className={styles.logo}>
          <span className={styles.icon}>💕</span>
          <span className={styles.text}>MDL</span>
          <span className={styles.textFull}>Money Dairy Lovers</span>
        </Link>

        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu} aria-label="メニューを開く">
          <span className={styles.menuIcon}>{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>

        <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          <Link 
            to="/dashboard" 
            className={`${styles.navLink} ${isActiveRoute('/dashboard') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>🏠</span>
            ダッシュボード
          </Link>
          <Link 
            to="/transactions" 
            className={`${styles.navLink} ${isActiveRoute('/transactions') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>💰</span>
            取引
          </Link>
          <Link 
            to="/recurring-transactions" 
            className={`${styles.navLink} ${isActiveRoute('/recurring-transactions') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>🔄</span>
            定期取引
          </Link>
          <Link 
            to="/categories" 
            className={`${styles.navLink} ${isActiveRoute('/categories') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>📁</span>
            カテゴリ
          </Link>
          <Link 
            to="/budgets" 
            className={`${styles.navLink} ${isActiveRoute('/budgets') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>💰</span>
            予算
            {counts.budgetAlerts > 0 && (
              <span className={`${styles.badge} ${styles.badgeWarning}`}>{counts.budgetAlerts}</span>
            )}
          </Link>
          <Link 
            to="/reports" 
            className={`${styles.navLink} ${isActiveRoute('/reports') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>📊</span>
            レポート
          </Link>
          <Link 
            to="/love" 
            className={`${styles.navLink} ${isActiveRoute('/love') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>💕</span>
            Love
            {counts.upcomingEvents > 0 && (
              <span className={`${styles.badge} ${styles.badgeLove}`}>{counts.upcomingEvents}</span>
            )}
          </Link>
          <Link 
            to="/settings" 
            className={`${styles.navLink} ${isActiveRoute('/settings') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.linkIcon}>⚙️</span>
            設定
          </Link>
          
          {/* モバイル用ユーザーメニュー */}
          <div className={styles.mobileUserMenu}>
            <div className={styles.userInfoMobile}>
              {user?.profileImageUrl ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.profileImageUrl}`}
                  alt={user.displayName || 'ユーザー'}
                  className={styles.userAvatarMobile}
                />
              ) : (
                <span className={styles.userIcon}>👤</span>
              )}
              <span className={styles.userName}>{user?.displayName || 'ユーザー'}</span>
            </div>
            {/* モバイルでパートナー情報表示 */}
            {partnershipStatus?.hasPartner && partnershipStatus.partnership && (
              <div className={styles.partnerInfoMobile}>
                <span className={styles.heartIcon}>💕</span>
                <span className={styles.partnerName}>
                  パートナー: {partnershipStatus.partnership.partner?.displayName}
                </span>
              </div>
            )}
            <button onClick={handleLogout} className={styles.logoutButtonMobile}>
              ログアウト
            </button>
          </div>
        </div>

        <div className={styles.userMenu}>
          {/* パートナー情報 */}
          {partnershipStatus?.hasPartner && partnershipStatus.partnership && (
            <div className={styles.partnerInfo}>
              <span className={styles.heartIcon}>💕</span>
              <span className={styles.partnerName}>
                {partnershipStatus.partnership.partner?.displayName}
              </span>
            </div>
          )}
          
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.displayName || 'ユーザー'}</span>
            {user?.profileImageUrl ? (
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.profileImageUrl}`}
                alt={user.displayName || 'ユーザー'}
                className={styles.userAvatar}
              />
            ) : (
              <span className={styles.userIcon}>👤</span>
            )}
          </div>
          
          {/* 通知総数バッジ */}
          {counts.total > 0 && (
            <div className={styles.notificationBadge}>
              <span className={styles.notificationIcon}>🔔</span>
              <span className={styles.notificationCount}>{counts.total}</span>
            </div>
          )}
          
          <button onClick={handleLogout} className={styles.logoutButton}>
            ログアウト
          </button>
        </div>
      </div>
      
      {/* モバイルメニューオーバーレイ */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={toggleMobileMenu} />
      )}
    </nav>
    </>
  );
};

export default Navigation;