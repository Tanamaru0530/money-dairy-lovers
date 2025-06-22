import { NotificationCounts } from '@/contexts/NotificationContext';

/**
 * Create mock notification counts
 */
export const createMockNotificationCounts = (
  overrides?: Partial<NotificationCounts>
): NotificationCounts => {
  return {
    total: 0,
    unreadTransactions: 0,
    upcomingEvents: 0,
    budgetAlerts: 0,
    partnerRequests: 0,
    ...overrides,
  };
};

/**
 * Create notification counts with some notifications
 */
export const createMockActiveNotifications = (): NotificationCounts => {
  return createMockNotificationCounts({
    total: 5,
    unreadTransactions: 2,
    upcomingEvents: 1,
    budgetAlerts: 1,
    partnerRequests: 1,
  });
};

/**
 * Create notification counts for Love features
 */
export const createMockLoveNotifications = (): NotificationCounts => {
  return createMockNotificationCounts({
    total: 3,
    unreadTransactions: 0,
    upcomingEvents: 2, // Anniversary, date night
    budgetAlerts: 0,
    partnerRequests: 1,
  });
};