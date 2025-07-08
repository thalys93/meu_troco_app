
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
import { Wallet, TrendingUp, TrendingDown, Calendar, Target, Bell, BarChart3 } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/api/transation';
import { cn } from '@/lib/utils';
import { useDashboardStats } from '@/hooks/use-dashboard';

const DashboardPage = () => {
  const { data: transactions = [], isLoading } = useUserTransactions();
  const { 
    expensePercentage, 
    formatCurrency, 
    incomePercentage, 
    totalBalance, 
    totalExpense, 
    totalIncome, 
    totalBalancePercentage, 
    isBalancePositive, 
    isExpensePositive, 
    isIncomePositive 
  } = useDashboardStats()    


  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <PrivateLayout>
      <div className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">{getCurrentMonth()}</p>
          </div>
        </div>

        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", isLoading && "animate-pulse")}>
          <StatCard
            title="Saldo Total"
            value={formatCurrency(totalBalance)}
            icon={Wallet}
            trend={totalBalance > 0 ? `${isBalancePositive ? "+" : "-"}${totalBalancePercentage.toFixed(2)}% em relação ao mês passado` : ""}
            trendDirection={totalBalance > 0 ? 'up' : 'down'}
            className={totalBalance >= 0 ? "border-emerald-500/20" : "border-red-500/20"}
          />

          <StatCard
            title="Total de Receitas"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            trend={`${isIncomePositive ? "+" : "-"}${incomePercentage.toFixed(2)}% em relação ao mês passado`}
            trendDirection="up"
            className="border-emerald-500/20"
          />

          <StatCard
            title="Total de Despesas"
            value={formatCurrency(totalExpense)}
            icon={TrendingDown}
            trend={`${isExpensePositive ? "+" : "-"}${expensePercentage.toFixed(2)}% em relação ao mês passado`}
            trendDirection="down"
            className="border-red-500/20"
          />
        </div>

        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          title="Transações Recentes"
        />
      </div>
    </PrivateLayout>
  );
};

export default DashboardPage;
