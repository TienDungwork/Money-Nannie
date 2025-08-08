'use client';

import React, { useState } from 'react';
import { Wallet } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, ArrowLeft, Wallet as WalletIcon, CreditCard, Building2, PiggyBank, Edit, Trash2 } from 'lucide-react';

interface WalletsPageProps {
  wallets: Wallet[];
  onCreateWallet: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => void;
  onUpdateWallet: (id: string, wallet: Partial<Wallet>) => void;
  onDeleteWallet: (id: string) => void;
  onSelectWallet: (wallet: Wallet) => void;
  onBack: () => void;
}

const walletTypes = [
  {
    type: 'cash' as const,
    name: 'Tiền mặt',
    icon: '💼',
    description: 'Tiền mặt trong túi, ví',
    color: '#10b981'
  },
  {
    type: 'bank' as const,
    name: 'Ngân hàng',
    icon: '🏦',
    description: 'Tài khoản ngân hàng',
    color: '#3b82f6'
  },
  {
    type: 'credit' as const,
    name: 'Thẻ tín dụng',
    icon: '💳',
    description: 'Thẻ tín dụng, thẻ visa',
    color: '#ef4444'
  },
  {
    type: 'savings' as const,
    name: 'Tiết kiệm',
    icon: '🐷',
    description: 'Sổ tiết kiệm, quỹ đầu tư',
    color: '#8b5cf6'
  }
];

export function WalletsPage({ wallets, onCreateWallet, onUpdateWallet, onDeleteWallet, onSelectWallet, onBack }: WalletsPageProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedType, setSelectedType] = useState<Wallet['type']>('cash');
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState<string>('');
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const totalBalance = wallets.reduce((total, wallet) => total + wallet.balance, 0);

  const handleCreateWallet = () => {
    const selectedWalletType = walletTypes.find(type => type.type === selectedType);
    if (!selectedWalletType || !walletName.trim()) return;

    onCreateWallet({
      name: walletName.trim(),
      type: selectedType,
      balance: Number(walletBalance) || 0,
      icon: selectedWalletType.icon,
      color: selectedWalletType.color,
      isDefault: wallets.length === 0 // First wallet is default
    });

    // Reset form
    setWalletName('');
    setWalletBalance('');
    setSelectedType('cash');
    setShowCreateForm(false);
  };

  const handleLongPressStart = (wallet: Wallet) => {
    const timer = setTimeout(() => {
      setSelectedWallet(wallet);
      setShowActionSheet(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleEditWallet = () => {
    if (!selectedWallet || !walletName.trim()) return;

    onUpdateWallet(selectedWallet.id, {
      name: walletName.trim(),
      balance: Number(walletBalance) || 0
    });

    setShowEditForm(false);
    setSelectedWallet(null);
    setWalletName('');
    setWalletBalance('');
  };

  const handleDeleteWallet = () => {
    if (!selectedWallet) return;
    
    onDeleteWallet(selectedWallet.id);
    setShowDeleteConfirm(false);
    setSelectedWallet(null);
  };

  const openEditForm = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setWalletName(wallet.name);
    setWalletBalance(wallet.balance.toString());
    setShowEditForm(true);
  };

  const openDeleteConfirm = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowDeleteConfirm(true);
  };

  if (showEditForm && selectedWallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setShowEditForm(false)} className="p-2">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Sửa ví</h1>
            <button
              onClick={() => openDeleteConfirm(selectedWallet)}
              className="p-2 text-red-600"
            >
              Xóa
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Wallet Info */}
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: selectedWallet.color + '30' }}
            >
              <span className="text-3xl">{selectedWallet.icon}</span>
            </div>
            <p className="text-sm text-gray-500 capitalize">
              {walletTypes.find(t => t.type === selectedWallet.type)?.name}
            </p>
          </div>

          {/* Wallet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên ví
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số dư
            </label>
            <input
              type="number"
              value={walletBalance}
              onChange={(e) => setWalletBalance(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="1000"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleEditWallet}
            disabled={!walletName.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setShowCreateForm(false)} className="p-2">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Thêm ví mới</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Wallet Type Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Chọn loại ví</h3>
            <div className="grid grid-cols-2 gap-3">
              {walletTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedType === type.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên ví
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder={`Ví ${walletTypes.find(t => t.type === selectedType)?.name}`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số dư ban đầu
            </label>
            <input
              type="number"
              value={walletBalance}
              onChange={(e) => setWalletBalance(e.target.value)}
              placeholder="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="1000"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateWallet}
            disabled={!walletName.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tạo ví
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Ví của Nannie</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2"
          >
            <Plus size={24} className="text-blue-600" />
          </button>
        </div>
      </div>

      {/* Total Balance */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-500">Tổng cộng</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      {/* Wallets List */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Tính vào tổng
        </h3>
        
        {wallets.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WalletIcon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ví nào</h3>
            <p className="text-gray-500 mb-4">Tạo ví đầu tiên để bắt đầu quản lý tài chính</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Thêm ví mới
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onSelectWallet(wallet)}
                onMouseDown={() => handleLongPressStart(wallet)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(wallet)}
                onTouchEnd={handleLongPressEnd}
                className="w-full bg-white rounded-lg p-4 text-left hover:bg-gray-50 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: wallet.color + '20' }}
                    >
                      <span className="text-xl">{wallet.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {walletTypes.find(t => t.type === wallet.type)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(wallet.balance)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn xóa ví "{selectedWallet.name}"? Hành động này không thể hoàn tác.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-150"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteWallet}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-150"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Sheet */}
      {showActionSheet && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-lg w-full max-w-sm animate-in slide-in-from-bottom duration-300 ease-out">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedWallet.color + '20' }}
                >
                  <span className="text-xl">{selectedWallet.icon}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedWallet.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(selectedWallet.balance)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  openEditForm(selectedWallet);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors duration-150"
              >
                <Edit size={20} className="text-blue-600" />
                <span className="text-gray-900">Sửa ví</span>
              </button>
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  openDeleteConfirm(selectedWallet);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors duration-150"
              >
                <Trash2 size={20} className="text-red-600" />
                <span className="text-red-600">Xóa ví</span>
              </button>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowActionSheet(false)}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-150"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
