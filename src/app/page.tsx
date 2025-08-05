'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { useTransactions, useCategories } from '@/hooks/useStorage';
import { EnhancedBalanceCard } from '@/components/EnhancedBalanceCard';
import { TransactionItem } from '@/components/TransactionItem';
import { TransactionModal } from '@/components/TransactionModal';
import { StatsPage } from '@/components/StatsPage';
import { BudgetPage } from '@/components/BudgetPage';
import { ExpenseChart } from '@/components/ExpenseChart';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { groupTransactionsByDate } from '@/lib/utils';
import { Home, BarChart3, History, Target } from 'lucide-react';

type TabType = 'home' | 'transactions' | 'stats' | 'budget';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
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
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            {activeTab === 'home' && 'Tổng quan'}
            {activeTab === 'transactions' && 'Giao dịch'}
            {activeTab === 'stats' && 'Thống kê'}
            {activeTab === 'budget' && 'Ngân sách'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            <EnhancedBalanceCard transactions={transactions} />
            
            {/* Expense Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ chi tiêu 7 ngày</h3>
              <ExpenseChart transactions={transactions} />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Giao dịch gần đây</h2>
              {recentTransactions.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-500">Chưa có giao dịch nào</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Nhấn nút + để thêm giao dịch đầu tiên
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteTransaction}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="p-4 space-y-4">
            {transactions.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">Chưa có giao dịch nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Nhấn nút + để thêm giao dịch đầu tiên
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && <StatsPage transactions={transactions} />}
        
        {activeTab === 'budget' && <BudgetPage transactions={transactions} />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex">
          <TabButton
            tab="home"
            icon={<Home size={20} />}
            label="Trang chủ"
          />
          <TabButton
            tab="transactions"
            icon={<History size={20} />}
            label="Giao dịch"
          />
          <TabButton
            tab="stats"
            icon={<BarChart3 size={20} />}
            label="Thống kê"
          />
          <TabButton
            tab="budget"
            icon={<Target size={20} />}
            label="Ngân sách"
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
