'use client';

import { useState, useEffect } from 'react';
import { Transaction, Wallet, Category } from '@/types';
import { useTransactions, useCategories, useWallets } from '@/hooks/useStorage';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionsPage } from '@/components/TransactionsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { BudgetPage } from '@/components/BudgetPage';
import { WalletsPage } from '@/components/WalletsPage';
import { ExpenseChart } from '@/components/ExpenseChart';
import { TopExpensesWidget } from '@/components/TopExpensesWidget';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { groupTransactionsByDate, formatCurrency, calculateBalance, calculateTotalByType, formatDate, formatDetailedDate } from '@/lib/utils';
import { getWalletIcon } from '@/lib/helpers';
import { Home, BarChart3, History, Settings } from 'lucide-react';

type TabType = 'home' | 'transactions' | 'stats' | 'settings';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  const [timePeriod, setTimePeriod] = useState<'current' | 'threeMonthsAgo'>('current');

  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { wallets, addWallet, updateWallet, deleteWallet } = useWallets();  const handleSaveTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      updateTransaction(transaction.id, transaction);
      setEditingTransaction(null);
    } else {
      addTransaction(transaction);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      deleteTransaction(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleCreateWallet = (wallet: Omit<Wallet, 'id' | 'createdAt'>) => {
    addWallet(wallet);
  };

  const handleUpdateWallet = (id: string, updatedWallet: Partial<Wallet>) => {
    updateWallet(id, updatedWallet);
  };

  const handleDeleteWallet = (id: string) => {
    deleteWallet(id);
  };

  const handleSelectWallet = (wallet: Wallet) => {
    // TODO: Implement wallet selection logic
    console.log('Selected wallet:', wallet);
  };

  const totalWalletBalance = wallets.reduce((total, wallet) => total + wallet.balance, 0);
  const transactionBalance = calculateBalance(transactions);
  const defaultWallet = wallets.find(w => w.isDefault) || wallets[0];

  const recentTransactions = transactions.slice(0, 10);
  const groupedTransactions = groupTransactionsByDate(transactions);

  // Function để sync số dư ví với transactions
  const syncWalletBalances = () => {
    console.log('🔄 Manual sync wallet balances...');
    const walletBalances: { [key: string]: number } = {};
    
    // Tính số dự từ transactions
    transactions.forEach(transaction => {
      if (transaction.walletId.trim() !== '') {
        if (!walletBalances[transaction.walletId]) {
          walletBalances[transaction.walletId] = 0;
        }
        const change = transaction.type === 'income' 
          ? transaction.amount 
          : -transaction.amount;
        walletBalances[transaction.walletId] += change;
      }
    });

    console.log('💰 Calculated balances:', walletBalances);
    console.log('🏦 Current wallet balances:', wallets.map(w => ({ name: w.name, balance: w.balance })));

    // Cập nhật wallets
    wallets.forEach(wallet => {
      const calculatedBalance = walletBalances[wallet.id] || 0;
      if (Math.abs(wallet.balance - calculatedBalance) > 0.01) {
        updateWallet(wallet.id, { balance: calculatedBalance });
      }
    });
  };

  // Function để tính tổng theo time period
  const calculateTotalByTimePeriod = (type: 'expense' | 'income') => {
    if (timePeriod === 'current') {
      // Tháng hiện tại
      const currentMonth = new Date().toISOString().slice(0, 7);
      return calculateTotalByType(transactions.filter(t => 
        t.date.startsWith(currentMonth) && t.type === type
      ), type);
    } else {
      // 3 tháng trước (tháng 5, 6, 7)
      const today = new Date();
      let total = 0;
      
      for (let i = 1; i <= 3; i++) {
        const targetMonth = today.getMonth() - (4 - i) + 1;
        const monthString = `${today.getFullYear()}-${String(targetMonth).padStart(2, '0')}`;
        
        const monthTransactions = transactions.filter(t => 
          t.date.startsWith(monthString) && t.type === type
        );
        total += calculateTotalByType(monthTransactions, type);
      }
      
      return total;
    }
  };

  const getCategoryIcon = (category: string) => {
    // Mapping cho key-based icons (từ IconPicker) - KIỂM TRA TRƯỚC
    const keyToIconMap: { [key: string]: string } = {
      'DollarSign': '💲',
      'Banknote': '💵', 
      'CreditCard': '💳',
      'Wallet': '👛',
      'PiggyBank': '🐷',
      'TrendingUp': '📈',
      'HandCoins': '🤲',
      'Receipt': '🧾',
      'UtensilsCrossed': '🍽️',
      'Coffee': '☕',
      'Pizza': '🍕',
      'ChefHat': '👨‍🍳',
      'Cake': '🎂',
      'Beer': '🍺',
      'Apple': '🍎',
      'Bread': '🍞',
      'Rice': '🍚',
      'Noodles': '🍜',
      'Car': '🚗',
      'Fuel': '⛽',
      'Bus': '🚌',
      'Train': '🚊',
      'Plane': '✈️',
      'Bike': '🚲',
      'Motorcycle': '🏍️',
      'Taxi': '🚕',
      'ParkingCircle': '🅿️',
      'Wrench': '🔧',
      'Home': '🏠',
      'Zap': '⚡',
      'Droplets': '💧',
      'Wifi': '📶',
      'Tv': '📺',
      'Flame': '🔥',
      'Bed': '🛏️',
      'Sofa': '🛋️',
      'Bath': '🛁',
      'Kitchen': '🍳',
      'ShoppingBag': '🛍️',
      'ShoppingCart': '🛒',
      'Gift': '🎁',
      'Shirt': '👕',
      'Shoes': '👟',
      'Watch': '⌚',
      'Bag': '🎒',
      'Glasses': '👓',
      'Sparkles': '✨',
      'Perfume': '🧴',
      'GameController': '🎮',
      'Music': '🎵',
      'Movie': '🎬',
      'Camera': '📷',
      'Book': '�',
      'Sport': '⚽',
      'Gym': '🏋️',
      'Swimming': '🏊',
      'Travel': '🧳',
      'Beach': '�️',
      'Hospital': '🏥',
      'Medicine': '💊',
      'Doctor': '👨‍⚕️',
      'Stethoscope': '🩺',
      'Syringe': '💉',
      'Dental': '🦷',
      'Glasses2': '👓',
      'Heart': '❤️',
      'School': '�',
      'BookOpen': '📚',
      'Pencil': '✏️',
      'Calculator': '🔢',
      'Computer': '💻',
      'Graduation': '🎓',
      'Certificate': '📜',
      'Office': '🏢',
      'Phone': '📱',
      'Email': '📧',
      'Calendar': '📅',
      'User': '👤',
      'Family': '👨‍👩‍👧‍👦',
      'Pet': '🐕',
      'Insurance': '🛡️',
      'Tax': '🧾',
      'Charity': '🤝',
      'Tools': '🔨',
      'Settings': '⚙️',
      'Star': '⭐',
      'Question': '❓',
      'Briefcase': '💼',
      'Building': '🏢',
      'Factory': '🏭',
      'Hammer': '🔨',
      'Scissors': '✂️',
    };

    // 1. Check key mapping TRƯỚC TIÊN
    if (keyToIconMap[category]) {
      return keyToIconMap[category];
    }
    
    // 2. Tìm category object
    const categoryObj = categories.find(c => c.id === category);
    
    // 3. Nếu có icon key trong category object, check mapping
    if (categoryObj?.icon && keyToIconMap[categoryObj.icon]) {
      return keyToIconMap[categoryObj.icon];
    }
    
    // 4. Nếu icon là emoji luôn (length <= 4)
    if (categoryObj?.icon && categoryObj.icon.length <= 4) {
      return categoryObj.icon;
    }

    // 5. Fallback cho trường hợp category cũ hoặc không có icon
    const defaultIcons: { [key: string]: string } = {
      'Ăn uống': '🍽️',
      'Di chuyển': '🚗', 
      'Mua sắm': '🛍️',
      'Giải trí': '🎬',
      'Y tế': '🏥',
      'Học tập': '📚',
      'Sinh hoạt': '🏠',
      'Hoá đơn & Tiện ích': '🧾',
      'Thuê nhà': '🏘️',
      'Hoá đơn nước': '💧',
      'Hoá đơn điện thoại': '📱',
      'Hoá đơn điện': '⚡',
      'Hoá đơn gas': '🔥',
      'Hoá đơn TV': '📺',
      'Hoá đơn internet': '🌐',
      'Hoá đơn tiện ích khác': '🔧',
      'Lương': '💰',
      'Freelance': '💻',
      'Đầu tư': '📈',
      'Khác': '📦',
      'vứt tiền': '💸',
      'Xăng xe': '⛽',
      'Đồ dùng cá nhân': '👤',
      'hihi': '😂',
      'hehehehehe': '😆',
      // Fallback cho các key tiếng Anh cũ
      'food': '🍽️',
      'transport': '🚗', 
      'shopping': '🛍️',
      'entertainment': '🎬',
      'health': '🏥',
      'education': '📚',
      'bills': '🧾',
      'investment': '📈',
      'salary': '💰',
      'freelance': '💼',
      'business': '🏢',
      'gift': '🎁',
      'other': '📦'
    };
    
    // Fallback cuối cùng từ mapping
    return defaultIcons[categoryObj?.name || category] || '📦';
  };

  const getCategoryName = (category: string) => {
    // Tìm category theo ID trước tiên
    const categoryById = categories.find(cat => cat.id === category);
    if (categoryById) {
      return categoryById.name;
    }
    
    // Tìm theo name (cho dữ liệu cũ)
    const categoryByName = categories.find(cat => cat.name === category);
    if (categoryByName) {
      return categoryByName.name;
    }

    // Fallback cho các key tiếng Anh cũ
    const names: { [key: string]: string } = {
      'food': 'Ăn uống',
      'transport': 'Di chuyển',
      'shopping': 'Mua sắm',
      'entertainment': 'Giải trí',
      'health': 'Sức khỏe',
      'education': 'Giáo dục',
      'bills': 'Hóa đơn',
      'investment': 'Đầu tư',
      'salary': 'Lương',
      'freelance': 'Freelance',
      'business': 'Kinh doanh',
      'gift': 'Quà tặng',
      'other': 'Khác'
    };
    
    // Nếu là tiếng Anh cũ thì dịch, nếu không thì trả về nguyên bản
    return names[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  const TabButton = ({ tab, icon, label }: { tab: TabType; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 ${
        activeTab === tab
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <div className={`p-2 rounded-xl transition-all duration-200 ${
        activeTab === tab 
          ? 'bg-blue-50 text-blue-600 scale-110' 
          : 'hover:bg-gray-50'
      }`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 font-medium transition-all duration-200 text-center leading-tight ${
        activeTab === tab ? 'text-blue-600' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      {(activeTab === 'stats' || activeTab === 'settings') && (
        <div className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'stats' && 'Ngân sách'}
              {activeTab === 'settings' && 'Cài đặt'}
            </h1>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            {/* Tổng số dư */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tổng số dư</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalWalletBalance)}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    👁
                  </button>
                </div>
              </div>
            </div>

            {/* Ví của Nga */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Ví của Nannie</h3>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="text-green-600 text-sm hover:text-green-700"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="p-4">
                {wallets.length > 0 ? (
                  <div className="space-y-3">
                    {wallets.slice(0, 3).map((wallet) => (
                      <div key={wallet.id} className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: wallet.color + '30' }}
                        >
                          <span className="text-lg">{getWalletIcon(wallet.icon)}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(wallet.balance)}
                        </span>
                      </div>
                    ))}
                    {wallets.length > 3 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setActiveTab('settings')}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          +{wallets.length - 3} ví khác
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">Chưa có ví nào</p>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      Tạo ví đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Báo cáo tháng này */}
            <div className="bg-gray-100/60 rounded-xl shadow-sm border border-gray-200/50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200/40">
                <h3 className="text-lg font-semibold text-gray-600">Báo cáo tháng này</h3>
                <span className="text-green-600 text-sm font-medium">Xem báo cáo</span>
              </div>
              <div className="p-4 bg-gray-50/40">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    className={`text-center p-4 rounded-xl transition-all duration-200 ${
                      chartType === 'expense' 
                        ? 'bg-red-50 border-2 border-red-200 shadow-sm' 
                        : 'bg-white/70 border border-gray-300 hover:bg-red-50/60'
                    }`}
                    onClick={() => setChartType('expense')}
                  >
                    <p className="text-sm text-gray-600 mb-2">
                      {timePeriod === 'current' ? 'Tổng đã chi' : 'Tổng chi 3 tháng trước'}
                    </p>
                    <p className={`text-xl font-bold ${chartType === 'expense' ? 'text-red-700' : 'text-red-600'}`}>
                      {formatCurrency(calculateTotalByTimePeriod('expense'))}
                    </p>
                  </button>
                  <button 
                    className={`text-center p-4 rounded-xl transition-all duration-200 ${
                      chartType === 'income' 
                        ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                        : 'bg-white/70 border border-gray-300 hover:bg-blue-50/60'
                    }`}
                    onClick={() => setChartType('income')}
                  >
                    <p className="text-sm text-gray-600 mb-2">
                      {timePeriod === 'current' ? 'Tổng thu' : 'Tổng thu 3 tháng trước'}
                    </p>
                    <p className={`text-xl font-bold ${chartType === 'income' ? 'text-blue-700' : 'text-blue-600'}`}>
                      {formatCurrency(calculateTotalByTimePeriod('income'))}
                    </p>
                  </button>
                </div>
                
                {/* Chart */}
                <div className="mt-4 bg-white/80 rounded-xl p-3 border border-gray-300/40">
                  <ExpenseChart transactions={transactions} chartType={chartType} timePeriod={timePeriod} />
                </div>
                
                {/* Chart Legend */}
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                  <button
                    onClick={() => setTimePeriod('current')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      timePeriod === 'current'
                        ? 'bg-white/80 border-gray-300/30'
                        : 'bg-white/60 border-gray-200/20 hover:bg-white/70'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      timePeriod === 'current' 
                        ? (chartType === 'expense' ? 'bg-red-500' : 'bg-blue-500')
                        : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-700 font-medium">Tháng này</span>
                  </button>
                  <button
                    onClick={() => setTimePeriod('threeMonthsAgo')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      timePeriod === 'threeMonthsAgo'
                        ? 'bg-white/80 border-gray-300/30'
                        : 'bg-white/60 border-gray-200/20 hover:bg-white/70'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      timePeriod === 'threeMonthsAgo' 
                        ? (chartType === 'expense' ? 'bg-red-500' : 'bg-blue-500')
                        : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-700 font-medium">3 tháng trước</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Báo cáo xu hướng */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">←</span>
                <span className="text-green-600 font-medium">Báo cáo xu hướng</span>
                <span className="text-gray-400">→</span>
              </div>
              <div className="flex justify-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Chi tiêu nhiều nhất */}
            <TopExpensesWidget 
              transactions={transactions}
              categories={categories}
            />

            {/* Giao dịch gần đây */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
                <button 
                  onClick={() => {
                    setActiveTab('transactions');
                    window.scrollTo(0, 0);
                  }}
                  className="text-green-600 text-sm hover:text-green-700 transition-colors"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="p-4">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có giao dịch nào</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Nhấn nút + để thêm giao dịch đầu tiên
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.slice(0, 5).map((transaction) => {
                      const categoryName = getCategoryName(transaction.category);
                      const categoryIcon = getCategoryIcon(transaction.category);
                      
                      return (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-lg">
                                {categoryIcon}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{categoryName}</h4>
                              <p className="text-xs text-gray-400">
                                {formatDetailedDate(transaction.date)}
                              </p>
                            </div>
                          </div>
                          <span className={`font-bold ${
                            transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionsPage 
            transactions={transactions}
            categories={categories}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}

        {activeTab === 'stats' && <BudgetPage transactions={transactions} categories={categories} wallets={wallets} />}
        
        {activeTab === 'settings' && (
          <SettingsPage 
            categories={categories}
            wallets={wallets}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
            addWallet={addWallet}
            updateWallet={handleUpdateWallet}
            deleteWallet={handleDeleteWallet}
          />
        )}
      </div>

      {/* Bottom Navigation with Center FAB */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 items-center py-3 px-4">
          {/* Tab 1 */}
          <div className="flex justify-center">
            <TabButton
              tab="home"
              icon={<Home size={22} />}
              label="Tổng quan"
            />
          </div>
          
          {/* Tab 2 */}
          <div className="flex justify-center">
            <TabButton
              tab="transactions"
              icon={<History size={22} />}
              label="Lịch sử"
            />
          </div>
          
          {/* Center FAB */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 relative -mt-2"
            >
              <div className="absolute inset-0 bg-white/10 rounded-full"></div>
              <svg 
                className="w-7 h-7 relative z-10" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </button>
          </div>
          
          {/* Tab 3 */}
          <div className="flex justify-center">
            <TabButton
              tab="stats"
              icon={<BarChart3 size={22} />}
              label="Thống kê"
            />
          </div>
          
          {/* Tab 4 */}
          <div className="flex justify-center">
            <TabButton
              tab="settings"
              icon={<Settings size={22} />}
              label="Cài đặt"
            />
          </div>
        </div>
        {/* Extended white background to fill bottom gap */}
        <div className="h-4 bg-white"></div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
        categories={categories}
        wallets={wallets}
        transaction={editingTransaction}
      />
    </div>
  );
}
