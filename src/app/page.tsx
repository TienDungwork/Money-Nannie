'use client';

import { useState, useEffect } from 'react';
import { Transaction, Wallet, Category } from '@/types';
import { useTransactions, useCategories, useWallets } from '@/hooks/useStorage';
import { TransactionItem } from '@/components/TransactionItem';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionsPage } from '@/components/TransactionsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { BudgetPage } from '@/components/BudgetPage';
import { WalletsPage } from '@/components/WalletsPage';
import { ExpenseChart } from '@/components/ExpenseChart';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { groupTransactionsByDate, formatCurrency, calculateBalance, calculateTotalByType, formatDate, formatDetailedDate } from '@/lib/utils';
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
  const defaultWallet = wallets.find(w => w.isDefault) || wallets[0];

  const recentTransactions = transactions.slice(0, 10);
  const groupedTransactions = groupTransactionsByDate(transactions);

  // Tính danh mục chi tiêu nhiều nhất
  const getTopExpenseCategory = (days: number) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let filteredTransactions;
    
    if (days === 7) {
      // Tuần này - lấy 7 ngày gần nhất
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      filteredTransactions = transactions.filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= cutoffDate
      );
    } else {
      // Tháng này - lấy tất cả giao dịch trong tháng hiện tại
      filteredTransactions = transactions.filter(t => 
        t.type === 'expense' && 
        t.date.startsWith(currentMonth)
      );
    }
    
    // Tính tổng chi tiêu theo từng danh mục
    const categoryTotals: { [key: string]: number } = {};
    let totalExpense = 0;
    
    filteredTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      totalExpense += t.amount;
    });
    
    // Tìm danh mục có tổng chi tiêu cao nhất
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    return topCategory ? {
      category: topCategory[0],
      amount: topCategory[1],
      percentage: totalExpense > 0 ? (topCategory[1] / totalExpense) * 100 : 0
    } : null;
  };

  const topWeekExpense = getTopExpenseCategory(7);
  const topMonthExpense = getTopExpenseCategory(30);

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
    const icons: { [key: string]: string } = {
      // Danh mục tiếng Việt từ storage.ts
      'Ăn uống': '🍽️',
      'Di chuyển': '🚗', 
      'Mua sắm': '🛍️',
      'Giải trí': '🎬',
      'Y tế': '🏥',
      'Học tập': '📚',
      'Sinh hoạt': '🏠',
      'Hoá đơn & Tiện ích': '📄',
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
      // Fallback cho các key tiếng Anh cũ
      'food': '🍽️',
      'transport': '🚗', 
      'shopping': '🛍️',
      'entertainment': '🎬',
      'health': '🏥',
      'education': '📚',
      'bills': '💡',
      'investment': '📈',
      'salary': '💰',
      'freelance': '💼',
      'business': '🏢',
      'gift': '🎁',
      'other': '📦'
    };
    
    // Tìm category theo ID trước
    const categoryById = categories.find(cat => cat.id === category);
    if (categoryById) {
      return categoryById.icon;
    }
    
    // Fallback: tìm theo name (cho dữ liệu cũ) 
    const categoryByName = categories.find(cat => cat.name === category);
    if (categoryByName) {
      return categoryByName.icon;
    }
    
    return icons[category] || '📦';
  };

  const getCategoryName = (category: string) => {
    // Danh mục đã là tiếng Việt từ storage.ts, trả về luôn
    // Chỉ cần fallback cho các key tiếng Anh cũ
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
    
    // Tìm category theo ID trước
    const categoryById = categories.find(cat => cat.id === category);
    if (categoryById) {
      return categoryById.name;
    }
    
    // Fallback: nếu đã là tên tiếng Việt rồi thì trả về luôn
    const categoryByName = categories.find(cat => cat.name === category);
    if (categoryByName) {
      return categoryByName.name;
    }
    
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
      className={`flex-1 flex flex-col items-center py-2 px-1 ${
        activeTab === tab
          ? 'text-primary-600 border-t-2 border-primary-600'
          : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
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
                          <span className="text-lg">{wallet.icon}</span>
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
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Chi tiêu nhiều nhất</h3>
                <span className="text-green-600 text-sm">Xem tất cả</span>
              </div>
              <div className="p-4">
                {/* Tuần này */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Tuần này</p>
                  {topWeekExpense ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm">{getCategoryIcon(topWeekExpense.category)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{getCategoryName(topWeekExpense.category)}</span>
                      </div>
                      <span className="font-bold text-red-600">
                        {topWeekExpense.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-gray-500">Chưa có giao dịch</span>
                    </div>
                  )}
                </div>

                {/* Tháng này */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tháng này</p>
                  {topMonthExpense ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm">{getCategoryIcon(topMonthExpense.category)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{getCategoryName(topMonthExpense.category)}</span>
                      </div>
                      <span className="font-bold text-red-600">
                        {topMonthExpense.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-gray-500">Chưa có giao dịch</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Giao dịch gần đây */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
                <span className="text-green-600 text-sm">Xem tất cả</span>
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
                      // Tìm category theo ID
                      const category = categories.find(cat => cat.id === transaction.category);
                      const categoryName = category?.name || transaction.category;
                      const categoryIcon = category?.icon || '📦';
                      
                      return (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm">
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
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}

        {activeTab === 'stats' && <BudgetPage transactions={transactions} />}
        
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex py-2">
          <TabButton
            tab="home"
            icon={<Home size={20} />}
            label="Tổng quan"
          />
          <TabButton
            tab="transactions"
            icon={<History size={20} />}
            label="Số giao dịch"
          />
          <TabButton
            tab="stats"
            icon={<BarChart3 size={20} />}
            label="Ngân sách"
          />
          <TabButton
            tab="settings"
            icon={<Settings size={20} />}
            label="Cài đặt"
          />
        </div>
        {/* Extended white background to fill bottom gap */}
        <div className="h-4 bg-white"></div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setIsModalOpen(true)}
        className="mb-20"
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
        categories={categories}
        wallets={wallets}
        transaction={editingTransaction}
        onAddCategory={addCategory}
      />
    </div>
  );
}
