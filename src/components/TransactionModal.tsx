'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Category, Wallet } from '@/types';
import { Button } from '@/components/ui/Button';
import { X, ChevronRight, Calendar, ArrowLeft, Check, Delete } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getAllCategories, getParentCategories, getChildCategories, isSampleCategory } from '@/lib/defaultCategories';

type NavigationView = 'main' | 'wallet' | 'category' | 'category-type' | 'category-parent' | 'category-child' | 'add-category' | 'icon-picker' | 'parent-category-picker';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  wallets: Wallet[];
  transaction?: Transaction | null;
  onAddCategory?: (category: Category) => void;
}

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
  transaction,
  onAddCategory
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

  const amountInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Get category type to determine transaction type
  const selectedCategory = getAllCategories(categories).find(cat => cat.id === formData.category);
  const transactionType = selectedCategory?.type || 'expense';

  // Ngăn body scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

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
    }
  }, [transaction, isOpen, wallets]);

  // Reset form when switching to add-category view (only when first entering, not when coming back from parent picker)
  useEffect(() => {
    if (currentView === 'add-category' && !selectedParentCategory && !selectedParentId && isParentCategory) {
      // Only reset if we're truly starting fresh (not coming back from parent picker)
      if (newCategoryName === '') {
        setSelectedIcon('DollarSign');
      }
    }
  }, [currentView, selectedParentCategory, selectedParentId, isParentCategory, newCategoryName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.walletId) {
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

  const getViewTitle = () => {
    switch (currentView) {
      case 'main': return transaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch';
      case 'wallet': return 'Chọn ví';
      case 'category-type': return 'Chọn loại giao dịch';
      case 'category-parent': return selectedCategoryType === 'expense' ? 'Khoản chi' : 
                                   selectedCategoryType === 'income' ? 'Khoản thu' : 'Vay/Nợ';
      case 'category-child': return selectedParentCategory?.name || 'Chọn danh mục';
      case 'add-category': return 'Thêm nhóm mới';
      case 'icon-picker': return 'Chọn biểu tượng';
      case 'parent-category-picker': return 'Chọn nhóm cha';
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
    
    const parentCategories = getParentCategories(selectedCategoryType, categories);
    
    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300 min-h-0">
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2 min-h-0" 
             style={{ 
               WebkitOverflowScrolling: 'touch',
               touchAction: 'pan-y',
               overscrollBehavior: 'contain'
             }}>
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
            const hasChildren = getChildCategories(category.id, categories).length > 0;
            
            return (
              <div key={category.id}>
                <div
                  onClick={() => {
                    if (hasChildren) {
                      setSelectedParentCategory(category);
                      setCurrentView('category-child');
                    } else {
                      handleChange('category', category.id);
                      setCurrentView('main');
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
                        <p className="text-sm text-gray-500">{getChildCategories(category.id, categories).length} danh mục con</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData.category === category.id ? (
                      <Check size={20} className="text-green-600" />
                    ) : (
                      hasChildren && <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCategoryChildSelection = () => {
    if (!selectedParentCategory) return null;
    
    const childCategories = getChildCategories(selectedParentCategory.id, categories);
    
    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300 min-h-0">
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
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

    const parentCategories = selectedCategoryType ? getParentCategories(selectedCategoryType, categories) : [];
    
    const handleSave = () => {
      if (!newCategoryName.trim()) return;
      
      if (isEditing && selectedParentCategory) {
        // Cập nhật category
        const iconEmoji = availableIcons.find(i => i.key === selectedIcon)?.icon || selectedIcon;
        
        const updatedCategory = {
          ...selectedParentCategory,
          name: newCategoryName.trim(),
          icon: iconEmoji,
          isParent: isParentCategory,
          parentId: isParentCategory ? undefined : selectedParentId || undefined
        };
        
        console.log('Cập nhật category:', updatedCategory);
      } else {
        // Tạo category mới
        const iconEmoji = availableIcons.find(i => i.key === selectedIcon)?.icon || selectedIcon;
        
        const newCategory: Category = {
          id: `custom-${Date.now()}`,
          name: newCategoryName.trim(),
          type: selectedCategoryType!,
          icon: iconEmoji,
          color: selectedCategoryType === 'expense' ? '#ef4444' : 
                 selectedCategoryType === 'income' ? '#22c55e' : '#8b5cf6',
          isParent: isParentCategory,
          parentId: isParentCategory ? undefined : selectedParentId || undefined
        };
        
        if (onAddCategory) {
          onAddCategory(newCategory);
        }
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
          
          {/* Icon và Tên nhóm - nằm ngang */}
          <div className="flex items-center space-x-3">
            {/* Chọn Icon */}
            <button
              onClick={() => setCurrentView('icon-picker')}
              className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-colors"
            >
              <span className="text-xl">
                {availableIcons.find(i => i.key === selectedIcon)?.icon || selectedIcon}
              </span>
            </button>
            
            {/* Tên nhóm */}
            <div className="flex-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Tên nhóm"
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:border-green-500 focus:ring-0 text-lg bg-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Chọn loại - Khoản thu/chi */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setSelectedCategoryType('income')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedCategoryType === 'income'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Khoản thu
            </button>
            <button
              onClick={() => setSelectedCategoryType('expense')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedCategoryType === 'expense'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Khoản chi
            </button>
          </div>

          {/* Chọn nhóm cha */}
          <div>
            <button
              onClick={() => setCurrentView('parent-category-picker')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Nhóm cha</p>
                  <p className="text-gray-900">
                    {isParentCategory 
                      ? 'Không có (Nhóm cha mới)'
                      : selectedParentId 
                        ? parentCategories.find(p => p.id === selectedParentId)?.name || 'Chọn nhóm'
                        : 'Chọn nhóm cha'
                    }
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

        </div>

        {/* Nút lưu */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            onClick={handleSave}
            disabled={!newCategoryName.trim() || !selectedCategoryType}
            className="w-full"
          >
            {isEditing 
              ? 'Cập nhật' 
              : isParentCategory 
                ? 'Tạo nhóm cha' 
                : 'Tạo nhóm con'
            }
          </Button>
        </div>
      </div>
    );
  };

  // Modal chọn icon
  const renderIconPicker = () => {
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
      { key: 'Apple', icon: '🍎', name: 'Thực phẩm' },
      { key: 'Heart', icon: '❤️', name: 'Yêu thích' },
      { key: 'Star', icon: '⭐', name: 'Đặc biệt' },
      { key: 'Shield', icon: '🛡️', name: 'Bảo hiểm' },
      { key: 'Graduation', icon: '🎓', name: 'Học tập' },
      { key: 'Hospital', icon: '🏥', name: 'Y tế' },
      { key: 'Plane', icon: '✈️', name: 'Du lịch' },
      { key: 'Music', icon: '🎵', name: 'Âm nhạc' },
      { key: 'Camera', icon: '📷', name: 'Nhiếp ảnh' },
      { key: 'Gamepad', icon: '🎮', name: 'Game' },
      { key: 'Book', icon: '📚', name: 'Sách' },
      { key: 'Shirt', icon: '👕', name: 'Quần áo' },
      { key: 'Shoe', icon: '👟', name: 'Giày dép' },
      { key: 'Watch', icon: '⌚', name: 'Đồng hồ' },
      { key: 'Banknote', icon: '💵', name: 'Tiền mặt' },
      { key: 'CreditCard', icon: '💳', name: 'Thẻ tín dụng' },
      { key: 'Wallet', icon: '👛', name: 'Ví' },
    ];

    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-3">
            {availableIcons.map((iconItem) => (
              <button
                key={iconItem.key}
                onClick={() => {
                  setSelectedIcon(iconItem.key);
                  setCurrentView('add-category');
                }}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  selectedIcon === iconItem.key 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{iconItem.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Modal chọn nhóm cha  
  const renderParentCategoryPicker = () => {
    const parentCategories = selectedCategoryType ? getParentCategories(selectedCategoryType, categories) : [];
    
    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Option không chọn nhóm cha (tạo nhóm cha mới) */}
          <button
            onClick={() => {
              setSelectedParentId('');
              setIsParentCategory(true);
              setCurrentView('add-category');
            }}
            className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${
              selectedParentId === ''
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg">➕</span>
            </div>
            <div className="text-left">
              <p className="font-medium">Tạo nhóm cha mới</p>
              <p className="text-sm text-gray-500">Không thuộc nhóm nào</p>
            </div>
          </button>

          {/* Danh sách nhóm cha hiện có */}
          {parentCategories.map((parent) => (
            <button
              key={parent.id}
              onClick={() => {
                setSelectedParentId(parent.id);
                setIsParentCategory(false);
                setCurrentView('add-category');
              }}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${
                selectedParentId === parent.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: parent.color + '20' }}
              >
                <span className="text-lg">{getCategoryIcon(parent.icon)}</span>
              </div>
              <div className="text-left">
                <p className="font-medium">{parent.name}</p>
                <p className="text-sm text-gray-500">Tạo mục con</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to get category icons
  const getCategoryIcon = (icon: string): string => {
    return icon || '💰';
  };

  const renderCategorySelection = () => (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300 min-h-0">
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                <span className="text-xl">{getCategoryIcon(category.icon)}</span>
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
                    ? getCategoryIcon(getAllCategories().find(c => c.id === formData.category)?.icon || '')
                    : '≡'}
                </span>
              </div>
              <span className="text-gray-500">
                {formData.category 
                  ? getAllCategories().find(c => c.id === formData.category)?.name 
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
          />
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200 pointer-events-none">
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-gray-600" />
                <span className="text-gray-900">{formatDate(formData.date)}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
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
      case 'icon-picker': return renderIconPicker();
      case 'parent-category-picker': return renderParentCategoryPicker();
      default: return renderMainForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16 animate-in fade-in duration-200" 
         style={{ 
           touchAction: 'none',
           overscrollBehavior: 'none'
         }}>
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out" 
           style={{ 
             touchAction: 'auto'
           }}>
        {renderHeader()}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
}
