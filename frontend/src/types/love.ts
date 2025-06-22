export interface LoveEvent {
  id: string;
  partnership_id: string;
  event_type: 'anniversary' | 'birthday' | 'valentine' | 'christmas' | 'custom';
  name: string;
  event_date: string;
  is_recurring: boolean;
  recurrence_type?: 'yearly' | 'monthly' | 'custom';
  description?: string;
  reminder_days: number;
  is_active: boolean;
  created_at: string;
}

export interface LoveEventFormData {
  event_type: 'anniversary' | 'birthday' | 'valentine' | 'christmas' | 'custom';
  name: string;
  event_date: string;
  is_recurring: boolean;
  recurrence_type?: 'yearly' | 'monthly' | 'custom';
  description?: string;
  reminder_days: number;
}

export interface LoveStatistics {
  total_love_spending: number;
  love_transaction_count: number;
  average_love_rating: number;
  love_spending_percentage: number;
  love_spending_by_category: {
    category_id: string;
    category_name: string;
    category_icon: string;
    total_amount: number;
    transaction_count: number;
  }[];
  favorite_love_category?: {
    category_id: string;
    category_name: string;
    category_icon: string;
    total_amount: number;
    transaction_count: number;
  };
  love_trend: {
    date: string;
    amount: number;
    transaction_count: number;
  }[];
  upcoming_events?: LoveEvent[];
}

export interface LoveMemory {
  id: string;
  transaction_id: string;
  event_id?: string;
  title: string;
  description: string;
  photo_url?: string;
  photos?: string[];
  created_at: string;
}