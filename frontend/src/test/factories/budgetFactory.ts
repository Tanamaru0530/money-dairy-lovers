import { Budget, BudgetCreate, BudgetWithProgress } from '@/types/budget';
import { createMockCategory, createMockLoveCategory } from './transactionFactory';

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
    userId: '123',
    partnershipId: null,
    categoryId: 'cat-123',
    name: '食費予算',
    amount: 30000,
    period: 'monthly',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    alertThreshold: 80,
    isActive: true,
    isLoveBudget: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * Create a love budget
 */
export const createMockLoveBudget = (overrides?: Partial<Budget>): Budget => {
  return createMockBudget({
    id: 'budget-love-123',
    categoryId: 'cat-love-123',
    name: 'デート予算',
    amount: 20000,
    isLoveBudget: true,
    ...overrides,
  });
};

/**
 * Create a shared budget
 */
export const createMockSharedBudget = (overrides?: Partial<Budget>): Budget => {
  return createMockBudget({
    id: 'budget-shared-123',
    partnershipId: '789',
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
  const spent = overrides?.spent || 15000;
  const percentage = (spent / budget.amount) * 100;
  
  return {
    ...budget,
    category: overrides?.category || createMockCategory(),
    spent,
    remaining: budget.amount - spent,
    percentage,
    status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe',
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
    categoryId: 'cat-123',
    name: '新規予算',
    amount: 50000,
    period: 'monthly',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    alertThreshold: 80,
    isActive: true,
    isLoveBudget: false,
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
      spent: 25000,
    }),
    createMockBudgetWithProgress({
      id: 'budget-2',
      name: '交通費予算',
      amount: 10000,
      spent: 8500,
      categoryId: 'cat-2',
      category: createMockCategory({ id: 'cat-2', name: '交通費', icon: '🚗' }),
    }),
    createMockBudgetWithProgress({
      id: 'budget-3',
      name: 'デート予算',
      amount: 20000,
      spent: 5000,
      isLoveBudget: true,
      categoryId: 'cat-love-123',
      category: createMockLoveCategory(),
    }),
  ];
};