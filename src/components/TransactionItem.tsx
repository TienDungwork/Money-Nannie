'use client';

import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isIncome ? 'bg-success-50' : 'bg-danger-50'}`}>
            {isIncome ? (
              <ArrowUpCircle className="w-5 h-5 text-success-600" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-danger-600" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
            <p className="text-sm text-gray-500">{transaction.category}</p>
            <p className="text-xs text-gray-400">{formatRelativeDate(transaction.date)}</p>
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
