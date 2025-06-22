import { Category } from './category';
import { User } from './user';
import { PaginationInfo } from './common';

export interface Transaction {
  id: string;
  user_id: string;
  userId?: string;
  category_id: string;
  categoryId?: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  transactionType?: 'income' | 'expense';
  sharing_type: 'personal' | 'shared';
  sharingType?: 'personal' | 'shared';
  payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | 'digital_wallet';
  paymentMethod?: 'cash' | 'credit_card' | 'bank_transfer' | 'digital_wallet';
  description?: string;
  transaction_date: string;
  transactionDate?: string;
  receipt_image_url?: string;
  receiptImageUrl?: string;
  love_rating?: number;
  loveRating?: number;
  tags?: string[];
  location?: string;
  category: Category;
  shared_info?: {
    split_type: 'equal' | 'amount' | 'percentage';
    splitType?: 'equal' | 'amount' | 'percentage';
    user1_amount?: number;
    user1Amount?: number;
    user2_amount?: number;
    user2Amount?: number;
    payer_user_id?: string;
    payerUserId?: string;
    notes?: string;
  };
  sharedInfo?: {
    splitType: 'equal' | 'amount' | 'percentage';
    user1Amount?: number;
    user2Amount?: number;
    payerUserId?: string;
    notes?: string;
  };
  shared_transaction?: SharedTransaction;
  sharedTransaction?: SharedTransaction;
  payer?: User;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

export interface SharedTransaction {
  id: string;
  transaction_id: string;
  partnership_id: string;
  payer_user_id: string;
  split_type: 'equal' | 'amount' | 'percentage';
  user1_amount?: number;
  user2_amount?: number;
  notes?: string;
  created_at: string;
}

export interface TransactionFormData {
  amount: number;
  transaction_type: 'income' | 'expense';
  sharing_type: 'personal' | 'shared';
  payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | 'digital_wallet';
  description?: string;
  transaction_date: string;
  category_id: string;
  tags?: string[];
  location?: string;
  shared_info?: {
    split_type: 'equal' | 'amount' | 'percentage';
    user1_amount?: number;
    user2_amount?: number;
    notes?: string;
  };
  receipt_image?: string; // Base64 encoded
}

export interface TransactionFilter {
  category_id?: string;
  transaction_type?: 'income' | 'expense';
  sharing_type?: 'personal' | 'shared';
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
}

export interface TransactionStats {
  year?: number;
  month?: number;
  total_income?: number;
  total_expense?: number;
  personal_expense?: number;
  shared_expense?: number;
  love_expense?: number;
  balance?: number;
  // camelCase versions
  totalIncome?: number;
  totalExpense?: number;
  personalExpense?: number;
  sharedExpense?: number;
  loveExpense?: number;
}

export interface TransactionCreate {
  category_id: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  sharing_type: 'personal' | 'shared';
  payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | 'digital_wallet';
  description?: string;
  transaction_date: string;
  love_rating?: number;
  tags?: string[];
  location?: string;
  shared_info?: {
    split_type: 'equal' | 'amount' | 'percentage';
    user1_amount?: number;
    user2_amount?: number;
    notes?: string;
  };
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}