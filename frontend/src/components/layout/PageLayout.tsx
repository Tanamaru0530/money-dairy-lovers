import React from 'react';
import { Navigation } from '../common/Navigation';
import styles from './PageLayout.module.scss';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className={styles.pageLayout}>
      <Navigation />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};