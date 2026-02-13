
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
      <div className="container mx-auto mt-8 mb-20 md:mt-12 md:mb-12 px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-red-400" />
          <div>
            <h1 className="text-3xl font-bold">{t('sidebar.expenses')}</h1>
            <p className="text-muted-foreground">{t('expenses.description')}</p>
          </div>
        </div>

        {/* Add Expense Form */}
        <TransactionForm type="despesa" />

        {/* Expense History */}
        <TransactionList
          transactions={transactionsList}
          title={t('transactionList.expensesHistory')}
          isLoading={isLoading}
          limit={15}
        />
      </div>
    </PrivateLayout>
  );
};

export default ExpensesPage;
