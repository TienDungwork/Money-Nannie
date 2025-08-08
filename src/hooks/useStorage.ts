'use client';

import { useState, useEffect } from 'react';
import { Transaction, Category, Wallet } from '@/types';
import { storageService } from '@/lib/storage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = () => {
      try {
        const savedTransactions = storageService.getTransactions();
        setTransactions(savedTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
    storageService.initializeDefaultData();
  }, []);

  const addTransaction = (transaction: Transaction) => {
    try {
      storageService.addTransaction(transaction);
      setTransactions(prev => [transaction, ...prev]);
      
      // Update wallet balance if wallet is specified
      if (transaction.walletId) {
        const wallets = storageService.getWallets();
        const wallet = wallets.find(w => w.id === transaction.walletId);
        if (wallet) {
          const balanceChange = transaction.type === 'income' 
            ? transaction.amount 
            : -transaction.amount;
          storageService.updateWallet(wallet.id, {
            balance: wallet.balance + balanceChange
          });
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = (id: string, updatedData: Partial<Transaction>) => {
    try {
      const oldTransaction = transactions.find(t => t.id === id);
      if (!oldTransaction) return;

      // Revert old wallet balance change
      if (oldTransaction.walletId) {
        const wallets = storageService.getWallets();
        const wallet = wallets.find(w => w.id === oldTransaction.walletId);
        if (wallet) {
          const oldBalanceChange = oldTransaction.type === 'income' 
            ? -oldTransaction.amount 
            : oldTransaction.amount;
          storageService.updateWallet(wallet.id, {
            balance: wallet.balance + oldBalanceChange
          });
        }
      }

      storageService.updateTransaction(id, updatedData);
      const newTransaction = { ...oldTransaction, ...updatedData };
      setTransactions(prev => 
        prev.map(t => t.id === id ? newTransaction : t)
      );

      // Apply new wallet balance change
      if (newTransaction.walletId) {
        const wallets = storageService.getWallets();
        const wallet = wallets.find(w => w.id === newTransaction.walletId);
        if (wallet) {
          const newBalanceChange = newTransaction.type === 'income' 
            ? newTransaction.amount 
            : -newTransaction.amount;
          storageService.updateWallet(wallet.id, {
            balance: wallet.balance + newBalanceChange
          });
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;

      // Revert wallet balance change
      if (transaction.walletId) {
        const wallets = storageService.getWallets();
        const wallet = wallets.find(w => w.id === transaction.walletId);
        if (wallet) {
          const balanceChange = transaction.type === 'income' 
            ? -transaction.amount 
            : transaction.amount;
          storageService.updateWallet(wallet.id, {
            balance: wallet.balance + balanceChange
          });
        }
      }

      storageService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = () => {
      try {
        const savedCategories = storageService.getCategories();
        setCategories(savedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  return { categories };
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallets = () => {
      try {
        const savedWallets = storageService.getWallets();
        setWallets(savedWallets);
      } catch (error) {
        console.error('Error loading wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWallets();
  }, []);

  const addWallet = (wallet: Omit<Wallet, 'id' | 'createdAt'>) => {
    try {
      const newWallet = storageService.addWallet(wallet);
      setWallets(prev => [...prev, newWallet]);
      return newWallet;
    } catch (error) {
      console.error('Error adding wallet:', error);
      return null;
    }
  };

  const updateWallet = (id: string, updatedData: Partial<Wallet>) => {
    try {
      storageService.updateWallet(id, updatedData);
      setWallets(prev => 
        prev.map(w => w.id === id ? { ...w, ...updatedData } : w)
      );
    } catch (error) {
      console.error('Error updating wallet:', error);
    }
  };

  const deleteWallet = (id: string) => {
    try {
      storageService.deleteWallet(id);
      setWallets(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };

  return {
    wallets,
    loading,
    addWallet,
    updateWallet,
    deleteWallet,
  };
}
