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
      
      // Update wallet balance
      if (transaction.walletId.trim() !== '') {
        const wallets = storageService.getWallets();
        const wallet = wallets.find(w => w.id === transaction.walletId);
        if (wallet) {
          const balanceChange = transaction.type === 'income' 
            ? transaction.amount 
            : -transaction.amount;
          
          const newBalance = wallet.balance + balanceChange;
          storageService.updateWallet(wallet.id, {
            balance: newBalance
          });
          
          // Trigger a storage event to notify other hooks
          window.dispatchEvent(new CustomEvent('walletUpdated', { 
            detail: { 
              walletId: wallet.id,
              newBalance: newBalance,
              action: 'transaction_added'
            } 
          }));
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

      // Get wallets once to avoid conflicts
      const wallets = storageService.getWallets();
      
      // Revert old wallet balance change
      if (oldTransaction.walletId.trim() !== '') {
        const oldWallet = wallets.find(w => w.id === oldTransaction.walletId);
        if (oldWallet) {
          const oldBalanceChange = oldTransaction.type === 'income' 
            ? -oldTransaction.amount 
            : oldTransaction.amount;
          oldWallet.balance += oldBalanceChange;
        }
      }

      // Prepare new transaction
      const newTransaction = { ...oldTransaction, ...updatedData };
      
      // Apply new wallet balance change
      if (newTransaction.walletId.trim() !== '') {
        const newWallet = wallets.find(w => w.id === newTransaction.walletId);
        if (newWallet) {
          const newBalanceChange = newTransaction.type === 'income' 
            ? newTransaction.amount 
            : -newTransaction.amount;
          newWallet.balance += newBalanceChange;
        }
      }

      // Save all changes
      storageService.updateTransaction(id, updatedData);
      storageService.saveWallets(wallets);
      
      // Trigger wallet update event
      window.dispatchEvent(new CustomEvent('walletUpdated', { 
        detail: { walletId: oldTransaction.walletId || newTransaction.walletId } 
      }));
      
      setTransactions(prev => 
        prev.map(t => t.id === id ? newTransaction : t)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;

      // Revert wallet balance change
      if (transaction.walletId.trim() !== '') {
        const wallets = storageService.getWallets();
        const wallet = wallets.find(w => w.id === transaction.walletId);
        if (wallet) {
          const balanceChange = transaction.type === 'income' 
            ? -transaction.amount 
            : transaction.amount;
          storageService.updateWallet(wallet.id, {
            balance: wallet.balance + balanceChange
          });
          
          // Trigger wallet update event
          window.dispatchEvent(new CustomEvent('walletUpdated', { 
            detail: { walletId: transaction.walletId } 
          }));
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
        // Đảm bảo initialize default data trước
        storageService.initializeDefaultData();
        const savedCategories = storageService.getCategories();
        console.log('Loaded categories:', savedCategories);
        setCategories(savedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const addCategory = (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = storageService.addCategory(category);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  };

  const updateCategory = (id: string, updatedData: Partial<Category>) => {
    try {
      storageService.updateCategory(id, updatedData);
      setCategories(prev => 
        prev.map(c => c.id === id ? { ...c, ...updatedData } : c)
      );
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = (id: string) => {
    try {
      storageService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return { 
    categories, 
    addCategory,
    updateCategory,
    deleteCategory
  };
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWallets = () => {
    try {
      const savedWallets = storageService.getWallets();
      setWallets(savedWallets);
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  useEffect(() => {
    loadWallets();
    setLoading(false);
    
    // Listen for wallet updates from transactions
    const handleWalletUpdate = () => {
      loadWallets();
    };
    
    window.addEventListener('walletUpdated', handleWalletUpdate);
    
    return () => {
      window.removeEventListener('walletUpdated', handleWalletUpdate);
    };
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
