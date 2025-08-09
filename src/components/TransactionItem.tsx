'use client';

import React from 'react';
import { Transaction, Category } from '@/types';
import { formatCurrency, formatDetailedDate } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit } from 'lucide-react';
import { defaultCategories } from '@/lib/storage';

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, categories, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  
  // Hàm lấy icon category - ĐỒNG BỘ VỚI TopExpensesWidget
  const getCategoryIcon = (categoryId: string) => {
    // Mapping HOÀN CHỈNH cho key-based icons (từ IconPicker) - CHECK TRƯỚC TIÊN
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
    
    const fallbackIcon = defaultIcons[categoryObj?.name || categoryId] || '📦';
    return fallbackIcon;
  };

  const getCategoryName = (categoryId: string) => {
    // Tìm category theo ID trước tiên
    const categoryById = categories.find(cat => cat.id === categoryId);
    if (categoryById) {
      return categoryById.name;
    }
    
    // Tìm theo name (cho dữ liệu cũ)
    const categoryByName = categories.find(cat => cat.name === categoryId);
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
    return names[categoryId] || categoryId;
  };
  
  const categoryName = getCategoryName(transaction.category);
  const categoryIcon = getCategoryIcon(transaction.category);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isIncome ? 'bg-success-50' : 'bg-danger-50'}`}>
            <span className="text-lg">{categoryIcon}</span>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">{categoryName}</h3>
            <p className="text-sm text-gray-500">{transaction.description}</p>
            {transaction.withPerson && (
              <p className="text-xs text-blue-600">Với {transaction.withPerson}</p>
            )}
            {transaction.note && (
              <p className="text-xs text-gray-400 mt-1">{transaction.note}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{formatDetailedDate(transaction.date)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className={`font-semibold ${isIncome ? 'text-success-600' : 'text-danger-600'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>
          
          <div className="flex space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
