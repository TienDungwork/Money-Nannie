'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, Category, Wallet } from '@/types';
import { Budget } from '@/types/budget';
import { calculateTotalByType } from '@/lib/utils';
import { formatCurrency } from '@/lib/helpers';
import { defaultCategories } from '@/lib/storage';
import { Plus, Target, TrendingDown, Edit, Trash2, AlertTriangle, ChevronRight, ArrowLeft, X, Calendar, Delete } from 'lucide-react';

// Custom Number Keyboard Component
const NumberKeyboard: React.FC<{
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}> = ({ onNumberPress, onBackspace, onClear }) => {
  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['C', '0', '⌫'],
  ];

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      onClear();
    } else if (key === '⌫') {
      onBackspace();
    } else {
      onNumberPress(key);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-t-2xl border-t border-gray-200">
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {keys.flat().map((key, index) => (
          <button
            key={index}
            onClick={() => handleKeyPress(key)}
            className={`h-12 rounded-xl font-semibold text-lg transition-all duration-150 ${
              key === 'C' 
                ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700' 
                : key === '⌫'
                ? 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700'
                : 'bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-200 shadow-sm'
            }`}
          >
            {key === '⌫' ? <Delete size={18} className="mx-auto" /> : key}
          </button>
        ))}
      </div>
    </div>
  );
};

interface BudgetPageProps {
  transactions: Transaction[];
  categories?: Category[];
  wallets?: Wallet[];
}

export function BudgetPage({ transactions, categories = [], wallets = [] }: BudgetPageProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Combine default and user categories, filter expense only
  const allCategories = [...defaultCategories, ...categories];
  const EXPENSE_CATEGORIES = allCategories.filter(cat => cat.type === 'expense');

  // Load budgets from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Save budgets to localStorage
  const saveBudgets = (newBudgets: Budget[]) => {
    localStorage.setItem('budgets', JSON.stringify(newBudgets));
    setBudgets(newBudgets);
  };

  // Calculate current month spending for a category
  const getCurrentMonthSpending = (categoryId: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === categoryId && 
        t.date.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Create new budget
  const createBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0,
      createdAt: new Date().toISOString(),
    };
    saveBudgets([...budgets, newBudget]);
    setShowCreateForm(false);
  };

  // Delete budget
  const deleteBudget = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      saveBudgets(budgets.filter(b => b.id !== id));
    }
  };

  // Calculate total budget and spent
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const spent = getCurrentMonthSpending(budget.categoryId);
    return sum + spent;
  }, 0);
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Main Budget Overview */}
      {budgets.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          {/* Budget Circle */}
          <div className="relative w-56 h-56 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={spentPercentage > 100 ? "#ef4444" : spentPercentage > 80 ? "#f59e0b" : "#10b981"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(spentPercentage, 100) * 2.64} 264`}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Bội chi</p>
                <p className="text-3xl font-bold text-red-500">
                  {formatCurrency(Math.max(0, totalSpent - totalBudget))}
                </p>
                <div className="w-16 h-0.5 bg-red-200 mx-auto mt-2"></div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Tổng nghĩ được</p>
              <p className="text-base font-bold text-gray-900">{totalBudget.toFixed(1)}M</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Đang sử dụng</p>
              <p className="text-base font-bold text-red-500">{(totalSpent/1000000).toFixed(1)}M B</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Ngày</p>
              <p className="text-base font-bold text-gray-900">22 ngày</p>
            </div>
          </div>

          {/* Add Budget Button */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Tạo Ngân sách
          </button>
        </div>
      )}

      {/* Budget List or Empty State */}
      <div className="flex-1 p-4">
        {budgets.length === 0 && !showCreateForm ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Chưa có ngân sách nào</p>
            <p className="text-sm text-gray-400 mb-4">
              Tạo ngân sách để theo dõi chi tiêu của bạn
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Tạo ngân sách đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = getCurrentMonthSpending(budget.categoryId);
              const percentage = (spent / budget.amount) * 100;
              const category = EXPENSE_CATEGORIES.find(c => c.id === budget.categoryId);
              const isOverBudget = spent > budget.amount;

              return (
                <div key={budget.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category?.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category?.name}</h3>
                        <p className="text-sm text-gray-500">Ngân sách {budget.period === 'monthly' ? 'hàng tháng' : budget.period === 'weekly' ? 'hàng tuần' : 'hàng năm'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOverBudget && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Đã chi: {formatCurrency(spent)}
                      </span>
                      <span className="text-gray-600">
                        Ngân sách: {formatCurrency(budget.amount)}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverBudget
                            ? 'bg-red-500'
                            : percentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {percentage.toFixed(1)}% đã sử dụng
                      </span>
                      <span className={`text-sm font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        Còn lại: {formatCurrency(Math.max(0, budget.amount - spent))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Budget Form */}
      {showCreateForm && (
        <BudgetCreateForm
          categories={EXPENSE_CATEGORIES}
          wallets={wallets}
          onSubmit={createBudget}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

interface BudgetCreateFormProps {
  categories: Category[];
  wallets: Wallet[];
  onSubmit: (budget: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => void;
  onCancel: () => void;
}

function BudgetCreateForm({ categories, wallets, onSubmit, onCancel }: BudgetCreateFormProps) {
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    categoryName: '',
    amount: '',
    period: 'monthly' as Budget['period'],
    walletId: '',
    walletName: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
    dateType: 'thisMonth' as 'thisMonth' | 'custom',
  });

  // Number keyboard handlers
  const handleNumberPress = (num: string) => {
    setFormData(prev => ({
      ...prev,
      amount: prev.amount + num
    }));
  };

  const handleBackspace = () => {
    setFormData(prev => ({
      ...prev,
      amount: prev.amount.slice(0, -1)
    }));
  };

  const handleClear = () => {
    setFormData(prev => ({
      ...prev,
      amount: ''
    }));
  };

  const getDateDisplayText = () => {
    if (formData.dateType === 'thisMonth') {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      return `Tháng này (01/${currentMonth.toString().padStart(2, '0')} - ${daysInMonth}/${currentMonth.toString().padStart(2, '0')})`;
    } else {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      return `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')} - ${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth() + 1).toString().padStart(2, '0')}`;
    }
  };

  const handleSubmit = () => {
    if (!formData.amount || !formData.categoryId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    onSubmit({
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      amount: parseFloat(formData.amount),
      period: formData.period,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mx-auto">
                Thêm ngân sách
              </h2>
              <div className="w-10" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-4">
            {/* Chọn nhóm */}
            <div className="space-y-2">
              <button
                onClick={() => setShowCategorySelector(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📂</span>
                  <span className="text-gray-700 font-medium">Chọn nhóm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm">
                    {formData.categoryName || 'Chọn nhóm'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            </div>

            {/* Số tiền */}
            <div className="space-y-2">
              <div 
                onClick={() => setShowKeyboard(true)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💰</span>
                  <span className="text-gray-700 font-medium">Số tiền</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 text-right text-lg font-medium">
                    {formData.amount ? formatCurrency(parseFloat(formData.amount) || 0) : '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thời gian */}
            <div className="space-y-2">
              <button
                onClick={() => setShowDateSelector(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">{getDateDisplayText()}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Tổng cộng (Chọn ví) */}
            <div className="space-y-2">
              <button
                onClick={() => setShowWalletSelector(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🏦</span>
                  <span className="text-gray-700 font-medium">Tổng cộng</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm">
                    {formData.walletName || 'Chọn ví'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.amount || !formData.categoryId}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Tạo ngân sách
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowCategorySelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">Chọn nhóm</h2>
                <div className="w-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        categoryId: category.id,
                        categoryName: category.name
                      }));
                      setShowCategorySelector(false);
                    }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Selector Modal */}
      {showWalletSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowWalletSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">Chọn ví</h2>
                <div className="w-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        walletId: wallet.id,
                        walletName: wallet.name
                      }));
                      setShowWalletSelector(false);
                    }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: wallet.color + '20' }}
                      >
                        💳
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{wallet.name}</span>
                        <p className="text-sm text-gray-500">{formatCurrency(wallet.balance)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector Modal */}
      {showDateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowDateSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">
                  Chọn thời gian
                </h2>
                <div className="w-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {/* This Month Option */}
                <div className="space-y-3">
                  <div
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        dateType: 'thisMonth',
                        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
                        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10)
                      }));
                      setShowDateSelector(false);
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.dateType === 'thisMonth' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Tháng này</p>
                        <p className="text-sm text-gray-500">
                          {new Date().getDate()}/{(new Date().getMonth() + 1).toString().padStart(2, '0')} - {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}/{(new Date().getMonth() + 1).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Date Range with date inputs visible */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <p className="font-medium text-gray-900">Tùy chỉnh thời gian</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Từ ngày
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              dateType: 'custom',
                              startDate: e.target.value
                            }));
                          }}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đến ngày
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              dateType: 'custom',
                              endDate: e.target.value
                            }));
                          }}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      
                      <button
                        onClick={() => setShowDateSelector(false)}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number Keyboard Modal */}
      {showKeyboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowKeyboard(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">
                  Nhập số tiền
                </h2>
                <div className="w-10" />
              </div>
            </div>
            
            {/* Amount Display */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Số tiền ngân sách</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formData.amount ? formatCurrency(parseFloat(formData.amount) || 0) : '0 ₫'}
                </p>
              </div>
            </div>

            {/* Number Keyboard */}
            <NumberKeyboard
              onNumberPress={handleNumberPress}
              onBackspace={handleBackspace}
              onClear={handleClear}
            />
            
            {/* Confirm Button */}
            <div className="p-4">
              <button
                onClick={() => setShowKeyboard(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
