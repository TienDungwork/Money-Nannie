'use client';

import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatDetailedDate } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit } from 'lucide-react';
import { defaultCategories } from '@/lib/storage';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  
  // Tìm category theo ID
  const category = defaultCategories.find(cat => cat.id === transaction.category);
  const categoryName = category?.name || transaction.category;
  const categoryIcon = category?.icon || '📦';

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
            {(transaction as any).withPerson && (
              <p className="text-xs text-blue-600">Với {(transaction as any).withPerson}</p>
            )}
            {(transaction as any).note && (
              <p className="text-xs text-gray-400 mt-1">{(transaction as any).note}</p>
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
