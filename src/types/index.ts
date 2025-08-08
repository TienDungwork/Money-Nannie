export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'loan';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  walletId?: string; // ID của ví được sử dụng
  withPerson?: string; // Tên người đi cùng/giao dịch cùng
  note?: string; // Ghi chú thêm
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'loan';
  color: string;
  icon: string;
  parentId?: string; // ID của nhóm cha
  isParent?: boolean; // Có phải là nhóm cha không
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'savings';
  balance: number;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
