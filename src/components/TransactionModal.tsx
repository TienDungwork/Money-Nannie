'use client';

import React, { useState } from 'react';
import { Transaction, Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  transaction?: Transaction | null;
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categories, 
  transaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    amount: transaction?.amount?.toString() || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      alert('Vui lòng điền số tiền và danh mục');
      return;
    }

    // Tạo mô tả mặc định nếu không nhập
    const defaultDescription = formData.description.trim() || 
      (formData.type === 'expense' ? 'Chi tiêu' : 'Thu nhập');

    const newTransaction: Transaction = {
      id: transaction?.id || uuidv4(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: defaultDescription,
      date: formData.date,
      createdAt: transaction?.createdAt || new Date().toISOString(),
    };

    onSave(newTransaction);
    onClose();
    
    // Reset form if creating new transaction
    if (!transaction) {
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset category when type changes
      ...(field === 'type' && { category: '' })
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {transaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giao dịch
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange('type', 'expense')}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-danger-50 border-danger-500 text-danger-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'income')}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  formData.type === 'income'
                    ? 'bg-success-50 border-success-500 text-success-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Chọn danh mục</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Mô tả giao dịch (tùy chọn)"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1">
              {transaction ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
