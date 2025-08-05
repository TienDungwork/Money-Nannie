'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types';
import { TransactionItem } from '@/components/TransactionItem';
import { formatCurrency, calculateBalance, calculateTotalByType, formatDate } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface TransactionsPageProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

type TimePeriod = 'previous' | 'current' | 'future';

export function TransactionsPage({ transactions, onEdit, onDelete }: TransactionsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('current');

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
    return { balance, transactions: periodTransactions };
  };

  const { balance, transactions: filteredTransactions } = getDisplayData();

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

  // Group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    transactions.forEach(transaction => {
      const dateKey = transaction.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with balance */}
      <div className="bg-white p-4 shadow-sm">
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm">Số dư</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(calculateBalance(transactions))}
          </p>
        </div>
        
        {/* Account selector */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">💳</span>
          </div>
          <span className="font-medium">Tiền mặt</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {(['previous', 'current', 'future'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>
      </div>

      {/* Period Summary */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Số dư đầu</p>
            <p className="font-medium">0 ₫</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Số dư cuối</p>
            <p className="font-bold">{formatCurrency(balance)}</p>
          </div>
        </div>
        
        {selectedPeriod === 'current' && (
          <div className="text-center mt-3">
            <p className="text-green-600 text-sm font-medium">
              Xem báo cáo cho giai đoạn này
            </p>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="p-4 space-y-4">
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">Không có giao dịch nào trong {getPeriodLabel(selectedPeriod).toLowerCase()}</p>
          </div>
        ) : (
          sortedDates.map(date => {
            const dayTransactions = groupedTransactions[date];
            const dayTotal = dayTransactions.reduce((sum, t) => {
              return t.type === 'expense' ? sum - t.amount : sum + t.amount;
            }, 0);
            
            const dateObj = new Date(date);
            const day = dateObj.getDate().toString().padStart(2, '0');
            const monthYear = `tháng ${dateObj.getMonth() + 1} ${dateObj.getFullYear()}`;

            return (
              <div key={date} className="space-y-3">
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{day}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hôm nay</p>
                      <p className="text-xs text-gray-400">{monthYear}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(Math.abs(dayTotal))}
                  </span>
                </div>
                
                {/* Transactions for this date */}
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
