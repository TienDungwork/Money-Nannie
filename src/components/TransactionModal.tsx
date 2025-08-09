import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Category, Wallet } from '@/types';
import { Button } from '@/components/ui/Button';
import { X, ChevronRight, Calendar, ArrowLeft, Check, Delete } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getAllCategories, getParentCategories, getChildCategories, isSampleCategory } from '@/lib/defaultCategories';
import { formatCurrency, formatVietnameseDate, getCategoryIcon, getWalletIcon } from '@/lib/helpers';
import { AVAILABLE_ICONS } from '@/lib/constants';

type NavigationView = 'main' | 'wallet' | 'category' | 'category-type' | 'category-parent' | 'category-child';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  wallets: Wallet[];
  transaction?: Transaction | null;
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

  const amountInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Get category type to determine transaction type
  const selectedCategory = categories.find(cat => cat.id === formData.category);
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
    }
  }, [transaction, isOpen, wallets]);

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

  // Remove duplicate functions - now using centralized helpers

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
                <span className="text-xl">{getWalletIcon(wallet.icon)}</span>
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

  // Remove duplicate getCategoryIcon function - now using centralized helper

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
                    ? getWalletIcon(wallets.find(w => w.id === formData.walletId)?.icon || '') 
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
                    ? getCategoryIcon(categories.find(c => c.id === formData.category)?.icon || '')
                    : '≡'}
                </span>
              </div>
              <span className="text-gray-500">
                {formData.category 
                  ? categories.find(c => c.id === formData.category)?.name 
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
                <span className="text-gray-900">{formatVietnameseDate(formData.date)}</span>
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
