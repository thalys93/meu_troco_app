
import { useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 5000,
    description: 'Salary',
    category: 'Job',
    date: '2024-07-01',
    type: 'income'
  },
  {
    id: '2',
    amount: 1200,
    description: 'Rent',
    category: 'Housing',
    date: '2024-07-01',
    type: 'expense'
  },
  {
    id: '3',
    amount: 300,
    description: 'Groceries',
    category: 'Food',
    date: '2024-07-02',
    type: 'expense'
  },
  {
    id: '4',
    amount: 500,
    description: 'Freelance Work',
    category: 'Side Job',
    date: '2024-07-03',
    type: 'income'
  }
];

export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getFinanceSummary = (): FinanceSummary => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      transactions: currentMonthTransactions
    };
  };

  return {
    transactions,
    addTransaction,
    getFinanceSummary
  };
};
