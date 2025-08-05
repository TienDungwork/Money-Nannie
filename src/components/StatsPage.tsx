'use client';

import React from 'react';
import { Transaction } from '@/types';
import { getCategoryStats } from '@/lib/utils';

interface StatsPageProps {
  transactions: Transaction[];
}

export function StatsPage({ transactions }: StatsPageProps) {
  const expenseStats = getCategoryStats(transactions, 'expense');
  const incomeStats = getCategoryStats(transactions, 'income');

  const StatsList = ({ 
    title, 
    stats, 
    color 
  }: { 
    title: string; 
    stats: ReturnType<typeof getCategoryStats>; 
    color: string; 
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      {stats.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stat.category}</span>
                  <span className="text-sm text-gray-500">
                    {stat.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <span className="text-sm font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(stat.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Thống kê</h2>
      
      <StatsList 
        title="Chi tiêu theo danh mục" 
        stats={expenseStats} 
        color="bg-danger-500" 
      />
      
      <StatsList 
        title="Thu nhập theo danh mục" 
        stats={incomeStats} 
        color="bg-success-500" 
      />
    </div>
  );
}
