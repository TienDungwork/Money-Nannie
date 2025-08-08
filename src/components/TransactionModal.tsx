'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Category, Wallet } from '@/types';
import { Button } from '@/components/ui/Button';
import { X, ChevronRight, Calendar, ArrowLeft, Check, Delete } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type NavigationView = 'main' | 'wallet' | 'category' | 'category-type' | 'category-parent' | 'category-child' | 'add-category' | 'date';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  wallets: Wallet[];
  transaction?: Transaction | null;
}

// Dữ liệu danh mục mẫu
const sampleCategories: Category[] = [
  // Khoản chi - Hóa đơn và tiện ích
  { id: 'expense-bills', name: 'Hóa đơn & Tiện ích', type: 'expense', color: '#ef4444', icon: 'Receipt', isParent: true },
  { id: 'expense-bills-rent', name: 'Thuê nhà', type: 'expense', color: '#ef4444', icon: 'Home', parentId: 'expense-bills' },
  { id: 'expense-bills-electric', name: 'Hóa đơn điện', type: 'expense', color: '#ef4444', icon: 'Zap', parentId: 'expense-bills' },
  { id: 'expense-bills-water', name: 'Hóa đơn nước', type: 'expense', color: '#ef4444', icon: 'Droplets', parentId: 'expense-bills' },
  { id: 'expense-bills-internet', name: 'Internet', type: 'expense', color: '#ef4444', icon: 'Wifi', parentId: 'expense-bills' },
  { id: 'expense-bills-phone', name: 'Hóa đơn điện thoại', type: 'expense', color: '#ef4444', icon: 'Phone', parentId: 'expense-bills' },
  { id: 'expense-bills-gas', name: 'Hóa đơn gas', type: 'expense', color: '#ef4444', icon: 'Flame', parentId: 'expense-bills' },
  { id: 'expense-bills-tv', name: 'Hóa đơn TV', type: 'expense', color: '#ef4444', icon: 'Tv', parentId: 'expense-bills' },

  // Khoản chi - Mua sắm
  { id: 'expense-shopping', name: 'Mua sắm', type: 'expense', color: '#f97316', icon: 'ShoppingBag', isParent: true },
  { id: 'expense-shopping-personal', name: 'Đồ dùng cá nhân', type: 'expense', color: '#f97316', icon: 'User', parentId: 'expense-shopping' },
  { id: 'expense-shopping-household', name: 'Đồ gia dụng', type: 'expense', color: '#f97316', icon: 'Home', parentId: 'expense-shopping' },
  { id: 'expense-shopping-beauty', name: 'Làm đẹp', type: 'expense', color: '#f97316', icon: 'Sparkles', parentId: 'expense-shopping' },

  // Khoản chi - Di chuyển
  { id: 'expense-transport', name: 'Di chuyển', type: 'expense', color: '#3b82f6', icon: 'Car', isParent: true },
  { id: 'expense-transport-fuel', name: 'Xăng xe', type: 'expense', color: '#3b82f6', icon: 'Fuel', parentId: 'expense-transport' },
  { id: 'expense-transport-maintenance', name: 'Bảo dưỡng xe', type: 'expense', color: '#3b82f6', icon: 'Wrench', parentId: 'expense-transport' },
  { id: 'expense-transport-parking', name: 'Phí đậu xe', type: 'expense', color: '#3b82f6', icon: 'ParkingCircle', parentId: 'expense-transport' },

  // Khoản chi - Ăn uống
  { id: 'expense-food', name: 'Ăn uống', type: 'expense', color: '#10b981', icon: 'UtensilsCrossed', isParent: true },
  { id: 'expense-food-restaurant', name: 'Nhà hàng', type: 'expense', color: '#10b981', icon: 'ChefHat', parentId: 'expense-food' },
  { id: 'expense-food-fastfood', name: 'Thức ăn nhanh', type: 'expense', color: '#10b981', icon: 'Pizza', parentId: 'expense-food' },
  { id: 'expense-food-coffee', name: 'Cà phê & Đồ uống', type: 'expense', color: '#10b981', icon: 'Coffee', parentId: 'expense-food' },

  // Khoản thu
  { id: 'income-salary', name: 'Lương', type: 'income', color: '#22c55e', icon: 'Banknote', isParent: true },
  { id: 'income-business', name: 'Kinh doanh', type: 'income', color: '#22c55e', icon: 'TrendingUp', isParent: true },
  { id: 'income-investment', name: 'Đầu tư', type: 'income', color: '#22c55e', icon: 'PiggyBank', isParent: true },
  { id: 'income-bonus', name: 'Thưởng', type: 'income', color: '#22c55e', icon: 'Gift', isParent: true },

  // Vay/Nợ
  { id: 'loan-lend', name: 'Cho vay', type: 'loan', color: '#8b5cf6', icon: 'HandCoins', isParent: true },
  { id: 'loan-repay', name: 'Trả nợ', type: 'loan', color: '#8b5cf6', icon: 'CreditCard', isParent: true },
  { id: 'loan-collect', name: 'Thu nợ', type: 'loan', color: '#8b5cf6', icon: 'Wallet', isParent: true },
  { id: 'loan-borrow', name: 'Đi vay', type: 'loan', color: '#8b5cf6', icon: 'HandHeart', isParent: true },
];

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

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categories,
  wallets,
  transaction 
}: TransactionModalProps) {
  const [currentView, setCurrentView] = useState<NavigationView>('main');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    walletId: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Category navigation states
  const [selectedCategoryType, setSelectedCategoryType] = useState<'expense' | 'income' | 'loan' | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null);

  // Add category form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('DollarSign');
  const [isParentCategory, setIsParentCategory] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [showEditOptions, setShowEditOptions] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        walletId: (transaction as any).walletId || '',
        date: transaction.date,
      });
    } else {
      // Set default wallet
      const defaultWallet = wallets.find(w => w.isDefault) || wallets[0];
      setFormData({
        amount: '',
        category: '',
        description: '',
        walletId: defaultWallet?.id || '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    
    // Reset view when modal opens/closes
    if (isOpen) {
      setCurrentView('main');
      setShowKeyboard(false);
      // Reset category form states
      setSelectedCategoryType(null);
      setSelectedParentCategory(null);
      setNewCategoryName('');
      setSelectedIcon('DollarSign');
      setIsParentCategory(true);
      setSelectedParentId('');
      setShowEditOptions(null);
    }
  }, [transaction, isOpen, wallets]);

  // Reset form when switching to add-category view
  useEffect(() => {
    if (currentView === 'add-category' && !selectedParentCategory) {
      setNewCategoryName('');
      setSelectedIcon('DollarSign');
      setIsParentCategory(true);
      setSelectedParentId('');
    }
  }, [currentView, selectedParentCategory]);

  // Get category type to determine transaction type
  const selectedCategory = sampleCategories.find(cat => cat.id === formData.category);
  const transactionType = selectedCategory?.type || 'expense';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description || !formData.walletId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newTransaction: Transaction = {
      id: transaction?.id || uuidv4(),
      type: transactionType,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      createdAt: transaction?.createdAt || new Date().toISOString(),
      walletId: formData.walletId,
    } as Transaction;

    onSave(newTransaction);
    onClose();
    
    // Reset form if creating new transaction
    if (!transaction) {
      const defaultWallet = wallets.find(w => w.isDefault) || wallets[0];
      setFormData({
        amount: '',
        category: '',
        description: '',
        walletId: defaultWallet?.id || '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  // Helper functions
  const getParentCategories = (type: 'expense' | 'income' | 'loan') => {
    return sampleCategories.filter(cat => cat.type === type && cat.isParent);
  };

  const getChildCategories = (parentId: string) => {
    return sampleCategories.filter(cat => cat.parentId === parentId);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'main': return transaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch';
      case 'wallet': return 'Chọn ví';
      case 'category-type': return 'Chọn loại giao dịch';
      case 'category-parent': return selectedCategoryType === 'expense' ? 'Khoản chi' : 
                                   selectedCategoryType === 'income' ? 'Khoản thu' : 'Vay/Nợ';
      case 'category-child': return selectedParentCategory?.name || 'Chọn danh mục';
      case 'add-category': return 'Thêm nhóm mới';
      case 'date': return 'Chọn ngày';
      default: return 'Thêm giao dịch';
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Custom keyboard handlers
  const handleNumberPress = (num: string) => {
    const newAmount = formData.amount + num;
    handleChange('amount', newAmount);
  };

  const handleBackspace = () => {
    const newAmount = formData.amount.slice(0, -1);
    handleChange('amount', newAmount);
  };

  const handleClear = () => {
    handleChange('amount', '');
  };

  const handleAmountFocus = () => {
    setShowKeyboard(true);
    amountInputRef.current?.blur(); // Prevent system keyboard
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const months = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 
                   'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'];
    
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderHeader = () => (
    <div className="sticky top-0 bg-white border-b border-gray-100 p-4 rounded-t-2xl">
      <div className="flex justify-between items-center">
        {currentView === 'main' ? (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        ) : (
          <button 
            onClick={() => {
              if (currentView === 'category-type') setCurrentView('main');
              else if (currentView === 'category-parent') setCurrentView('category-type');
              else if (currentView === 'category-child') setCurrentView('category-parent');
              else if (currentView === 'add-category') setCurrentView('category-parent');
              else setCurrentView('main');
            }} 
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-900">
          {getViewTitle()}
        </h2>
        {currentView === 'main' ? (
          <button
            type="submit"
            form="transaction-form"
            className="text-green-600 font-medium hover:text-green-700"
          >
            Lưu
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>
    </div>
  );

  const renderWalletSelection = () => (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => {
              handleChange('walletId', wallet.id);
              setCurrentView('main');
            }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: wallet.color + '20' }}
              >
                <span className="text-xl">{wallet.icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{wallet.name}</p>
                <p className="text-sm text-gray-500">{formatCurrency(wallet.balance)}</p>
              </div>
            </div>
            {formData.walletId === wallet.id && (
              <Check size={20} className="text-green-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategoryTypeSelection = () => (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div
          onClick={() => {
            setSelectedCategoryType('expense');
            setCurrentView('category-parent');
          }}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
              <span className="text-xl">💸</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Khoản chi</p>
              <p className="text-sm text-gray-500">Chi tiêu hàng ngày</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>

        <div
          onClick={() => {
            setSelectedCategoryType('income');
            setCurrentView('category-parent');
          }}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Khoản thu</p>
              <p className="text-sm text-gray-500">Thu nhập, lương thưởng</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>

        <div
          onClick={() => {
            setSelectedCategoryType('loan');
            setCurrentView('category-parent');
          }}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
              <span className="text-xl">🤝</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Vay/Nợ</p>
              <p className="text-sm text-gray-500">Cho vay, đi vay, trả nợ</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );

  const renderCategoryParentSelection = () => {
    if (!selectedCategoryType) return null;
    
    const parentCategories = getParentCategories(selectedCategoryType);
    
    const handleEdit = (category: Category) => {
      // Thiết lập dữ liệu để edit
      setSelectedParentCategory(category);
      setNewCategoryName(category.name);
      setSelectedIcon(category.icon);
      setIsParentCategory(category.isParent ?? true);
      setSelectedParentId(category.parentId || '');
      setCurrentView('add-category');
    };

    const handleDelete = (categoryId: string) => {
      if (confirm('Bạn có chắc muốn xóa nhóm này? Tất cả giao dịch thuộc nhóm này sẽ không có danh mục.')) {
        // Trong thực tế sẽ gọi API để xóa
        console.log('Xóa category:', categoryId);
        setShowEditOptions(null);
      }
    };
    
    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Nút thêm nhóm mới - chỉ hiển thị cho expense và income */}
          {selectedCategoryType !== 'loan' && (
            <div
              onClick={() => setCurrentView('add-category')}
              className="flex items-center justify-between p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors duration-200 border-2 border-dashed border-green-300"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                  <span className="text-xl">➕</span>
                </div>
                <div>
                  <p className="font-medium text-green-700">Thêm nhóm mới</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-green-400" />
            </div>
          )}

          {parentCategories.map((category) => {
            const hasChildren = getChildCategories(category.id).length > 0;
            const isCustomCategory = !['expense-bills', 'expense-shopping', 'expense-transport', 'expense-food', 'income-salary', 'income-business', 'income-investment', 'income-bonus', 'loan-lend', 'loan-repay', 'loan-collect', 'loan-borrow'].includes(category.id);
            
            return (
              <div key={category.id} className="relative">
                <div
                  onClick={() => {
                    if (showEditOptions === category.id) {
                      setShowEditOptions(null);
                      return;
                    }
                    
                    if (hasChildren) {
                      setSelectedParentCategory(category);
                      setCurrentView('category-child');
                    } else {
                      handleChange('category', category.id);
                      setCurrentView('main');
                    }
                  }}
                  onContextMenu={(e) => {
                    if (isCustomCategory) {
                      e.preventDefault();
                      setShowEditOptions(showEditOptions === category.id ? null : category.id);
                    }
                  }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <span className="text-xl">{getCategoryIcon(category.icon)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {hasChildren && (
                        <p className="text-sm text-gray-500">{getChildCategories(category.id).length} danh mục con</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Menu button cho custom categories */}
                    {isCustomCategory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditOptions(showEditOptions === category.id ? null : category.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <span className="text-lg">⋮</span>
                      </button>
                    )}
                    {formData.category === category.id ? (
                      <Check size={20} className="text-green-600" />
                    ) : (
                      hasChildren && <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Edit options dropdown */}
                {showEditOptions === category.id && isCustomCategory && (
                  <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-32">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category);
                        setShowEditOptions(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <span>✏️</span>
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                    >
                      <span>🗑️</span>
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCategoryChildSelection = () => {
    if (!selectedParentCategory) return null;
    
    const childCategories = getChildCategories(selectedParentCategory.id);
    
    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {childCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => {
                handleChange('category', category.id);
                setCurrentView('main');
              }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <span className="text-xl">{getCategoryIcon(category.icon)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                </div>
              </div>
              {formData.category === category.id && (
                <Check size={20} className="text-green-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAddCategoryForm = () => {
    const isEditing = selectedParentCategory && currentView === 'add-category';
    
    const availableIcons = [
      { key: 'DollarSign', icon: '💲', name: 'Tiền' },
      { key: 'Receipt', icon: '🧾', name: 'Hóa đơn' },
      { key: 'Home', icon: '🏠', name: 'Nhà' },
      { key: 'Car', icon: '🚗', name: 'Xe' },
      { key: 'ShoppingBag', icon: '🛍️', name: 'Mua sắm' },
      { key: 'UtensilsCrossed', icon: '🍽️', name: 'Ăn uống' },
      { key: 'Fuel', icon: '⛽', name: 'Xăng' },
      { key: 'Phone', icon: '📱', name: 'Điện thoại' },
      { key: 'Zap', icon: '⚡', name: 'Điện' },
      { key: 'Droplets', icon: '💧', name: 'Nước' },
      { key: 'Wifi', icon: '📶', name: 'Internet' },
      { key: 'Tv', icon: '📺', name: 'TV' },
      { key: 'User', icon: '👤', name: 'Cá nhân' },
      { key: 'Sparkles', icon: '✨', name: 'Làm đẹp' },
      { key: 'Coffee', icon: '☕', name: 'Cà phê' },
      { key: 'Gift', icon: '🎁', name: 'Quà tặng' },
      { key: 'PiggyBank', icon: '🐷', name: 'Tiết kiệm' },
      { key: 'TrendingUp', icon: '📈', name: 'Đầu tư' },
    ];

    const parentCategories = selectedCategoryType ? getParentCategories(selectedCategoryType) : [];
    
    const handleSave = () => {
      if (!newCategoryName.trim()) return;
      
      if (isEditing && selectedParentCategory) {
        // Trong thực tế sẽ gọi API để cập nhật
        console.log('Cập nhật category:', {
          id: selectedParentCategory.id,
          name: newCategoryName.trim(),
          icon: selectedIcon,
          isParent: isParentCategory,
          parentId: isParentCategory ? undefined : selectedParentId || undefined
        });
      } else {
        // Trong thực tế sẽ gọi API để tạo mới
        const newCategory = {
          id: Date.now().toString(),
          name: newCategoryName.trim(),
          type: selectedCategoryType!,
          icon: selectedIcon,
          color: selectedCategoryType === 'expense' ? '#ef4444' : '#22c55e',
          isParent: isParentCategory,
          parentId: isParentCategory ? undefined : selectedParentId || undefined
        };
        console.log('Tạo category mới:', newCategory);
      }
      
      // Reset form và quay lại
      setSelectedParentCategory(null);
      setNewCategoryName('');
      setSelectedIcon('DollarSign');
      setIsParentCategory(true);
      setSelectedParentId('');
      setCurrentView('category-parent');
    };
    
    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Tên nhóm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhóm *
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nhập tên nhóm..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Chọn icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn biểu tượng
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
              {availableIcons.map((iconItem) => (
                <button
                  key={iconItem.key}
                  onClick={() => setSelectedIcon(iconItem.key)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedIcon === iconItem.key 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={iconItem.name}
                >
                  <span className="text-xl">{iconItem.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loại nhóm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại nhóm
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsParentCategory(true)}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  isParentCategory 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                Nhóm cha
              </button>
              <button
                onClick={() => setIsParentCategory(false)}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  !isParentCategory 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                Nhóm con
              </button>
            </div>
          </div>

          {/* Chọn nhóm cha (nếu là nhóm con) */}
          {!isParentCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thuộc nhóm cha
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Chọn nhóm cha</option>
                {parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedParentCategory(null);
                setCurrentView('category-parent');
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={!newCategoryName.trim() || (!isParentCategory && !selectedParentId)}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium disabled:bg-gray-300"
            >
              {isEditing ? 'Cập nhật' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get category icons
  const getCategoryIcon = (icon: string): string => {
    const iconMap: { [key: string]: string } = {
      Receipt: '🧾', Home: '🏠', Zap: '⚡', Droplets: '💧', Wifi: '📶',
      Phone: '📱', Flame: '🔥', Tv: '📺', ShoppingBag: '🛍️', User: '👤',
      Sparkles: '✨', Car: '🚗', Fuel: '⛽', Wrench: '🔧', ParkingCircle: '🅿️',
      UtensilsCrossed: '🍽️', ChefHat: '👨‍🍳', Pizza: '🍕', Coffee: '☕',
      Banknote: '💵', TrendingUp: '📈', PiggyBank: '🐷', Gift: '🎁',
      HandCoins: '🤲', CreditCard: '💳', Wallet: '👛', HandHeart: '🤝',
      DollarSign: '💲'
    };
    return iconMap[icon] || '💰';
  };

  const renderCategorySelection = () => (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => {
              handleChange('category', category.id);
              setCurrentView('main');
            }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.color + '20' }}
              >
                <span className="text-xl">{category.icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-sm text-gray-500">{category.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</p>
              </div>
            </div>
            {formData.category === category.id && (
              <Check size={20} className="text-green-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDateSelection = () => (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <input
            type="date"
            value={formData.date}
            onChange={(e) => {
              handleChange('date', e.target.value);
              setCurrentView('main');
            }}
            className="w-full p-4 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderMainForm = () => (
    <div className="h-full flex flex-col">
      <form id="transaction-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6 animate-in slide-in-from-left duration-300">
        {/* Amount Input */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">VND</span>
          </div>
          <input
            ref={amountInputRef}
            type="text"
            value={formData.amount}
            onFocus={handleAmountFocus}
            onChange={(e) => {
              // Only allow direct typing if keyboard is not shown
              if (!showKeyboard) {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleChange('amount', value);
              }
            }}
            className="text-4xl font-light text-center w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 cursor-pointer"
            placeholder="0"
            readOnly={showKeyboard}
            required
          />
        </div>

        {/* Close Keyboard Button */}
        {showKeyboard && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowKeyboard(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              Xong
            </button>
          </div>
        )}

        {/* Wallet Selection */}
        <div className="space-y-3">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setCurrentView('wallet')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">
                  {formData.walletId 
                    ? wallets.find(w => w.id === formData.walletId)?.icon 
                    : '💳'}
                </span>
              </div>
              <div>
                <span className="text-gray-900 font-medium">
                  {formData.walletId 
                    ? wallets.find(w => w.id === formData.walletId)?.name 
                    : 'Tiền mặt'}
                </span>
                {formData.walletId && (
                  <p className="text-sm text-gray-500">
                    {formatCurrency(wallets.find(w => w.id === formData.walletId)?.balance || 0)}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setCurrentView('category-type')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">
                  {formData.category 
                    ? getCategoryIcon(sampleCategories.find(c => c.id === formData.category)?.icon || '')
                    : '≡'}
                </span>
              </div>
              <span className="text-gray-500">
                {formData.category 
                  ? sampleCategories.find(c => c.id === formData.category)?.name 
                  : 'Chọn nhóm'}
              </span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onFocus={() => setShowKeyboard(false)}
            className="w-full bg-gray-50 border-none rounded-xl p-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            placeholder="Ghi chú"
            required
          />
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setCurrentView('date')}
          >
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-600" />
              <span className="text-gray-900">{formatDate(formData.date)}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
      </form>

      {/* Custom Number Keyboard */}
      {showKeyboard && (
        <NumberKeyboard
          onNumberPress={handleNumberPress}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />
      )}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'wallet': return renderWalletSelection();
      case 'category': return renderCategorySelection();
      case 'category-type': return renderCategoryTypeSelection();
      case 'category-parent': return renderCategoryParentSelection();
      case 'category-child': return renderCategoryChildSelection();
      case 'add-category': return renderAddCategoryForm();
      case 'date': return renderDateSelection();
      default: return renderMainForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out">
        {renderHeader()}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
}
