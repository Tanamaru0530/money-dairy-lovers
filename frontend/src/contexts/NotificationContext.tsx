import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface NotificationCounts {
  total: number;
  unreadTransactions: number;
  upcomingEvents: number;
  budgetAlerts: number;
  partnerRequests: number;
}

interface NotificationContextType {
  counts: NotificationCounts;
  refreshCounts: () => Promise<void>;
  clearNotification: (type: keyof Omit<NotificationCounts, 'total'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    unreadTransactions: 0,
    upcomingEvents: 0,
    budgetAlerts: 0,
    partnerRequests: 0,
  });

  const fetchNotificationCounts = async () => {
    if (!isAuthenticated) return;

    try {
      // 今後のイベント数を取得
      const eventsResponse = await api.get('/love/events/upcoming?days=7');
      const upcomingEvents = eventsResponse.data.length;

      // 予算アラートを取得（仮）
      // const budgetResponse = await api.get('/budgets/alerts');
      // const budgetAlerts = budgetResponse.data.length;
      const budgetAlerts = 0; // 仮の値

      // パートナーリクエスト数を取得（仮）
      const partnerRequests = 0; // 仮の値

      const newCounts = {
        unreadTransactions: 0,
        upcomingEvents,
        budgetAlerts,
        partnerRequests,
        total: upcomingEvents + budgetAlerts + partnerRequests,
      };

      setCounts(newCounts);
    } catch (error) {
      console.error('Failed to fetch notification counts:', error);
    }
  };

  const refreshCounts = async () => {
    await fetchNotificationCounts();
  };

  const clearNotification = (type: keyof Omit<NotificationCounts, 'total'>) => {
    setCounts(prev => ({
      ...prev,
      [type]: 0,
      total: prev.total - prev[type],
    }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCounts();
      // 5分ごとに通知を更新
      const interval = setInterval(fetchNotificationCounts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ counts, refreshCounts, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};