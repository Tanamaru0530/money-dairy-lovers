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

export interface LoveGoalBase {
  name: string;
  amount: number;
  period: 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate?: string;
  description?: string;
  categoryId?: string;
}

export interface LoveGoalCreate extends LoveGoalBase {}

export interface LoveGoalUpdate {
  name?: string;
  amount?: number;
  endDate?: string;
  description?: string;
  isActive?: boolean;
}

export interface LoveGoal extends LoveGoalBase {
  id: string;
  userId: string;
  partnershipId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoveGoalWithProgress extends LoveGoal {
  spentAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  daysRemaining?: number;
  isAchieved: boolean;
  transactionCount: number;
}

export interface LoveStats {
  totalLoveTransactions: number;
  averageLoveRating: number;
  totalLoveSpending: number;
  loveSpendingPercentage: number;
  mostLoveDay?: string;
  mostLoveCategory?: string;
  loveStreak: number;
  loveEventsCount: number;
  upcomingEventsCount: number;
}

export interface LoveEventCreate {
  eventType: 'anniversary' | 'birthday' | 'valentine' | 'christmas' | 'custom';
  name: string;
  eventDate: string;
  isRecurring: boolean;
  recurrenceType?: 'yearly' | 'monthly' | 'custom';
  description?: string;
  reminderDays: number;
}