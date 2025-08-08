'use client';

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

export interface IconItem {
  key: string;
  icon: string;
  name: string;
  category: string;
}

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconKey: string) => void;
  selectedIcon?: string;
}

const iconCategories = [
  { key: 'all', name: 'Tất cả', emoji: '📋' },
  { key: 'money', name: 'Tiền tệ', emoji: '💰' },
  { key: 'food', name: 'Ăn uống', emoji: '🍽️' },
  { key: 'transport', name: 'Di chuyển', emoji: '🚗' },
  { key: 'home', name: 'Nhà cửa', emoji: '🏠' },
  { key: 'shopping', name: 'Mua sắm', emoji: '🛍️' },
  { key: 'entertainment', name: 'Giải trí', emoji: '🎮' },
  { key: 'health', name: 'Sức khỏe', emoji: '🏥' },
  { key: 'education', name: 'Giáo dục', emoji: '📚' },
  { key: 'work', name: 'Công việc', emoji: '💼' },
  { key: 'other', name: 'Khác', emoji: '🔧' },
];

const allIcons: IconItem[] = [
  // Tiền tệ
  { key: 'DollarSign', icon: '💲', name: 'Tiền', category: 'money' },
  { key: 'Banknote', icon: '💵', name: 'Tiền mặt', category: 'money' },
  { key: 'CreditCard', icon: '💳', name: 'Thẻ tín dụng', category: 'money' },
  { key: 'Wallet', icon: '👛', name: 'Ví', category: 'money' },
  { key: 'PiggyBank', icon: '🐷', name: 'Tiết kiệm', category: 'money' },
  { key: 'TrendingUp', icon: '📈', name: 'Đầu tư', category: 'money' },
  { key: 'HandCoins', icon: '🤲', name: 'Cho vay', category: 'money' },
  { key: 'Receipt', icon: '🧾', name: 'Hóa đơn', category: 'money' },

  // Ăn uống
  { key: 'UtensilsCrossed', icon: '🍽️', name: 'Ăn uống', category: 'food' },
  { key: 'Coffee', icon: '☕', name: 'Cà phê', category: 'food' },
  { key: 'Pizza', icon: '🍕', name: 'Pizza', category: 'food' },
  { key: 'ChefHat', icon: '👨‍🍳', name: 'Nhà hàng', category: 'food' },
  { key: 'Cake', icon: '🎂', name: 'Bánh ngọt', category: 'food' },
  { key: 'Beer', icon: '🍺', name: 'Đồ uống có cồn', category: 'food' },
  { key: 'Apple', icon: '🍎', name: 'Trái cây', category: 'food' },
  { key: 'Bread', icon: '🍞', name: 'Bánh mì', category: 'food' },
  { key: 'Rice', icon: '🍚', name: 'Cơm', category: 'food' },
  { key: 'Noodles', icon: '🍜', name: 'Mì', category: 'food' },

  // Di chuyển
  { key: 'Car', icon: '🚗', name: 'Xe hơi', category: 'transport' },
  { key: 'Fuel', icon: '⛽', name: 'Xăng', category: 'transport' },
  { key: 'Bus', icon: '🚌', name: 'Xe buýt', category: 'transport' },
  { key: 'Train', icon: '🚊', name: 'Tàu điện', category: 'transport' },
  { key: 'Plane', icon: '✈️', name: 'Máy bay', category: 'transport' },
  { key: 'Bike', icon: '🚲', name: 'Xe đạp', category: 'transport' },
  { key: 'Motorcycle', icon: '🏍️', name: 'Xe máy', category: 'transport' },
  { key: 'Taxi', icon: '🚕', name: 'Taxi', category: 'transport' },
  { key: 'ParkingCircle', icon: '🅿️', name: 'Đậu xe', category: 'transport' },
  { key: 'Wrench', icon: '🔧', name: 'Sửa chữa', category: 'transport' },

  // Nhà cửa
  { key: 'Home', icon: '🏠', name: 'Nhà', category: 'home' },
  { key: 'Zap', icon: '⚡', name: 'Điện', category: 'home' },
  { key: 'Droplets', icon: '💧', name: 'Nước', category: 'home' },
  { key: 'Wifi', icon: '📶', name: 'Internet', category: 'home' },
  { key: 'Tv', icon: '📺', name: 'TV', category: 'home' },
  { key: 'Flame', icon: '🔥', name: 'Gas', category: 'home' },
  { key: 'Bed', icon: '🛏️', name: 'Giường', category: 'home' },
  { key: 'Sofa', icon: '🛋️', name: 'Ghế sofa', category: 'home' },
  { key: 'Bath', icon: '🛁', name: 'Phòng tắm', category: 'home' },
  { key: 'Kitchen', icon: '🍳', name: 'Nhà bếp', category: 'home' },

  // Mua sắm
  { key: 'ShoppingBag', icon: '🛍️', name: 'Mua sắm', category: 'shopping' },
  { key: 'ShoppingCart', icon: '🛒', name: 'Giỏ hàng', category: 'shopping' },
  { key: 'Gift', icon: '🎁', name: 'Quà tặng', category: 'shopping' },
  { key: 'Shirt', icon: '👕', name: 'Quần áo', category: 'shopping' },
  { key: 'Shoes', icon: '👟', name: 'Giày dép', category: 'shopping' },
  { key: 'Watch', icon: '⌚', name: 'Đồng hồ', category: 'shopping' },
  { key: 'Bag', icon: '🎒', name: 'Túi xách', category: 'shopping' },
  { key: 'Glasses', icon: '👓', name: 'Kính mắt', category: 'shopping' },
  { key: 'Sparkles', icon: '✨', name: 'Làm đẹp', category: 'shopping' },
  { key: 'Perfume', icon: '🧴', name: 'Nước hoa', category: 'shopping' },

  // Giải trí
  { key: 'GameController', icon: '🎮', name: 'Game', category: 'entertainment' },
  { key: 'Music', icon: '🎵', name: 'Âm nhạc', category: 'entertainment' },
  { key: 'Movie', icon: '🎬', name: 'Phim ảnh', category: 'entertainment' },
  { key: 'Camera', icon: '📷', name: 'Chụp ảnh', category: 'entertainment' },
  { key: 'Book', icon: '📖', name: 'Đọc sách', category: 'entertainment' },
  { key: 'Sport', icon: '⚽', name: 'Thể thao', category: 'entertainment' },
  { key: 'Gym', icon: '🏋️', name: 'Gym', category: 'entertainment' },
  { key: 'Swimming', icon: '🏊', name: 'Bơi lội', category: 'entertainment' },
  { key: 'Travel', icon: '🧳', name: 'Du lịch', category: 'entertainment' },
  { key: 'Beach', icon: '🏖️', name: 'Bãi biển', category: 'entertainment' },

  // Sức khỏe
  { key: 'Hospital', icon: '🏥', name: 'Bệnh viện', category: 'health' },
  { key: 'Medicine', icon: '💊', name: 'Thuốc', category: 'health' },
  { key: 'Doctor', icon: '👨‍⚕️', name: 'Bác sĩ', category: 'health' },
  { key: 'Stethoscope', icon: '🩺', name: 'Khám bệnh', category: 'health' },
  { key: 'Syringe', icon: '💉', name: 'Tiêm chích', category: 'health' },
  { key: 'Dental', icon: '🦷', name: 'Nha khoa', category: 'health' },
  { key: 'Glasses2', icon: '👓', name: 'Mắt kính', category: 'health' },
  { key: 'Heart', icon: '❤️', name: 'Tim mạch', category: 'health' },

  // Giáo dục
  { key: 'School', icon: '🏫', name: 'Trường học', category: 'education' },
  { key: 'BookOpen', icon: '📚', name: 'Sách giáo khoa', category: 'education' },
  { key: 'Pencil', icon: '✏️', name: 'Bút chì', category: 'education' },
  { key: 'Calculator', icon: '🔢', name: 'Máy tính', category: 'education' },
  { key: 'Computer', icon: '💻', name: 'Máy tính', category: 'education' },
  { key: 'Graduation', icon: '🎓', name: 'Tốt nghiệp', category: 'education' },
  { key: 'Certificate', icon: '📜', name: 'Chứng chỉ', category: 'education' },

  // Công việc
  { key: 'Briefcase', icon: '💼', name: 'Công việc', category: 'work' },
  { key: 'Office', icon: '🏢', name: 'Văn phòng', category: 'work' },
  { key: 'Phone', icon: '📱', name: 'Điện thoại', category: 'work' },
  { key: 'Email', icon: '📧', name: 'Email', category: 'work' },
  { key: 'Calendar', icon: '📅', name: 'Lịch', category: 'work' },
  { key: 'Meeting', icon: '👥', name: 'Họp', category: 'work' },
  { key: 'Presentation', icon: '📊', name: 'Thuyết trình', category: 'work' },

  // Khác
  { key: 'User', icon: '👤', name: 'Cá nhân', category: 'other' },
  { key: 'Family', icon: '👨‍👩‍👧‍👦', name: 'Gia đình', category: 'other' },
  { key: 'Pet', icon: '🐕', name: 'Thú cưng', category: 'other' },
  { key: 'Insurance', icon: '🛡️', name: 'Bảo hiểm', category: 'other' },
  { key: 'Tax', icon: '🧾', name: 'Thuế', category: 'other' },
  { key: 'Charity', icon: '🤝', name: 'Từ thiện', category: 'other' },
  { key: 'Tools', icon: '🔨', name: 'Công cụ', category: 'other' },
  { key: 'Settings', icon: '⚙️', name: 'Cài đặt', category: 'other' },
  { key: 'Star', icon: '⭐', name: 'Yêu thích', category: 'other' },
  { key: 'Question', icon: '❓', name: 'Không xác định', category: 'other' },
];

export function IconPicker({ isOpen, onClose, onSelectIcon, selectedIcon }: IconPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = allIcons.filter(icon => {
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 rounded-t-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chọn biểu tượng</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm biểu tượng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 px-2">
          {iconCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex-shrink-0 flex flex-col items-center p-3 min-w-[70px] transition-colors ${
                selectedCategory === category.key
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{category.emoji}</span>
              <span className="text-xs font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-3">
            {filteredIcons.map((iconItem) => (
              <button
                key={iconItem.key}
                onClick={() => {
                  onSelectIcon(iconItem.key);
                  onClose();
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  selectedIcon === iconItem.key
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={iconItem.name}
              >
                <span className="text-2xl">{iconItem.icon}</span>
              </button>
            ))}
          </div>
          
          {filteredIcons.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy biểu tượng phù hợp</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredIcons.length} biểu tượng</span>
            <span>Nhấn để chọn</span>
          </div>
        </div>
      </div>
    </div>
  );
}