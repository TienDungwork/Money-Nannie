export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'warning' | 'exceeded';
  message: string;
  createdAt: string;
}
