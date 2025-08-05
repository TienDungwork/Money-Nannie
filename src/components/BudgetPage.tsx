'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { Budget } from '@/types/budget';
import { formatCurrency, calculateTotalByType } from '@/lib/utils';
import { Plus, Target, TrendingDown, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface BudgetPageProps {
  transactions: Transaction[];
}

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Ăn uống', icon: '🍽️' },
  { id: 'transport', name: 'Di chuyển', icon: '🚗' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛍️' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎬' },
  { id: 'health', name: 'Sức khỏe', icon: '🏥' },
  { id: 'education', name: 'Giáo dục', icon: '📚' },
  { id: 'bills', name: 'Hóa đơn', icon: '📄' },
  { id: 'investment', name: 'Đầu tư', icon: '📈' },
  { id: 'other', name: 'Khác', icon: '📦' },
];

export function BudgetPage({ transactions }: BudgetPageProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Ngân sách</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Tạo ngân sách</span>
        </button>
      </div>

      {/* Budget List */}
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

      {/* Create Budget Form */}
      {showCreateForm && (
        <BudgetCreateForm
          onSubmit={createBudget}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

interface BudgetCreateFormProps {
  onSubmit: (budget: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => void;
  onCancel: () => void;
}

function BudgetCreateForm({ onSubmit, onCancel }: BudgetCreateFormProps) {
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as Budget['period'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.categoryId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const category = EXPENSE_CATEGORIES.find(c => c.id === formData.categoryId);
    if (!category) return;

    onSubmit({
      categoryId: formData.categoryId,
      categoryName: category.name,
      amount: parseFloat(formData.amount),
      period: formData.period,
    });

    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo ngân sách mới</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Chọn danh mục</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số tiền
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0"
            min="0"
            step="1000"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kỳ hạn
          </label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value as Budget['period'] })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">Hàng tháng</option>
            <option value="weekly">Hàng tuần</option>
            <option value="yearly">Hàng năm</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tạo ngân sách
          </button>
        </div>
      </form>
    </div>
  );
}
