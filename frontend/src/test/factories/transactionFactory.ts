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
    user_id: '123',
    category_id: 'cat-123',
    category: createMockCategory(),
    amount: 1000,
    transaction_type: 'expense',
    sharing_type: 'personal',
    payment_method: 'cash',
    description: 'ランチ代',
    transaction_date: new Date().toISOString().split('T')[0],
    love_rating: undefined,
    tags: [],
    location: undefined,
    receipt_image_url: undefined,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
};

/**
 * Create a love transaction
 */
export const createMockLoveTransaction = (overrides?: Partial<Transaction>): Transaction => {
  return createMockTransaction({
    category_id: 'cat-love-123',
    category: createMockLoveCategory(),
    sharing_type: 'shared',
    description: '映画デート',
    love_rating: 5,
    tags: ['デート', '映画'],
    ...overrides,
  });
};

/**
 * Create a shared transaction
 */
export const createMockSharedTransaction = (overrides?: Partial<Transaction>): Transaction => {
  return createMockTransaction({
    sharing_type: 'shared',
    shared_info: {
      split_type: 'equal',
      user1_amount: 500,
      user2_amount: 500,
      payer_user_id: '123',
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
    category_id: 'cat-123',
    amount: 1000,
    transaction_type: 'expense',
    sharing_type: 'personal',
    payment_method: 'cash',
    description: 'テスト取引',
    transaction_date: new Date().toISOString().split('T')[0],
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
      transaction_date: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
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