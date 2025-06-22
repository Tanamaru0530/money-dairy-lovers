import { Budget, BudgetCreate, BudgetWithProgress } from '@/types/budget';

/**
 * Create a mock budget
 */
export const createMockBudget = (overrides?: Partial<Budget>): Budget => {
  const now = new Date().toISOString();
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  return {
    id: 'budget-123',
    user_id: '123',
    partnership_id: null,
    category_id: 'cat-123',
    name: '食費予算',
    amount: 30000,
    period: 'monthly',
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    alert_threshold: 80,
    is_active: true,
    is_love_budget: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
};

/**
 * Create a love budget
 */
export const createMockLoveBudget = (overrides?: Partial<Budget>): Budget => {
  return createMockBudget({
    id: 'budget-love-123',
    category_id: 'cat-love-123',
    name: 'デート予算',
    amount: 20000,
    is_love_budget: true,
    ...overrides,
  });
};

/**
 * Create a shared budget
 */
export const createMockSharedBudget = (overrides?: Partial<Budget>): Budget => {
  return createMockBudget({
    id: 'budget-shared-123',
    partnership_id: '789',
    name: '共同生活費予算',
    amount: 100000,
    ...overrides,
  });
};

/**
 * Create a budget with progress
 */
export const createMockBudgetWithProgress = (
  overrides?: Partial<BudgetWithProgress>
): BudgetWithProgress => {
  const budget = createMockBudget(overrides);
  const spent = overrides?.spent_amount || overrides?.spentAmount || 15000;
  const percentage = (spent / budget.amount) * 100;
  
  return {
    ...budget,
    spent_amount: spent,
    spentAmount: spent,
    remaining_amount: budget.amount - spent,
    remainingAmount: budget.amount - spent,
    usage_percentage: percentage,
    usagePercentage: percentage,
    is_over_budget: percentage >= 100,
    isOverBudget: percentage >= 100,
    is_alert_threshold_reached: percentage >= 80,
    isAlertThresholdReached: percentage >= 80,
    ...overrides,
  };
};

/**
 * Create budget create data
 */
export const createMockBudgetCreate = (overrides?: Partial<BudgetCreate>): BudgetCreate => {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  return {
    category_id: 'cat-123',
    name: '新規予算',
    amount: 50000,
    period: 'monthly',
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    alert_threshold: 80,
    is_love_budget: false,
    ...overrides,
  };
};

/**
 * Create a list of budgets with different statuses
 */
export const createMockBudgetList = (): BudgetWithProgress[] => {
  return [
    createMockBudgetWithProgress({
      id: 'budget-1',
      name: '食費予算',
      amount: 30000,
      spent_amount: 25000,
      spentAmount: 25000,
    }),
    createMockBudgetWithProgress({
      id: 'budget-2',
      name: '交通費予算',
      amount: 10000,
      spent_amount: 8500,
      spentAmount: 8500,
      category_id: 'cat-2',
    }),
    createMockBudgetWithProgress({
      id: 'budget-3',
      name: 'デート予算',
      amount: 20000,
      spent_amount: 5000,
      spentAmount: 5000,
      is_love_budget: true,
      category_id: 'cat-love-123',
    }),
  ];
};