'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { useTransactions, useCategories } from '@/hooks/useStorage';
import { TransactionItem } from '@/components/TransactionItem';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionsPage } from '@/components/TransactionsPage';
import { StatsPage } from '@/components/StatsPage';
import { BudgetPage } from '@/components/BudgetPage';
import { ExpenseChart } from '@/components/ExpenseChart';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { groupTransactionsByDate, formatCurrency, calculateBalance, calculateTotalByType, formatDate } from '@/lib/utils';
import { Home, BarChart3, History, Target } from 'lucide-react';

type TabType = 'home' | 'transactions' | 'stats' | 'budget';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();

  const handleSaveTransaction = (transaction: Transaction) => {
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
    
    // Debug: In ra các giao dịch để kiểm tra
    console.log('Filtered transactions:', filteredTransactions);
    
    // Tính tổng chi tiêu theo từng danh mục
    const categoryTotals: { [key: string]: number } = {};
    
    filteredTransactions.forEach(t => {
      console.log('Transaction category:', t.category); // Debug category
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    console.log('Category totals:', categoryTotals); // Debug totals
    
    // Tìm danh mục có tổng chi tiêu cao nhất
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    console.log('Top category:', topCategory); // Debug result
    
    return topCategory ? {
      category: topCategory[0],
      amount: topCategory[1]
    } : null;
  };

  const topWeekExpense = getTopExpenseCategory(7);
  const topMonthExpense = getTopExpenseCategory(30);

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
      {activeTab !== 'home' && (
        <div className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'transactions' && 'Số giao dịch'}
              {activeTab === 'stats' && 'Thống kê'}
              {activeTab === 'budget' && 'Ngân sách'}
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
                    {formatCurrency(calculateBalance(transactions))}
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
                <span className="text-green-600 text-sm">Xem tất cả</span>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">💳</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Tiền mặt</h4>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(calculateBalance(transactions))}
                  </span>
                </div>
              </div>
            </div>

            {/* Báo cáo tháng này */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Báo cáo tháng này</h3>
                <span className="text-green-600 text-sm">Xem báo cáo</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    className="text-center p-3 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => setChartType('expense')}
                  >
                    <p className="text-sm text-gray-500 mb-1">Tổng đã chi</p>
                    <p className={`text-xl font-bold ${chartType === 'expense' ? 'text-red-700' : 'text-red-600'}`}>
                      {formatCurrency(calculateTotalByType(transactions.filter(t => {
                        const currentMonth = new Date().toISOString().slice(0, 7);
                        return t.date.startsWith(currentMonth);
                      }), 'expense'))}
                    </p>
                  </button>
                  <button 
                    className="text-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    onClick={() => setChartType('income')}
                  >
                    <p className="text-sm text-gray-500 mb-1">Tổng thu</p>
                    <p className={`text-xl font-bold ${chartType === 'income' ? 'text-blue-700' : 'text-blue-600'}`}>
                      {formatCurrency(calculateTotalByType(transactions.filter(t => {
                        const currentMonth = new Date().toISOString().slice(0, 7);
                        return t.date.startsWith(currentMonth);
                      }), 'income'))}
                    </p>
                  </button>
                </div>
                
                {/* Chart */}
                <div className="mt-4">
                  <ExpenseChart transactions={transactions} chartType={chartType} />
                </div>
                
                {/* Chart Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${chartType === 'expense' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <span className="text-gray-600">{chartType === 'expense' ? 'Chi tiêu' : 'Thu nhập'} tháng này</span>
                  </div>
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
                        {formatCurrency(topWeekExpense.amount)}
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
                        {formatCurrency(topMonthExpense.amount)}
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
                    {recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm">
                              {getCategoryIcon(transaction.category)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.date)}
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
                    ))}
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
        
        {activeTab === 'budget' && <StatsPage transactions={transactions} />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex">
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
            tab="budget"
            icon={<Target size={20} />}
            label="Thống kê"
          />
        </div>
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
        transaction={editingTransaction}
      />
    </div>
  );
}
