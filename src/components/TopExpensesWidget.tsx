'use client';

import { useState, useEffect } from 'react';
import { Transaction, Category } from '@/types';

interface TopExpensesWidgetProps {
  transactions: Transaction[];
  categories: Category[];
}

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
  icon: string;
  name: string;
}

export function TopExpensesWidget({ transactions, categories }: TopExpensesWidgetProps) {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render khi transactions hoặc categories thay đổi
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [transactions, categories]);

  const getCategoryIcon = (categoryId: string) => {
    // Mapping HOÀN CHỈNH cho key-based icons (từ IconPicker) - CHECK TRƯỚC
    const keyToIconMap: { [key: string]: string } = {
      // Tiền tệ
      'DollarSign': '💲',
      'Banknote': '💵', 
      'CreditCard': '💳',
      'Wallet': '👛',
      'PiggyBank': '🐷',
      'TrendingUp': '📈',
      'HandCoins': '🤲',
      'Receipt': '🧾',
      
      // Ăn uống
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
      
      // Di chuyển
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
      
      // Nhà cửa
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
      
      // Mua sắm
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
      
      // Giải trí
      'GameController': '🎮',
      'Music': '🎵',
      'Movie': '🎬',
      'Camera': '📷',
      'Book': '📖',
      'Sport': '⚽',
      'Gym': '🏋️',
      'Swimming': '🏊',
      'Travel': '🧳',
      'Beach': '🏖️',
      
      // Sức khỏe
      'Hospital': '🏥',
      'Medicine': '💊',
      'Doctor': '👨‍⚕️',
      'Stethoscope': '🩺',
      'Syringe': '💉',
      'Dental': '🦷',
      'Glasses2': '👓',
      'Heart': '❤️',
      
      // Giáo dục
      'School': '🏫',
      'BookOpen': '📚',
      'Pencil': '✏️',
      'Calculator': '🔢',
      'Computer': '💻',
      'Graduation': '🎓',
      'Certificate': '📜',
      
      // Công việc
      'Briefcase': '💼',
      'Office': '🏢',
      'Phone': '📱',
      'Email': '📧',
      'Calendar': '📅',
      'Meeting': '👥',
      'Presentation': '📊',
      
      // Khác
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
      'Building': '🏢',
      'Factory': '🏭',
      'Hammer': '🔨',
      'Scissors': '✂️',
    };

    // 1. Check key mapping TRƯỚC TIÊN
    if (keyToIconMap[categoryId]) {
      return keyToIconMap[categoryId];
    }
    
    // 2. Tìm category object
    const categoryObj = categories.find(c => c.id === categoryId);
    
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
    };
    return defaultIcons[categoryObj?.name || categoryId] || '📦';
  };

  const getCategoryName = (category: string) => {
    const categoryObj = categories.find(c => c.id === category);
    return categoryObj?.name || category;
  };

  const getTopExpenseCategories = (period: 'week' | 'month'): ExpenseData[] => {
    const now = new Date();
    let filteredTransactions: Transaction[];
    
    if (period === 'week') {
      // Tuần này - từ thứ 2 đến Chủ nhật của tuần hiện tại
      const startOfWeek = new Date(now);
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Điều chỉnh để bắt đầu từ thứ 2
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ nhật
      endOfWeek.setHours(23, 59, 59, 999);
      
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate >= startOfWeek && 
               transactionDate <= endOfWeek;
      });
    } else {
      // Tháng này - từ ngày 1 đến ngày cuối tháng hiện tại
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Ngày cuối tháng
      endOfMonth.setHours(23, 59, 59, 999);
      
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate >= startOfMonth && 
               transactionDate <= endOfMonth;
      });
    }
    
    // Nhóm theo danh mục cha
    const parentCategoryTotals: { [key: string]: number } = {};
    let totalExpense = 0;
    
    filteredTransactions.forEach(t => {
      // Tìm danh mục của giao dịch
      const category = categories.find(c => c.id === t.category);
      if (category) {
        // Nếu có danh mục cha, nhóm vào danh mục cha, nếu không thì dùng chính nó
        const parentCategoryId = category.parentId || category.id;
        const parentCategory = categories.find(c => c.id === parentCategoryId);
        
        if (parentCategory) {
          parentCategoryTotals[parentCategoryId] = (parentCategoryTotals[parentCategoryId] || 0) + t.amount;
          totalExpense += t.amount;
        }
      }
    });
    
    // Sắp xếp và lấy top 3
    const sortedCategories = Object.entries(parentCategoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          category: categoryId,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          icon: getCategoryIcon(categoryId),
          name: category?.name || categoryId
        };
      });
    
    return sortedCategories;
  };

  const weekTopExpenses = getTopExpenseCategories('week');
  const monthTopExpenses = getTopExpenseCategories('month');
  const currentData = activeTab === 'week' ? weekTopExpenses : monthTopExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getDateRangeText = (period: 'week' | 'month') => {
    const now = new Date();
    
    if (period === 'week') {
      const startOfWeek = new Date(now);
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
    } else {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return `${startOfMonth.getDate()}/${startOfMonth.getMonth() + 1} - ${endOfMonth.getDate()}/${endOfMonth.getMonth() + 1}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Chi tiêu nhiều nhất</h3>
        <span className="text-green-600 text-sm">Xem tất cả</span>
      </div>
      
      {/* Tab switcher */}
      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'week'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex flex-col">
              <span>Tuần này</span>
              <span className="text-xs opacity-75">{getDateRangeText('week')}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex flex-col">
              <span>Tháng này</span>
              <span className="text-xs opacity-75">{getDateRangeText('month')}</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-4">
        {currentData.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-gray-500">Chưa có giao dịch</span>
          </div>
        ) : (
          <div className="space-y-3">
            {currentData.map((expense, index) => (
              <div key={expense.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{expense.icon}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 block">{expense.name}</span>
                    <span className="text-sm text-gray-500">{formatCurrency(expense.amount)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-600 text-lg">
                    {expense.percentage.toFixed(1)}%
                  </span>
                  {index === 0 && (
                    <div className="text-xs text-gray-500 mt-1">Cao nhất</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
