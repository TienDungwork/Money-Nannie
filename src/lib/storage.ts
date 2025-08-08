import { Transaction, Category, Wallet } from '@/types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense-tracker-transactions',
  CATEGORIES: 'expense-tracker-categories',
  WALLETS: 'expense-tracker-wallets',
} as const;

export const defaultCategories: Category[] = [
  // Khoản chi - Hóa đơn và tiện ích
  { id: 'expense-bills', name: 'Hóa đơn & Tiện ích', type: 'expense', color: '#ef4444', icon: '🧾', isParent: true },
  { id: 'expense-bills-rent', name: 'Thuê nhà', type: 'expense', color: '#ef4444', icon: '🏠', parentId: 'expense-bills' },
  { id: 'expense-bills-electric', name: 'Hóa đơn điện', type: 'expense', color: '#ef4444', icon: '⚡', parentId: 'expense-bills' },
  { id: 'expense-bills-water', name: 'Hóa đơn nước', type: 'expense', color: '#ef4444', icon: '💧', parentId: 'expense-bills' },
  { id: 'expense-bills-internet', name: 'Internet', type: 'expense', color: '#ef4444', icon: '📶', parentId: 'expense-bills' },
  { id: 'expense-bills-phone', name: 'Hóa đơn điện thoại', type: 'expense', color: '#ef4444', icon: '📱', parentId: 'expense-bills' },
  { id: 'expense-bills-gas', name: 'Hóa đơn gas', type: 'expense', color: '#ef4444', icon: '🔥', parentId: 'expense-bills' },
  { id: 'expense-bills-tv', name: 'Hóa đơn TV', type: 'expense', color: '#ef4444', icon: '📺', parentId: 'expense-bills' },

  // Khoản chi - Mua sắm
  { id: 'expense-shopping', name: 'Mua sắm', type: 'expense', color: '#f97316', icon: '🛍️', isParent: true },
  { id: 'expense-shopping-personal', name: 'Đồ dùng cá nhân', type: 'expense', color: '#f97316', icon: '👤', parentId: 'expense-shopping' },
  { id: 'expense-shopping-household', name: 'Đồ gia dụng', type: 'expense', color: '#f97316', icon: '🏠', parentId: 'expense-shopping' },
  { id: 'expense-shopping-beauty', name: 'Làm đẹp', type: 'expense', color: '#f97316', icon: '✨', parentId: 'expense-shopping' },
  { id: 'expense-shopping-clothes', name: 'Quần áo', type: 'expense', color: '#f97316', icon: '👕', parentId: 'expense-shopping' },
  { id: 'expense-shopping-electronics', name: 'Đồ điện tử', type: 'expense', color: '#f97316', icon: '💻', parentId: 'expense-shopping' },

  // Khoản chi - Di chuyển
  { id: 'expense-transport', name: 'Di chuyển', type: 'expense', color: '#3b82f6', icon: '🚗', isParent: true },
  { id: 'expense-transport-fuel', name: 'Xăng xe', type: 'expense', color: '#3b82f6', icon: '⛽', parentId: 'expense-transport' },
  { id: 'expense-transport-maintenance', name: 'Bảo dưỡng xe', type: 'expense', color: '#3b82f6', icon: '🔧', parentId: 'expense-transport' },
  { id: 'expense-transport-parking', name: 'Phí đậu xe', type: 'expense', color: '#3b82f6', icon: '🅿️', parentId: 'expense-transport' },
  { id: 'expense-transport-taxi', name: 'Taxi/Grab', type: 'expense', color: '#3b82f6', icon: '🚕', parentId: 'expense-transport' },
  { id: 'expense-transport-bus', name: 'Xe buýt', type: 'expense', color: '#3b82f6', icon: '🚌', parentId: 'expense-transport' },

  // Khoản chi - Ăn uống
  { id: 'expense-food', name: 'Ăn uống', type: 'expense', color: '#10b981', icon: '🍽️', isParent: true },
  { id: 'expense-food-restaurant', name: 'Nhà hàng', type: 'expense', color: '#10b981', icon: '👨‍🍳', parentId: 'expense-food' },
  { id: 'expense-food-fastfood', name: 'Thức ăn nhanh', type: 'expense', color: '#10b981', icon: '🍕', parentId: 'expense-food' },
  { id: 'expense-food-coffee', name: 'Cà phê & Đồ uống', type: 'expense', color: '#10b981', icon: '☕', parentId: 'expense-food' },
  { id: 'expense-food-grocery', name: 'Mua sắm thực phẩm', type: 'expense', color: '#10b981', icon: '🛒', parentId: 'expense-food' },
  { id: 'expense-food-snack', name: 'Đồ ăn vặt', type: 'expense', color: '#10b981', icon: '🍎', parentId: 'expense-food' },

  // Khoản chi - Giải trí
  { id: 'expense-entertainment', name: 'Giải trí', type: 'expense', color: '#8b5cf6', icon: '🎮', isParent: true },
  { id: 'expense-entertainment-movie', name: 'Phim ảnh', type: 'expense', color: '#8b5cf6', icon: '🎬', parentId: 'expense-entertainment' },
  { id: 'expense-entertainment-game', name: 'Game', type: 'expense', color: '#8b5cf6', icon: '🎮', parentId: 'expense-entertainment' },
  { id: 'expense-entertainment-sport', name: 'Thể thao', type: 'expense', color: '#8b5cf6', icon: '⚽', parentId: 'expense-entertainment' },
  { id: 'expense-entertainment-travel', name: 'Du lịch', type: 'expense', color: '#8b5cf6', icon: '🧳', parentId: 'expense-entertainment' },

  // Khoản chi - Sức khỏe
  { id: 'expense-health', name: 'Sức khỏe', type: 'expense', color: '#ec4899', icon: '🏥', isParent: true },
  { id: 'expense-health-doctor', name: 'Khám bác sĩ', type: 'expense', color: '#ec4899', icon: '👨‍⚕️', parentId: 'expense-health' },
  { id: 'expense-health-medicine', name: 'Thuốc men', type: 'expense', color: '#ec4899', icon: '💊', parentId: 'expense-health' },
  { id: 'expense-health-dental', name: 'Nha khoa', type: 'expense', color: '#ec4899', icon: '🦷', parentId: 'expense-health' },
  { id: 'expense-health-gym', name: 'Gym/Fitness', type: 'expense', color: '#ec4899', icon: '🏋️', parentId: 'expense-health' },

  // Khoản chi - Giáo dục
  { id: 'expense-education', name: 'Giáo dục', type: 'expense', color: '#f59e0b', icon: '🏫', isParent: true },
  { id: 'expense-education-tuition', name: 'Học phí', type: 'expense', color: '#f59e0b', icon: '🎓', parentId: 'expense-education' },
  { id: 'expense-education-books', name: 'Sách vở', type: 'expense', color: '#f59e0b', icon: '📖', parentId: 'expense-education' },
  { id: 'expense-education-course', name: 'Khóa học', type: 'expense', color: '#f59e0b', icon: '🎖️', parentId: 'expense-education' },

  // Khoản thu
  { id: 'income-salary', name: 'Lương', type: 'income', color: '#22c55e', icon: '💵', isParent: true },
  { id: 'income-business', name: 'Kinh doanh', type: 'income', color: '#22c55e', icon: '📈', isParent: true },
  { id: 'income-investment', name: 'Đầu tư', type: 'income', color: '#22c55e', icon: '🐷', isParent: true },
  { id: 'income-bonus', name: 'Thưởng', type: 'income', color: '#22c55e', icon: '🎁', isParent: true },
  { id: 'income-freelance', name: 'Freelance', type: 'income', color: '#22c55e', icon: '💼', isParent: true },
  { id: 'income-rental', name: 'Cho thuê', type: 'income', color: '#22c55e', icon: '🏠', isParent: true },

  // Vay/Nợ
  { id: 'loan-lend', name: 'Cho vay', type: 'loan', color: '#8b5cf6', icon: '🤲', isParent: true },
  { id: 'loan-repay', name: 'Trả nợ', type: 'loan', color: '#8b5cf6', icon: '💳', isParent: true },
  { id: 'loan-collect', name: 'Thu nợ', type: 'loan', color: '#8b5cf6', icon: '👛', isParent: true },
  { id: 'loan-borrow', name: 'Đi vay', type: 'loan', color: '#8b5cf6', icon: '🤝', isParent: true },
];

export const defaultWallets: Wallet[] = [
  {
    id: 'wallet-1',
    name: 'Tiền mặt',
    type: 'cash',
    balance: 0,
    icon: '💼',
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
    
    // Initialize categories if not exists
    const existingCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!existingCategories) {
      this.saveCategories(defaultCategories);
    }
    
    // Initialize wallets if not exists
    const existingWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
    if (!existingWallets) {
      this.saveWallets(defaultWallets);
    }
  }
}

export const storageService = new LocalStorageService();
