import { Transaction, MonthlyStats, CategoryStats } from '@/types';
import { 
  formatCurrency as formatCurrencyHelper,
  formatDate as formatDateHelper,
  formatDetailedDate as formatDetailedDateHelper,
  formatRelativeDate as formatRelativeDateHelper
} from './helpers';

// Re-export centralized helpers for backward compatibility
export const formatCurrency = formatCurrencyHelper;
export const formatDate = formatDateHelper;
export const formatDetailedDate = formatDetailedDateHelper;
export const formatRelativeDate = formatRelativeDateHelper;

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    return transaction.type === 'income' 
      ? balance + transaction.amount 
      : balance - transaction.amount;
  }, 0);
}

export function calculateTotalByType(transactions: Transaction[], type: 'income' | 'expense'): number {
  return transactions
    .filter(t => t.type === type)
    .reduce((total, t) => total + t.amount, 0);
}

export function getMonthlyStats(transactions: Transaction[]): MonthlyStats[] {
  const monthlyData: { [key: string]: MonthlyStats } = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      };
    }
    
    const stats = monthlyData[monthKey];
    stats.transactionCount++;
    
    if (transaction.type === 'income') {
      stats.totalIncome += transaction.amount;
    } else {
      stats.totalExpense += transaction.amount;
    }
    
    stats.balance = stats.totalIncome - stats.totalExpense;
  });
  
  return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
}

export function getCategoryStats(transactions: Transaction[], type: 'income' | 'expense'): CategoryStats[] {
  const categoryTotals: { [key: string]: number } = {};
  const categoryColors: { [key: string]: string } = {};
  
  const filteredTransactions = transactions.filter(t => t.type === type);
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  filteredTransactions.forEach(transaction => {
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = 0;
    }
    categoryTotals[transaction.category] += transaction.amount;
  });
  
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);
}

function getCategoryColor(categoryName: string): string {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

export function filterTransactionsByDateRange(
  transactions: Transaction[], 
  startDate: string, 
  endDate: string
): Transaction[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
}

export function groupTransactionsByDate(transactions: Transaction[]): { [date: string]: Transaction[] } {
  return transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as { [date: string]: Transaction[] });
}
