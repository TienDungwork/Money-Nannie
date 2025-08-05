'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types';
import { formatCurrency, calculateBalance, calculateTotalByType, formatDate } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';

interface EnhancedBalanceCardProps {
  transactions: Transaction[];
  onChartTypeChange?: (type: 'expense' | 'income') => void;
}

type TimePeriod = 'previous' | 'current' | 'future';

export function EnhancedBalanceCard({ transactions, onChartTypeChange }: EnhancedBalanceCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('current');
  const [showBalance, setShowBalance] = useState(true);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getPreviousMonth = () => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNextMonth = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  };

  const filterTransactionsByPeriod = (period: TimePeriod) => {
    let targetMonth: string;
    
    switch (period) {
      case 'previous':
        targetMonth = getPreviousMonth();
        break;
      case 'current':
        targetMonth = getCurrentMonth();
        break;
      case 'future':
        targetMonth = getNextMonth();
        break;
      default:
        targetMonth = getCurrentMonth();
    }

    return transactions.filter(t => t.date.startsWith(targetMonth));
  };

  const getDisplayData = () => {
    const periodTransactions = filterTransactionsByPeriod(selectedPeriod);
    const balance = calculateBalance(periodTransactions);
    const totalIncome = calculateTotalByType(periodTransactions, 'income');
    const totalExpense = calculateTotalByType(periodTransactions, 'expense');

    return { balance, totalIncome, totalExpense, count: periodTransactions.length };
  };

  const { balance, totalIncome, totalExpense, count } = getDisplayData();

  const getDaysRemaining = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const remaining = lastDay.getDate() - now.getDate();
    return Math.max(0, remaining);
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'previous':
        return 'THÁNG TRƯỚC';
      case 'current':
        return 'THÁNG NAY';
      case 'future':
        return 'TƯƠNG LAI';
    }
  };

  const formatBalanceDisplay = (amount: number) => {
    if (!showBalance) return '••••••••••';
    return formatCurrency(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Số dư</h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatBalanceDisplay(balance)}
            </p>
            <p className="text-sm text-gray-500">Tổng số dư</p>
          </div>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="flex border-b border-gray-100">
        {(['previous', 'current', 'future'] as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {getPeriodLabel(period)}
          </button>
        ))}
      </div>

      {/* Period Summary */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Số dư đầu</p>
            <p className="font-medium">{formatBalanceDisplay(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Số dư cuối</p>
            <p className="font-bold text-lg">{formatBalanceDisplay(balance)}</p>
          </div>
        </div>

        {selectedPeriod === 'current' && (
          <div className="text-center mb-4">
            <p className="text-green-600 text-sm font-medium">
              Xem báo cáo cho giai đoạn này
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-3">
          <button 
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => onChartTypeChange?.('expense')}
          >
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Tổng đã chi</span>
            </div>
            <span className="font-bold text-red-600">
              {formatBalanceDisplay(totalExpense)}
            </span>
          </button>

          <button 
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => onChartTypeChange?.('income')}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Tổng thu</span>
            </div>
            <span className="font-bold text-blue-600">
              {formatBalanceDisplay(totalIncome)}
            </span>
          </button>

          {selectedPeriod === 'current' && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">Đến cuối tháng</span>
              </div>
              <span className="font-bold text-orange-600">
                {getDaysRemaining()} ngày
              </span>
            </div>
          )}
        </div>

        {/* Transaction Count */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {count} giao dịch trong {getPeriodLabel(selectedPeriod).toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
