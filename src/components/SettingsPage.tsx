import React, { useState } from 'react';
import { Category, Wallet } from '@/types';
import { CategoryManager } from './CategoryManager';
import { ChevronRight, Plus, Edit, Trash2, ArrowLeft, Check } from 'lucide-react';
import { getAllCategories, getParentCategories, getChildCategories } from '@/lib/defaultCategories';
import { formatCurrency, getWalletIcon, getCategoryIcon } from '@/lib/helpers';

type CategoryView = 'overview' | 'category-type' | 'category-parent' | 'category-child';

interface SettingsPageProps {
  categories: Category[];
  wallets?: Wallet[];
  addCategory?: (category: Omit<Category, 'id'>) => Category | null;
  updateCategory?: (id: string, updatedData: Partial<Category>) => void;
  deleteCategory?: (id: string) => void;
  addWallet?: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => Wallet | null;
  updateWallet?: (id: string, updatedData: Partial<Wallet>) => void;
  deleteWallet?: (id: string) => void;
}

export function SettingsPage({
  categories,
  wallets = [],
  addCategory,
  updateCategory,
  deleteCategory,
  addWallet,
  updateWallet,
  deleteWallet
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'wallets' | 'categories'>('wallets');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [showWalletTypeSelector, setShowWalletTypeSelector] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  
  // Category navigation states
  const [categoryView, setCategoryView] = useState<CategoryView>('overview');
  const [selectedCategoryType, setSelectedCategoryType] = useState<'expense' | 'income' | 'loan' | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null);
  
  const [walletFormData, setWalletFormData] = useState({
    name: '',
    balance: 0,
    type: 'cash' as 'cash' | 'bank' | 'credit' | 'savings',
    typeName: 'Tiền mặt',
    color: '#3b82f6',
    icon: 'Wallet'
  });

  const handleSaveWallet = () => {
    if (!walletFormData.name.trim()) return;

    if (editingWallet) {
      if (updateWallet) {
        updateWallet(editingWallet.id, {
          name: walletFormData.name.trim(),
          type: walletFormData.type,
          color: walletFormData.color,
          icon: walletFormData.icon
        });
      }
    } else {
      if (addWallet) {
        addWallet({
          name: walletFormData.name.trim(),
          balance: walletFormData.balance,
          type: walletFormData.type,
          color: walletFormData.color,
          icon: walletFormData.icon,
          isDefault: false
        });
      }
    }

    setWalletFormData({
      name: '',
      balance: 0,
      type: 'cash',
      typeName: 'Tiền mặt',
      color: '#3b82f6',
      icon: 'Wallet'
    });
    setEditingWallet(null);
    setShowWalletForm(false);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    const getTypeName = (type: string) => {
      switch (type) {
        case 'cash': return 'Tiền mặt';
        case 'bank': return 'Ngân hàng';
        case 'credit': return 'Thẻ tín dụng';
        case 'savings': return 'Tiết kiệm';
        default: return 'Tiền mặt';
      }
    };
    setWalletFormData({
      name: wallet.name,
      balance: wallet.balance,
      type: wallet.type,
      typeName: getTypeName(wallet.type),
      color: wallet.color,
      icon: wallet.icon
    });
    setShowWalletForm(true);
  };

  const handleDeleteWallet = (walletId: string) => {
    if (confirm('Bạn có chắc muốn xóa ví này?')) {
      if (deleteWallet) {
        deleteWallet(walletId);
      }
    }
  };

  // Remove duplicate functions - now using centralized helpers

  // Category navigation functions
  const renderCategoryTypeSelection = () => (
    <div className="space-y-4">
      <div
        onClick={() => {
          setSelectedCategoryType('expense');
          setCategoryView('category-parent');
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
          setCategoryView('category-parent');
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
          setCategoryView('category-parent');
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
  );

  const renderCategoryParentSelection = () => {
    if (!selectedCategoryType) return null;
    
    const parentCategories = getParentCategories(selectedCategoryType, categories);
    
    return (
      <div className="space-y-2">
        {parentCategories.map((category) => {
          const hasChildren = getChildCategories(category.id, categories).length > 0;
          
          return (
            <div key={category.id}>
              <div
                onClick={() => {
                  if (hasChildren) {
                    setSelectedParentCategory(category);
                    setCategoryView('category-child');
                  }
                }}
                className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-colors duration-200 ${
                  hasChildren ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
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
                {hasChildren && <ChevronRight size={16} className="text-gray-400" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCategoryChildSelection = () => {
    if (!selectedParentCategory) return null;
    
    const childCategories = getChildCategories(selectedParentCategory.id, categories);
    
    return (
      <div className="space-y-2">
        {childCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
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
          </div>
        ))}
      </div>
    );
  };

  const getCategoryViewTitle = () => {
    switch (categoryView) {
      case 'overview': return 'Nhóm';
      case 'category-type': return 'Chọn loại giao dịch';
      case 'category-parent': return selectedCategoryType === 'expense' ? 'Khoản chi' : 
                                   selectedCategoryType === 'income' ? 'Khoản thu' : 'Vay/Nợ';
      case 'category-child': return selectedParentCategory?.name || 'Chọn danh mục';
      default: return 'Nhóm';
    }
  };

  // Sử dụng getAllCategories để kết hợp sample và user categories
  const allCategories = getAllCategories(categories);
  const expenseCategories = allCategories.filter(cat => cat.type === 'expense');
  const incomeCategories = allCategories.filter(cat => cat.type === 'income');
  const loanCategories = allCategories.filter(cat => cat.type === 'loan');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('wallets')}
            className={`flex-1 py-4 px-4 text-center border-b-2 font-medium ${
              activeTab === 'wallets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Ví
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-4 px-4 text-center border-b-2 font-medium ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Nhóm
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'wallets' && (
          <div className="space-y-4">
            {/* Add Wallet Button */}
            <div
              onClick={() => setShowWalletForm(true)}
              className="w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-200 shadow-sm"
            >
              <Plus size={20} className="mr-2" />
              <span className="font-medium">Thêm ví mới</span>
            </div>

            {/* Wallets List */}
            <div className="space-y-3">
              {wallets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <p className="text-gray-500 mb-2">Chưa có ví nào</p>
                  <p className="text-sm text-gray-400">Thêm ví đầu tiên để bắt đầu quản lý tài chính</p>
                </div>
              ) : (
                wallets.map((wallet) => (
                  <div key={wallet.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                          style={{ backgroundColor: wallet.color + '20' }}
                        >
                          {getWalletIcon(wallet.icon)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(wallet.balance)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditWallet(wallet)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteWallet(wallet.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Category Navigation Header */}
            <div className="flex items-center justify-between">
              {categoryView !== 'overview' && (
                <button
                  onClick={() => {
                    if (categoryView === 'category-type') setCategoryView('overview');
                    else if (categoryView === 'category-parent') setCategoryView('category-type');
                    else if (categoryView === 'category-child') setCategoryView('category-parent');
                    else setCategoryView('overview');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h3 className="text-lg font-medium text-gray-900">{getCategoryViewTitle()}</h3>
              <div className="w-5" />
            </div>

            {/* Category Content */}
            {categoryView === 'overview' && (
              <>
                {/* Manage Categories Button */}
                <button
                  onClick={() => setShowCategoryManager(true)}
                  className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit size={20} className="mr-2" />
                  Quản lý nhóm
                </button>

                {/* Categories Overview */}
                <div className="space-y-4">
                  {/* Expense Categories */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Khoản chi</h3>
                      <span className="text-sm text-gray-500">{expenseCategories.length} nhóm</span>
                    </div>
                    <div className="space-y-2">
                      {expenseCategories.slice(0, 5).map((category) => (
                        <div key={category.id} className="flex items-center space-x-3">
                          <span className="text-lg">{getCategoryIcon(category.icon)}</span>
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </div>
                      ))}
                      {expenseCategories.length > 5 && (
                        <p className="text-sm text-gray-500 mt-2">
                          +{expenseCategories.length - 5} nhóm khác
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Income Categories */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Khoản thu</h3>
                      <span className="text-sm text-gray-500">{incomeCategories.length} nhóm</span>
                    </div>
                    <div className="space-y-2">
                      {incomeCategories.slice(0, 5).map((category) => (
                        <div key={category.id} className="flex items-center space-x-3">
                          <span className="text-lg">{getCategoryIcon(category.icon)}</span>
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </div>
                      ))}
                      {incomeCategories.length > 5 && (
                        <p className="text-sm text-gray-500 mt-2">
                          +{incomeCategories.length - 5} nhóm khác
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Loan Categories */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Vay/Nợ</h3>
                      <span className="text-sm text-gray-500">{loanCategories.length} nhóm</span>
                    </div>
                    <div className="space-y-2">
                      {loanCategories.slice(0, 5).map((category) => (
                        <div key={category.id} className="flex items-center space-x-3">
                          <span className="text-lg">{getCategoryIcon(category.icon)}</span>
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </div>
                      ))}
                      {loanCategories.length > 5 && (
                        <p className="text-sm text-gray-500 mt-2">
                          +{loanCategories.length - 5} nhóm khác
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {categoryView === 'category-type' && renderCategoryTypeSelection()}
            {categoryView === 'category-parent' && renderCategoryParentSelection()}
            {categoryView === 'category-child' && renderCategoryChildSelection()}
          </div>
        )}
      </div>

      {/* Wallet Form Modal */}
      {showWalletForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowWalletForm(false);
                    setEditingWallet(null);
                    setWalletFormData({
                      name: '',
                      balance: 0,
                      type: 'cash',
                      typeName: 'Tiền mặt',
                      color: '#3b82f6',
                      icon: 'Wallet'
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">
                  {editingWallet ? 'Sửa ví' : 'Thêm ví mới'}
                </h2>
                <div className="w-10" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-4">
              {/* Tên ví */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-white">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: walletFormData.color + '30' }}
                  >
                    {getWalletIcon(walletFormData.icon)}
                  </div>
                  <input
                    type="text"
                    value={walletFormData.name}
                    onChange={(e) => setWalletFormData({ ...walletFormData, name: e.target.value })}
                    placeholder="Tên ví"
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-base"
                    autoFocus
                  />
                </div>
              </div>

              {/* Số dư ban đầu */}
              {!editingWallet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">💰</span>
                      <span className="text-gray-700 font-medium">Số dư ban đầu</span>
                    </div>
                    <input
                      type="number"
                      value={walletFormData.balance}
                      onChange={(e) => setWalletFormData({ ...walletFormData, balance: Number(e.target.value) })}
                      placeholder="0"
                      className="bg-transparent border-none outline-none text-gray-600 text-right"
                    />
                  </div>
                </div>
              )}

              {/* Loại ví */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowWalletTypeSelector(true)}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🏷️</span>
                    <span className="text-gray-700 font-medium">Loại ví</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-sm">{walletFormData.typeName}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </button>
              </div>

              {/* Màu sắc */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🎨</span>
                    <span className="text-gray-700 font-medium">Màu sắc</span>
                  </div>
                  <input
                    type="color"
                    value={walletFormData.color}
                    onChange={(e) => setWalletFormData({ ...walletFormData, color: e.target.value })}
                    className="w-8 h-8 border-none rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowWalletForm(false);
                    setEditingWallet(null);
                    setWalletFormData({
                      name: '',
                      balance: 0,
                      type: 'cash',
                      typeName: 'Tiền mặt',
                      color: '#3b82f6',
                      icon: 'Wallet'
                    });
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveWallet}
                  disabled={!walletFormData.name.trim()}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {editingWallet ? 'Cập nhật' : 'Thêm ví'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Type Selector Modal */}
      {showWalletTypeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowWalletTypeSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">
                  Chọn loại ví
                </h2>
                <div className="w-10" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {[
                  { key: 'cash', name: 'Tiền mặt', icon: '💵', desc: 'Tiền mặt trong ví, túi' },
                  { key: 'bank', name: 'Ngân hàng', icon: '🏦', desc: 'Tài khoản ngân hàng' },
                  { key: 'credit', name: 'Thẻ tín dụng', icon: '💳', desc: 'Thẻ tín dụng' },
                  { key: 'savings', name: 'Tiết kiệm', icon: '🏪', desc: 'Tài khoản tiết kiệm' }
                ].map((type) => (
                  <div
                    key={type.key}
                    onClick={() => {
                      setWalletFormData(prev => ({ 
                        ...prev, 
                        type: type.key as any,
                        typeName: type.name
                      }));
                      setShowWalletTypeSelector(false);
                    }}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      walletFormData.type === type.key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg">{type.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{type.name}</p>
                        <p className="text-sm text-gray-500">{type.desc}</p>
                      </div>
                    </div>
                    {walletFormData.type === type.key && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          isOpen={showCategoryManager}
          categories={categories}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          onClose={() => setShowCategoryManager(false)}
          mode="management"
        />
      )}
    </div>
  );
}
