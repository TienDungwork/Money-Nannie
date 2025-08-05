import { Transaction, Category } from '@/types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense-tracker-transactions',
  CATEGORIES: 'expense-tracker-categories',
} as const;

export const defaultCategories: Category[] = [
  // Income categories
  { id: '1', name: 'Lương', type: 'income', color: '#22c55e', icon: '💰' },
  { id: '2', name: 'Freelance', type: 'income', color: '#3b82f6', icon: '💻' },
  { id: '3', name: 'Đầu tư', type: 'income', color: '#8b5cf6', icon: '📈' },
  { id: '4', name: 'Khác', type: 'income', color: '#6b7280', icon: '💡' },
  
  // Expense categories  
  { id: '5', name: 'Ăn uống', type: 'expense', color: '#ef4444', icon: '🍽️' },
  { id: '6', name: 'Di chuyển', type: 'expense', color: '#f59e0b', icon: '🚗' },
  { id: '7', name: 'Mua sắm', type: 'expense', color: '#ec4899', icon: '🛍️' },
  { id: '8', name: 'Giải trí', type: 'expense', color: '#8b5cf6', icon: '🎬' },
  { id: '9', name: 'Học tập', type: 'expense', color: '#3b82f6', icon: '📚' },
  { id: '10', name: 'Y tế', type: 'expense', color: '#dc2626', icon: '🏥' },
  { id: '11', name: 'Sinh hoạt', type: 'expense', color: '#059669', icon: '🏠' },
  { id: '12', name: 'Khác', type: 'expense', color: '#6b7280', icon: '📦' },
];

class LocalStorageService {
  // Transactions
  getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  saveTransactions(transactions: Transaction[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.unshift(transaction); // Add to beginning for recent-first order
    this.saveTransactions(transactions);
  }

  updateTransaction(id: string, updatedTransaction: Partial<Transaction>): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updatedTransaction };
      this.saveTransactions(transactions);
    }
  }

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    this.saveTransactions(filtered);
  }

  // Categories
  getCategories(): Category[] {
    if (typeof window === 'undefined') return defaultCategories;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : defaultCategories;
    } catch (error) {
      console.error('Error loading categories:', error);
      return defaultCategories;
    }
  }

  saveCategories(categories: Category[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  // Initialize default data
  initializeDefaultData(): void {
    if (typeof window === 'undefined') return;
    
    // Initialize categories if not exists
    const existingCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!existingCategories) {
      this.saveCategories(defaultCategories);
    }

    // Initialize transactions if not exists
    const existingTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!existingTransactions) {
      this.saveTransactions([]);
    }
  }
}

export const storageService = new LocalStorageService();
