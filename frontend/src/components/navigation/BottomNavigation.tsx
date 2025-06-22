import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNavigation.module.scss';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'ホーム', icon: '🏠' },
  { path: '/transactions', label: '取引', icon: '💰' },
  { path: '/transactions/add', label: '追加', icon: '➕' },
  { path: '/categories', label: 'カテゴリ', icon: '📁' },
  { path: '/settings', label: '設定', icon: '⚙️' },
];

export const BottomNavigation: React.FC = () => {
  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''} ${
                item.path === '/transactions/add' ? styles.primary : ''
              }`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};