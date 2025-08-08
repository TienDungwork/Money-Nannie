'use client';

import React, { useState } from 'react';
import { Category, Wallet } from '@/types';
import { CategoryManager } from './CategoryManager';
import { ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';

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
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  
  const [walletFormData, setWalletFormData] = useState({
    name: '',
    balance: 0,
    type: 'cash' as 'cash' | 'bank' | 'credit' | 'savings',
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
      color: '#3b82f6',
      icon: 'Wallet'
    });
    setEditingWallet(null);
    setShowWalletForm(false);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setWalletFormData({
      name: wallet.name,
      balance: wallet.balance,
      type: wallet.type,
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

  const getWalletIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      Wallet: '👛',
      CreditCard: '💳',
      DollarSign: '💲',
      Banknote: '💵',
      PiggyBank: '🐷'
    };
    return iconMap[icon] || '👛';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Cài đặt</h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('wallets')}
            className={`flex-1 py-3 px-4 text-center border-b-2 ${
              activeTab === 'wallets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Ví
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 text-center border-b-2 ${
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
            <button
              onClick={() => setShowWalletForm(true)}
              className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
              Thêm ví mới
            </button>

            {/* Wallets List */}
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: wallet.color + '30' }}
                      >
                        {getWalletIcon(wallet.icon)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{wallet.name}</h3>
                        <p className="text-sm text-gray-500">{formatCurrency(wallet.balance)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditWallet(wallet)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteWallet(wallet.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Add Category Button */}
            <button
              onClick={() => setShowCategoryManager(true)}
              className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
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
                      <span className="text-lg">{category.icon}</span>
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
                      <span className="text-lg">{category.icon}</span>
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
            </div>
          </div>
        )}
      </div>

      {/* Wallet Form Modal */}
      {showWalletForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingWallet ? 'Sửa ví' : 'Thêm ví mới'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên ví
                </label>
                <input
                  type="text"
                  value={walletFormData.name}
                  onChange={(e) => setWalletFormData({ ...walletFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên ví"
                />
              </div>

              {!editingWallet && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số dư ban đầu
                  </label>
                  <input
                    type="number"
                    value={walletFormData.balance}
                    onChange={(e) => setWalletFormData({ ...walletFormData, balance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại ví
                </label>
                <select
                  value={walletFormData.type}
                  onChange={(e) => setWalletFormData({ ...walletFormData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank">Ngân hàng</option>
                  <option value="credit">Thẻ tín dụng</option>
                  <option value="savings">Tiết kiệm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu sắc
                </label>
                <input
                  type="color"
                  value={walletFormData.color}
                  onChange={(e) => setWalletFormData({ ...walletFormData, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowWalletForm(false);
                  setEditingWallet(null);
                  setWalletFormData({
                    name: '',
                    balance: 0,
                    type: 'cash',
                    color: '#3b82f6',
                    icon: 'Wallet'
                  });
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveWallet}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingWallet ? 'Cập nhật' : 'Thêm'}
              </button>
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
