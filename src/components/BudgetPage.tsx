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
    <div className="bg-gray-50 p-6 rounded-b-2xl">
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        {keys.flat().map((key, index) => (
          <button
            key={index}
            onClick={() => handleKeyPress(key)}
            className={`h-16 rounded-xl font-bold text-xl transition-all duration-150 active:scale-95 ${
              key === 'C' 
                ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-lg' 
                : key === '⌫'
                ? 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 shadow-lg'
                : 'bg-white text-gray-900 hover:bg-gray-100 active:bg-gray-200 shadow-lg border border-gray-200'
            }`}
            style={{
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            {key === '⌫' ? <Delete size={20} className="mx-auto" /> : key}
          </button>
        ))}
      </div>
      
      {/* Quick Amount Buttons */}
      <div className="mt-6 flex justify-center space-x-3">
        {[100000, 500000, 1000000, 5000000].map((amount) => (
          <button
            key={amount}
            onClick={() => {
              onClear();
              onNumberPress(amount.toString());
            }}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            {amount >= 1000000 ? `${amount / 1000000}M` : `${amount / 1000}K`}
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
  const [activeBudgetId, setActiveBudgetId] = useState<string>('');

  // Combine default and user categories, filter expense only
  const allCategories = [...defaultCategories, ...categories];
  const EXPENSE_CATEGORIES = allCategories.filter(cat => cat.type === 'expense');

  // Load budgets from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      const loadedBudgets = JSON.parse(savedBudgets);
      setBudgets(loadedBudgets);
      // Set first budget as active if none selected
      if (loadedBudgets.length > 0 && !activeBudgetId) {
        setActiveBudgetId(loadedBudgets[0].id);
      }
    }
  }, [activeBudgetId]);

  // Update active budget when budgets change
  useEffect(() => {
    if (budgets.length > 0 && !activeBudgetId) {
      setActiveBudgetId(budgets[0].id);
    } else if (budgets.length > 0 && !budgets.find(b => b.id === activeBudgetId)) {
      setActiveBudgetId(budgets[0].id);
    }
  }, [budgets, activeBudgetId]);

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

  // Calculate spending for a specific budget period
  const getBudgetSpending = (budget: Budget) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    // Use custom dates if available, otherwise calculate based on period
    if (budget.startDate && budget.endDate) {
      startDate = new Date(budget.startDate);
      endDate = new Date(budget.endDate);
    } else if (budget.period === 'monthly') {
      // For monthly budget, calculate from start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (budget.period === 'weekly') {
      // For weekly budget, calculate from start of current week
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      // For yearly budget, calculate from start of current year
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const startDateStr = startDate.toISOString().slice(0, 10);
    const endDateStr = endDate.toISOString().slice(0, 10);

    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budget.categoryId && 
        t.date >= startDateStr && 
        t.date <= endDateStr
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

  // Get current active budget
  const activeBudget = budgets.find(b => b.id === activeBudgetId);

  // Calculate remaining days based on active budget
  const calculateRemainingDays = (budget?: Budget) => {
    if (!budget) return 0;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of today
    
    let endDate: Date;
    
    if (budget.endDate) {
      // Use custom end date if available
      endDate = new Date(budget.endDate);
    } else {
      // Calculate end date based on period
      if (budget.period === 'monthly') {
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (budget.period === 'weekly') {
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6);
      } else {
        endDate = new Date(now.getFullYear(), 11, 31);
      }
    }
    
    // Calculate days remaining
    const timeDiff = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    
    return daysRemaining;
  };

  // Calculate stats for active budget only
  const currentBudgetAmount = activeBudget?.amount || 0;
  const currentBudgetSpent = activeBudget ? getBudgetSpending(activeBudget) : 0;
  const spentPercentage = currentBudgetAmount > 0 ? (currentBudgetSpent / currentBudgetAmount) * 100 : 0;
  const remaining = currentBudgetAmount - currentBudgetSpent;
  const daysRemaining = calculateRemainingDays(activeBudget);

  // Calculate budget spending rate based on active budget
  const now = new Date();
  const daysPassed = activeBudget?.startDate 
    ? Math.ceil((now.getTime() - new Date(activeBudget.startDate).getTime()) / (1000 * 3600 * 24)) + 1
    : now.getDate();
  
  const totalBudgetDays = activeBudget && activeBudget.startDate && activeBudget.endDate
    ? Math.ceil((new Date(activeBudget.endDate).getTime() - new Date(activeBudget.startDate).getTime()) / (1000 * 3600 * 24)) + 1
    : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  const dailyBudgetRate = currentBudgetAmount > 0 ? currentBudgetAmount / totalBudgetDays : 0;
  const expectedSpending = dailyBudgetRate * Math.max(1, daysPassed);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Tabs for Budget Navigation */}
      {budgets.length > 0 && (
        <div className="bg-white shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3 overflow-x-auto">
              {budgets.map((budget) => {
                const category = EXPENSE_CATEGORIES.find(c => c.id === budget.categoryId);
                const isActive = budget.id === activeBudgetId;
                
                return (
                  <button
                    key={budget.id}
                    onClick={() => setActiveBudgetId(budget.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{category?.icon}</span>
                    <span className="text-sm">{category?.name}</span>
                  </button>
                );
              })}
              
              {/* Add Budget Button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="text-sm">Thêm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Budget Overview for Active Budget */}
      {activeBudget ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          {/* Header Info */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {EXPENSE_CATEGORIES.find(c => c.id === activeBudget.categoryId)?.name}
            </h2>
            <p className="text-sm text-gray-600">
              {activeBudget.startDate && activeBudget.endDate ? (
                `${new Date(activeBudget.startDate).getDate().toString().padStart(2, '0')}/${(new Date(activeBudget.startDate).getMonth() + 1).toString().padStart(2, '0')} - ${new Date(activeBudget.endDate).getDate().toString().padStart(2, '0')}/${(new Date(activeBudget.endDate).getMonth() + 1).toString().padStart(2, '0')}`
              ) : (
                `Ngân sách ${activeBudget.period === 'monthly' ? 'hàng tháng' : activeBudget.period === 'weekly' ? 'hàng tuần' : 'hàng năm'}`
              )}
            </p>
            {daysRemaining > 0 && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                Còn {daysRemaining} ngày
              </p>
            )}
          </div>

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
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {currentBudgetSpent > currentBudgetAmount ? 'Vượt ngân sách' : 'Còn lại'}
                </p>
                <p className={`text-3xl font-bold ${currentBudgetSpent > currentBudgetAmount ? 'text-red-500' : 'text-green-500'}`}>
                  {currentBudgetSpent > currentBudgetAmount 
                    ? formatCurrency(currentBudgetSpent - currentBudgetAmount)
                    : formatCurrency(Math.max(0, currentBudgetAmount - currentBudgetSpent))
                  }
                </p>
                <div className={`w-16 h-0.5 mx-auto mt-2 ${currentBudgetSpent > currentBudgetAmount ? 'bg-red-200' : 'bg-green-200'}`}></div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Ngân sách</p>
              <p className="text-base font-bold text-gray-900">
                {currentBudgetAmount >= 1000000 
                  ? `${(currentBudgetAmount / 1000000).toFixed(1)}M`
                  : currentBudgetAmount >= 1000
                  ? `${(currentBudgetAmount / 1000).toFixed(0)}K`
                  : currentBudgetAmount.toLocaleString()
                }
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Đã sử dụng</p>
              <p className={`text-base font-bold ${currentBudgetSpent > currentBudgetAmount ? 'text-red-500' : 'text-blue-500'}`}>
                {currentBudgetSpent >= 1000000 
                  ? `${(currentBudgetSpent / 1000000).toFixed(1)}M`
                  : currentBudgetSpent >= 1000
                  ? `${(currentBudgetSpent / 1000).toFixed(0)}K`
                  : currentBudgetSpent.toLocaleString()
                }
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Còn lại</p>
              <p className="text-base font-bold text-green-600">
                {daysRemaining} ngày
              </p>
            </div>
          </div>

          {/* Additional Stats Row */}
          {currentBudgetAmount > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Tốc độ chi/ngày</p>
                <p className="text-sm font-bold text-orange-600">
                  {currentBudgetSpent > 0 && daysPassed > 0 
                    ? formatCurrency(currentBudgetSpent / daysPassed)
                    : '0 ₫'
                  }
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Ngân sách/ngày</p>
                <p className="text-sm font-bold text-blue-600">
                  {formatCurrency(dailyBudgetRate)}
                </p>
              </div>
            </div>
          )}

          {/* Spending Alert */}
          {currentBudgetAmount > 0 && currentBudgetSpent > expectedSpending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Cảnh báo chi tiêu
                  </p>
                  <p className="text-xs text-yellow-700">
                    Bạn đang chi tiêu nhanh hơn dự kiến {formatCurrency(currentBudgetSpent - expectedSpending)} so với kế hoạch
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State when no budgets */
        budgets.length === 0 && !showCreateForm && (
          <div className="flex-1 p-4">
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
          </div>
        )
      )}

      {/* Budget Details for Active Budget */}
      {activeBudget && (
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{EXPENSE_CATEGORIES.find(c => c.id === activeBudget.categoryId)?.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{EXPENSE_CATEGORIES.find(c => c.id === activeBudget.categoryId)?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activeBudget.startDate && activeBudget.endDate ? (
                      `${new Date(activeBudget.startDate).getDate().toString().padStart(2, '0')}/${(new Date(activeBudget.startDate).getMonth() + 1).toString().padStart(2, '0')} - ${new Date(activeBudget.endDate).getDate().toString().padStart(2, '0')}/${(new Date(activeBudget.endDate).getMonth() + 1).toString().padStart(2, '0')}`
                    ) : (
                      activeBudget.period === 'monthly' ? 'Hàng tháng' : activeBudget.period === 'weekly' ? 'Hàng tuần' : 'Hàng năm'
                    )}
                  </p>
                  {daysRemaining > 0 && (
                    <p className="text-xs text-blue-600 font-medium">
                      Còn {daysRemaining} ngày
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {currentBudgetSpent > currentBudgetAmount && (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <button
                  onClick={() => deleteBudget(activeBudget.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Đã chi: {formatCurrency(currentBudgetSpent)}
                </span>
                <span className="text-gray-600">
                  Ngân sách: {formatCurrency(currentBudgetAmount)}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentBudgetSpent > currentBudgetAmount
                      ? 'bg-red-500'
                      : spentPercentage > 80
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  currentBudgetSpent > currentBudgetAmount ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {spentPercentage.toFixed(1)}% đã sử dụng
                </span>
                <span className={`text-sm font-medium ${
                  currentBudgetSpent > currentBudgetAmount ? 'text-red-600' : 'text-blue-600'
                }`}>
                  Còn lại: {formatCurrency(Math.max(0, currentBudgetAmount - currentBudgetSpent))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
    amount: '0',
    period: 'monthly' as Budget['period'],
    walletId: '',
    walletName: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
    dateType: 'thisMonth' as 'thisMonth' | 'custom',
  });

  // Number keyboard handlers
  const handleNumberPress = (num: string) => {
    setFormData(prev => {
      const currentAmount = prev.amount;
      // Prevent leading zeros and limit to reasonable length
      if (currentAmount === '0' && num === '0') return prev;
      if (currentAmount.length >= 12) return prev; // Limit to 12 digits max
      
      const newAmount = currentAmount === '0' ? num : currentAmount + num;
      return {
        ...prev,
        amount: newAmount
      };
    });
  };

  const handleBackspace = () => {
    setFormData(prev => {
      const newAmount = prev.amount.slice(0, -1);
      return {
        ...prev,
        amount: newAmount || '0'
      };
    });
  };

  const handleClear = () => {
    setFormData(prev => ({
      ...prev,
      amount: '0'
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
    const amount = parseFloat(formData.amount);
    
    if (!formData.amount || formData.amount === '0' || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!formData.categoryId) {
      alert('Vui lòng chọn nhóm chi tiêu');
      return;
    }

    // Validate date range for custom dates
    if (formData.dateType === 'custom') {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        alert('Ngày bắt đầu không thể sau ngày kết thúc');
        return;
      }
    }

    onSubmit({
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      amount: amount,
      period: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate,
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
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💰</span>
                  <span className="text-gray-700 font-medium">Số tiền</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-right text-lg font-medium transition-colors ${
                    formData.amount && formData.amount !== '0' 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`}>
                    {formData.amount && formData.amount !== '0' 
                      ? formatCurrency(parseFloat(formData.amount) || 0) 
                      : 'Nhập số tiền'
                    }
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
                disabled={!formData.amount || formData.amount === '0' || !formData.categoryId || parseFloat(formData.amount) <= 0}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
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
              <div className="space-y-4">
                {/* This Month Option */}
                <div
                  onClick={() => {
                    const now = new Date();
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    
                    setFormData(prev => ({ 
                      ...prev, 
                      dateType: 'thisMonth',
                      startDate: firstDay.toISOString().slice(0, 10),
                      endDate: lastDay.toISOString().slice(0, 10)
                    }));
                    setShowDateSelector(false);
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.dateType === 'thisMonth' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className={`w-5 h-5 ${formData.dateType === 'thisMonth' ? 'text-blue-600' : 'text-gray-600'}`} />
                    <div>
                      <p className="font-medium text-gray-900">Tháng này</p>
                      <p className="text-sm text-gray-500">
                        01/{(new Date().getMonth() + 1).toString().padStart(2, '0')} - {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}/{(new Date().getMonth() + 1).toString().padStart(2, '0')}
                      </p>
                    </div>
                    {formData.dateType === 'thisMonth' && (
                      <div className="ml-auto w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Date Range Option */}
                <div className={`border rounded-lg transition-all ${
                  formData.dateType === 'custom' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200'
                }`}>
                  <div
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        dateType: 'custom'
                      }));
                    }}
                    className="p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className={`w-5 h-5 ${formData.dateType === 'custom' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Tùy chỉnh thời gian</p>
                        <p className="text-sm text-gray-500">Chọn ngày bắt đầu và kết thúc</p>
                      </div>
                      {formData.dateType === 'custom' && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Custom Date Inputs - Show when selected */}
                  {formData.dateType === 'custom' && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                      <div className="grid grid-cols-1 gap-4 mt-4">
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
                                startDate: e.target.value
                              }));
                            }}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đến ngày
                          </label>
                          <input
                            type="date"
                            value={formData.endDate}
                            min={formData.startDate}
                            onChange={(e) => {
                              setFormData(prev => ({ 
                                ...prev, 
                                endDate: e.target.value
                              }));
                            }}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => setShowDateSelector(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number Keyboard Modal */}
      {showKeyboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowKeyboard(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">
                  Nhập số tiền
                </h2>
                <div className="w-10" />
              </div>
            </div>
            
            {/* Amount Display */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Số tiền ngân sách</p>
                <div className="min-h-[60px] flex items-center justify-center">
                  <p className="text-4xl font-bold text-gray-900 break-all">
                    {formData.amount ? formatCurrency(parseFloat(formData.amount) || 0) : '0 ₫'}
                  </p>
                </div>
                {formData.amount && (
                  <p className="text-sm text-gray-500 mt-2">
                    {parseFloat(formData.amount) >= 1000000 
                      ? `${(parseFloat(formData.amount) / 1000000).toFixed(1)} triệu đồng`
                      : parseFloat(formData.amount) >= 1000
                      ? `${(parseFloat(formData.amount) / 1000).toFixed(0)} nghìn đồng`
                      : 'đồng'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Number Keyboard */}
            <div className="flex-1">
              <NumberKeyboard
                onNumberPress={handleNumberPress}
                onBackspace={handleBackspace}
                onClear={handleClear}
              />
            </div>
            
            {/* Confirm Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowKeyboard(false)}
                disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
              >
                Xác nhận số tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
