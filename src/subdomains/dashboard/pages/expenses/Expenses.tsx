
import React from 'react';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { useFinanceData } from '@/hooks/useFinanceData';
import { TrendingDown } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';

const ExpensesPage = () => {
  const { transactions } = useFinanceData();
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

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
        <TransactionForm type="expense" />

        {/* Expense History */}
        <TransactionList
          transactions={expenseTransactions}
          title="Histórico de Despesas"
          showAll={true}
        />
      </div>
    </PrivateLayout>
  );
};

export default ExpensesPage;
