
import React from 'react';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { useFinanceData } from '@/hooks/useFinanceData';
import { TrendingDown } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/api/transation';

const ExpensesPage = () => {
  const {data: transactions, isLoading} = useUserTransactions()
  const expenseTransactions = transactions?.filter(t => t?.type === 'despesa');
  const transactionsList = expenseTransactions  

  return (
    <PrivateLayout>
      <div className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-red-400" />
          <div>
            <h1 className="text-3xl font-bold">Despesas</h1>
            <p className="text-muted-foreground">Controle seus gastos</p>
          </div>
        </div>

        {/* Add Expense Form */}
        <TransactionForm type="despesa" />

        {/* Expense History */}
        <TransactionList
          transactions={transactionsList}
          title="Histórico de Despesas"
          isLoading={isLoading}
          showAll={true}
        />
      </div>
    </PrivateLayout>
  );
};

export default ExpensesPage;
