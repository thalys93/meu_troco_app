import { useMemo } from 'react';
import TransactionList from '@/components/TransactionList';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/services/api/transation';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion"
import BalanceCard from './components/BalanceCard';
import QuickActions from './components/QuickActions';
import StatCard from '@/components/StatCard';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDefaultCard } from '@/hooks/useDefaultCard';
import { useDashboardPreferences } from '../../context/dashboard-preferences';
import {
  getMonthRangeByKey,
} from '../../utils/month-range';
import ExpenseByCategoryChart from './components/ExpenseByCategoryChart';
import MonthlyExpenseTrendChart from './components/MonthlyExpenseTrendChart';
import BillsStatusChart from './components/BillsStatusChart';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategories } from '@/hooks/use-categories';
import {
  filterTransactionsByPreferences,
  summarizeIncomeExpense,
} from '../../utils/transaction-filters';

function DashboardHomeBody() {
  const { data: transactions = [], isLoading } = useUserTransactions();
  const {
    formatCurrency,
    totalBalance,
  } = useDashboardStats()

  const { t } = useTranslation();
  useDefaultCard();
  const {
    selectedMonth,
    goToNextMonth,
    goToPreviousMonth,
    resetCurrentMonth,
    layoutMode,
    transactionListFilters
  } = useDashboardPreferences();
  const isMobile = useIsMobile();
  const { categoryLookup } = useCategories();
  const isNotionDesktop = layoutMode === 'notion' && !isMobile;
  const monthRange = useMemo(() => getMonthRangeByKey(selectedMonth), [selectedMonth]);

  const effectiveFilters = useMemo(() => {
    if (!transactionListFilters.dateRangeLockedToMonth) {
      return transactionListFilters;
    }
    return {
      ...transactionListFilters,
      startDate: monthRange.startDate,
      endDate: monthRange.endDate,
    };
  }, [monthRange.endDate, monthRange.startDate, transactionListFilters]);
  const filteredTransactions = useMemo(
    () =>
      filterTransactionsByPreferences(transactions, effectiveFilters, {
        categoryLookup,
      }),
    [categoryLookup, effectiveFilters, transactions]
  );
  const trendFilters = useMemo(
    () => ({
      ...effectiveFilters,
      // O gráfico de tendência precisa varrer os últimos meses completos.
      startDate: "",
      endDate: "",
      dateRangeLockedToMonth: false,
    }),
    [effectiveFilters]
  );
  const trendTransactions = useMemo(
    () =>
      filterTransactionsByPreferences(transactions, trendFilters, {
        categoryLookup,
      }),
    [categoryLookup, transactions, trendFilters]
  );
  const summary = useMemo(
    () => summarizeIncomeExpense(filteredTransactions),
    [filteredTransactions]
  );
  const billsChartTransactions = useMemo(
    () =>
      filterTransactionsByPreferences(transactions, {
        ...effectiveFilters,
        type: "conta",
      }, { categoryLookup }),
    [categoryLookup, effectiveFilters, transactions]
  );

  const monthIncome = useMemo(
    () => summary.incomeTotal,
    [summary.incomeTotal]
  );
  const monthExpense = useMemo(
    () => summary.expenseTotal,
    [summary.expenseTotal]
  );
  const monthTotal = monthIncome + monthExpense;
  const monthIncomePercentage = monthTotal > 0 ? (monthIncome / monthTotal) * 100 : 0;
  const monthExpensePercentage = monthTotal > 0 ? (monthExpense / monthTotal) * 100 : 0;
  const monthNet = monthIncome - monthExpense;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const bannerInsightValue = isNotionDesktop ? monthNet : totalBalance;

  const bannerStyles = useMemo(() => {
    if (bannerInsightValue < 0) {
      return {
        container: "bg-rose-500/5 border-rose-500/10",
        iconContainer: "bg-rose-500/10 text-rose-500",
      };
    }
    if (bannerInsightValue < 50) {
      return {
        container: "bg-amber-500/5 border-amber-500/10",
        iconContainer: "bg-amber-500/10 text-amber-500",
      };
    }
    return {
      container: "bg-emerald-500/5 border-emerald-500/10",
      iconContainer: "bg-emerald-500/10 text-emerald-500",
    };
  }, [bannerInsightValue]);

  return (
    <motion.div
      className={cn(
        "container mx-auto mt-6 md:mt-3 mb-16 md:mb-12 px-4 md:px-6 space-y-6 md:space-y-8",
        isNotionDesktop ? "max-w-screen-2xl" : "max-w-5xl"
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {isNotionDesktop ? (
        <>
          <motion.div variants={itemVariants} className="pt-2 pb-2">
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              scrollClassName={
                isNotionDesktop
                  ? "h-[min(58vh,620px)] md:h-[min(60vh,660px)] min-h-[300px] max-h-[400px]"
                  : "max-h-[min(58vh,620px)] md:max-h-[min(60vh,660px)] overflow-auto"
              }
              title={t('dashboard.listTitle')}
              selectedMonth={selectedMonth}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onResetCurrentMonth={resetCurrentMonth}
              variant="table"
              formatCurrency={formatCurrency}
              showQuickAdd
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            <ExpenseByCategoryChart transactions={filteredTransactions} />
            <MonthlyExpenseTrendChart
              transactions={trendTransactions}
              selectedMonth={selectedMonth}
            />
            <BillsStatusChart transactions={billsChartTransactions} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start pb-16"
          >
            <div className="space-y-6">
              <BalanceCard
                balance={totalBalance}
                formatCurrency={formatCurrency}
                scope="month"
                monthTransactions={filteredTransactions}
              />
              <div className={cn(
                "hidden md:flex items-center justify-between p-4 md:p-6 rounded-3xl border transition-colors duration-500",
                bannerStyles.container
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl transition-colors duration-500", bannerStyles.iconContainer)}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{bannerInsightValue >= 0 ? t('dashboard.balancePositive') : t('dashboard.balanceWarning')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.insightTextMonth')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/30 p-3 sm:p-4 rounded-3xl border border-border/40 overflow-hidden">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">{t('dashboard.quickActions')}</h3>
              <QuickActions />
            </div>
          </motion.div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                  <BalanceCard
                    balance={totalBalance}
                    formatCurrency={formatCurrency}
                    scope="month"
                    monthTransactions={filteredTransactions}
                  />
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card/30 p-3 sm:p-4 rounded-3xl border border-border/40 overflow-hidden">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">{t('dashboard.quickActions')}</h3>
                <QuickActions />
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full items-stretch auto-rows-[minmax(0,1fr)]"
            >
              <StatCard
                title={t('dashboard.cardTotalIncome')}
                value={formatCurrency(monthIncome)}
                icon={TrendingUp}
                trend={`${monthIncome > 0 ? "+" : "-"}${monthIncomePercentage.toFixed(1)}%`}
                trendDirection="up"
                className="h-full border-emerald-500/10 shadow-none hover:shadow-sm"
              />
              <StatCard
                title={t('dashboard.cardTotalExpense')}
                value={formatCurrency(monthExpense)}
                icon={TrendingDown}
                trend={`${monthExpense > 0 ? "+" : "-"}${monthExpensePercentage.toFixed(1)}%`}
                trendDirection="down"
                className="h-full border-red-500/10 shadow-none hover:shadow-sm"
              />
              <div className={cn(
                "col-span-2 hidden md:flex items-center justify-between p-4 md:p-6 rounded-3xl border transition-colors duration-500",
                bannerStyles.container
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl transition-colors duration-500", bannerStyles.iconContainer)}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{bannerInsightValue >= 0 ? t('dashboard.balancePositive') : t('dashboard.balanceWarning')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.insightText')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ExpenseByCategoryChart transactions={filteredTransactions} />
            <MonthlyExpenseTrendChart
              transactions={trendTransactions}
              selectedMonth={selectedMonth}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <BillsStatusChart transactions={billsChartTransactions} />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4 pb-16">
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              title={t('dashboard.listTitle')}
              selectedMonth={selectedMonth}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onResetCurrentMonth={resetCurrentMonth}
              variant="list"
              formatCurrency={formatCurrency}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

const DashboardPage = () => {
  return (
    <PrivateLayout>
      <DashboardHomeBody />
    </PrivateLayout>
  );
};

export default DashboardPage;
