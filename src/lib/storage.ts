import { Transaction, Category, Wallet } from '@/types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense-tracker-transactions',
  CATEGORIES: 'expense-tracker-categories',
  WALLETS: 'expense-tracker-wallets',
} as const;

// Categories đã được chuyển sang sử dụng sampleCategories từ defaultCategories.ts
export const defaultCategories: Category[] = [];

export const defaultWallets: Wallet[] = [
  {
    id: 'wallet-1',
    name: 'Tiền mặt',
    type: 'cash',
    balance: 0,
    icon: '💳',
    color: '#10b981',
    isDefault: true,
    createdAt: new Date().toISOString()
  }
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

  updateTransaction(id: string, updatedData: Partial<Transaction>): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updatedData };
      this.saveTransactions(transactions);
    }
  }

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    this.saveTransactions(filteredTransactions);
  }

  // Categories
  getCategories(): Category[] {
    if (typeof window === 'undefined') return defaultCategories;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const stored = data ? JSON.parse(data) : null;
      return stored && stored.length > 0 ? stored : defaultCategories;
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

  addCategory(category: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: `${category.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  updateCategory(id: string, updatedData: Partial<Category>): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updatedData };
      this.saveCategories(categories);
    }
  }

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    // Delete the category and any child categories
    const filteredCategories = categories.filter(c => c.id !== id && c.parentId !== id);
    this.saveCategories(filteredCategories);
  }

  // Reset categories to default (useful when updating default categories)
  resetCategories(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      this.saveCategories(defaultCategories);
    } catch (error) {
      console.error('Error resetting categories:', error);
    }
  }

  // Wallets
  getWallets(): Wallet[] {
    if (typeof window === 'undefined') return defaultWallets;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
      const stored = data ? JSON.parse(data) : null;
      return stored && stored.length > 0 ? stored : defaultWallets;
    } catch (error) {
      console.error('Error loading wallets:', error);
      return defaultWallets;
    }
  }

  saveWallets(wallets: Wallet[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
    } catch (error) {
      console.error('Error saving wallets:', error);
    }
  }

  addWallet(wallet: Omit<Wallet, 'id' | 'createdAt'>): Wallet {
    const wallets = this.getWallets();
    const newWallet: Wallet = {
      ...wallet,
      id: `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    wallets.push(newWallet);
    this.saveWallets(wallets);
    return newWallet;
  }

  updateWallet(id: string, updatedData: Partial<Wallet>): void {
    const wallets = this.getWallets();
    const index = wallets.findIndex(w => w.id === id);
    if (index !== -1) {
      wallets[index] = { ...wallets[index], ...updatedData };
      this.saveWallets(wallets);
    }
  }

  deleteWallet(id: string): void {
    const wallets = this.getWallets();
    const filteredWallets = wallets.filter(w => w.id !== id);
    this.saveWallets(filteredWallets);
  }

  // Initialize default data
  initializeDefaultData(): void {
    if (typeof window === 'undefined') return;
    
    // Force reset categories to new version (remove this after everyone has updated)
    this.resetCategories();
    
    // Initialize wallets if not exists
    const existingWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
    if (!existingWallets) {
      this.saveWallets(defaultWallets);
    }
  }
}

export const storageService = new LocalStorageService();
