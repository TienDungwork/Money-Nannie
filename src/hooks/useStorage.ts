'use client';

import { useState, useEffect } from 'react';
import { Transaction, Category } from '@/types';
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
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = (id: string, updatedData: Partial<Transaction>) => {
    try {
      storageService.updateTransaction(id, updatedData);
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updatedData } : t)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = (id: string) => {
    try {
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
