import { Transaction, TransactionCreate, TransactionResponse } from '@/types/transaction';
import { CategoryWithStats } from '@/types/category';

/**
 * Create a mock category
 */
export const createMockCategory = (overrides?: Partial<CategoryWithStats>): CategoryWithStats => {
  return {
    id: 'cat-123',
    name: '食費',
    icon: '🍽️',
    color: '#FF6B6B',
    is_default: true,
    is_love_category: false,
    user_id: undefined,
    sort_order: 1,
    created_at: new Date().toISOString(),
    transaction_count: 10,
    total_amount: 50000,
    ...overrides,
  };
};

/**
 * Create a love category
 */
export const createMockLoveCategory = (overrides?: Partial<CategoryWithStats>): CategoryWithStats => {
  return createMockCategory({
    id: 'cat-love-123',
    name: 'デート代',
    icon: '💕',
    color: '#FF69B4',
    is_love_category: true,
    sort_order: 7,
    ...overrides,
  });
};

/**
 * Create a mock transaction
 */
export const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => {
  const now = new Date().toISOString();
  
  return {
    id: 'trans-123',
    userId: '123',
    categoryId: 'cat-123',
    category: createMockCategory(),
    amount: 1000,
    transactionType: 'expense',
    sharingType: 'personal',
    paymentMethod: 'cash',
    description: 'ランチ代',
    transactionDate: new Date().toISOString().split('T')[0],
    loveRating: undefined,
    tags: [],
    location: undefined,
    receiptImageUrl: undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * Create a love transaction
 */
export const createMockLoveTransaction = (overrides?: Partial<Transaction>): Transaction => {
  return createMockTransaction({
    categoryId: 'cat-love-123',
    category: createMockLoveCategory(),
    sharingType: 'shared',
    description: '映画デート',
    loveRating: 5,
    tags: ['デート', '映画'],
    ...overrides,
  });
};

/**
 * Create a shared transaction
 */
export const createMockSharedTransaction = (overrides?: Partial<Transaction>): Transaction => {
  return createMockTransaction({
    sharingType: 'shared',
    sharedInfo: {
      splitType: 'equal',
      user1Amount: 500,
      user2Amount: 500,
      payerUserId: '123',
      notes: '折半',
    },
    ...overrides,
  });
};

/**
 * Create transaction create data
 */
export const createMockTransactionCreate = (
  overrides?: Partial<TransactionCreate>
): TransactionCreate => {
  return {
    categoryId: 'cat-123',
    amount: 1000,
    transactionType: 'expense',
    sharingType: 'personal',
    paymentMethod: 'cash',
    description: 'テスト取引',
    transactionDate: new Date().toISOString().split('T')[0],
    ...overrides,
  };
};

/**
 * Create a list of transactions for testing
 */
export const createMockTransactionList = (count: number = 5): Transaction[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockTransaction({
      id: `trans-${index + 1}`,
      amount: (index + 1) * 1000,
      description: `取引 ${index + 1}`,
      transactionDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    })
  );
};

/**
 * Create transaction response with pagination
 */
export const createMockTransactionResponse = (overrides?: {
  transactions?: Transaction[];
  page?: number;
  limit?: number;
  total?: number;
}): TransactionResponse => {
  const transactions = overrides?.transactions || createMockTransactionList(5);
  const total = overrides?.total || transactions.length;
  const page = overrides?.page || 1;
  const limit = overrides?.limit || 20;
  
  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};