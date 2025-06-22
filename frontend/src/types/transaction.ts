import { Category } from './category';
import { User } from './user';

export interface Transaction {
  id: string;
  user_id: string;
  userId?: string;
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
  tags?: string[];
  location?: string;
  category: Category;
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