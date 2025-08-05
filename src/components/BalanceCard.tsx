'use client';

import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, calculateBalance, calculateTotalByType } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BalanceCardProps {
  transactions: Transaction[];
}

export function BalanceCard({ transactions }: BalanceCardProps) {
  const balance = calculateBalance(transactions);
  const totalIncome = calculateTotalByType(transactions, 'income');
  const totalExpense = calculateTotalByType(transactions, 'expense');

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
      <div className="text-center mb-6">
        <p className="text-primary-100 text-sm mb-2">Số dư hiện tại</p>
        <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={20} className="text-success-300" />
            <span className="text-sm text-primary-100">Thu nhập</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown size={20} className="text-danger-300" />
            <span className="text-sm text-primary-100">Chi tiêu</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
}
