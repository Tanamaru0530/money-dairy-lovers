export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  is_default: boolean;
  is_love_category: boolean;
  user_id?: string;
  sort_order?: number;
  created_at: string;
}

export interface CategoryWithStats extends Category {
  transaction_count: number;
  total_amount: number;
}

export interface CategoryCreate {
  name: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

export interface CategoryUpdate {
  name?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}