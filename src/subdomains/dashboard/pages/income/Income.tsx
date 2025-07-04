
import React from 'react';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { useFinanceData } from '@/hooks/useFinanceData';
import { TrendingUp } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';

const IncomePage = () => {
  const { transactions } = useFinanceData();
  const incomeTransactions = transactions.filter(t => t.type === 'income');

  return (
    <PrivateLayout>
      <div className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold">Receitas</h1>
            <p className="text-muted-foreground">Gerencie suas fontes de renda</p>
          </div>
        </div>

        {/* Add Income Form */}
        <TransactionForm type="income" />

        {/* Income History */}
        <TransactionList
          transactions={incomeTransactions}
          title="Histórico de Receitas"
          showAll={true}
        />
      </div>
    </PrivateLayout>
  );
};

export default IncomePage;
