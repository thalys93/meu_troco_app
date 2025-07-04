
import React from 'react';
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
import PremiumFeature from '@/components/PremiumFeature';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Wallet, TrendingUp, TrendingDown, Calendar, Target, Bell, BarChart3 } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';

const DashboardPage = () => {
  const { getFinanceSummary } = useFinanceData();
  const summary = getFinanceSummary();

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // const handleUpgrade = () => {
  //   console.log('Redirect to pricing');
  // };

  return (
    <PrivateLayout>
      <div className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">{getCurrentMonth()}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Saldo Total"
            value={formatCurrency(summary.totalBalance)}
            icon={Wallet}
            trend={summary.totalBalance > 0 ? "+12% em relação ao mês passado" : ""}
            trendDirection={summary.totalBalance > 0 ? 'up' : 'down'}
            className={summary.totalBalance >= 0 ? "border-emerald-500/20" : "border-red-500/20"}
          />

          <StatCard
            title="Total de Receitas"
            value={formatCurrency(summary.totalIncome)}
            icon={TrendingUp}
            trend="+8% em relação ao mês passado"
            trendDirection="up"
            className="border-emerald-500/20"
          />

          <StatCard
            title="Total de Despesas"
            value={formatCurrency(summary.totalExpenses)}
            icon={TrendingDown}
            trend="-3% em relação ao mês passado"
            trendDirection="down"
            className="border-red-500/20"
          />
        </div>

        {/* Premium Features */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumFeature
            title="Metas Financeiras"
            description="Defina e acompanhe suas metas de economia mensais com alertas personalizados."
            icon={<Target className="w-6 h-6" />}
            onUpgrade={handleUpgrade}
          />

          <PremiumFeature
            title="Lembretes Inteligentes"
            description="Receba notificações sobre contas a vencer e objetivos financeiros."
            icon={<Bell className="w-6 h-6" />}
            onUpgrade={handleUpgrade}
          />

          <PremiumFeature
            title="Relatórios Avançados"
            description="Análises detalhadas com gráficos e insights sobre seus hábitos financeiros."
            icon={<BarChart3 className="w-6 h-6" />}
            onUpgrade={handleUpgrade}
          />
        </div> */}

        {/* Recent Transactions */}
        <TransactionList
          transactions={summary.transactions}
          title="Transações Recentes"
        />
      </div>
    </PrivateLayout>
  );
};

export default DashboardPage;
