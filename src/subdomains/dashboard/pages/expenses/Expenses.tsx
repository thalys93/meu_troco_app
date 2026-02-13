
import React from 'react';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { TrendingDown } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/api/transation';
import { useTranslation } from 'react-i18next';

const ExpensesPage = () => {
  const { data: transactions, isLoading } = useUserTransactions()
  const expenseTransactions = transactions?.filter(t => t?.type === 'despesa');
  const transactionsList = expenseTransactions
  const { t } = useTranslation();

  return (
    <PrivateLayout>      
        <TransactionForm type="despesa" />      
    </PrivateLayout>
  );
};

export default ExpensesPage;
