import React, { useMemo } from 'react';
import TransactionList from '@/components/TransactionList';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/api/transation';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import CarouselWithThumbs, { imagesProps } from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import BalanceCard from '../../components/BalanceCard';
import QuickActions from '../../components/QuickActions';
import StatCard from '@/components/StatCard';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import useUserStore from '@/store/UserStore';
import { firebaseTimestampToDate } from '@/utils/helpers/getFirebaseDate';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const { data: transactions = [], isLoading } = useUserTransactions();
  const {
    expensePercentage,
    formatCurrency,
    incomePercentage,
    totalBalance,
    totalExpense,
    totalIncome,
    isBalancePositive,
    isIncomePositive,
    isExpensePositive
  } = useDashboardStats()

  const { user } = useUserStore();
  const { t } = useTranslation();

  const createdAt = user?.details?.createdAt;
  const userCreatedDate = createdAt ? firebaseTimestampToDate(createdAt) : null;
  const isNew = userCreatedDate ? userCreatedDate.toDateString() === new Date().toDateString() : false;

  const images: imagesProps[] = [
    { image: "/gifs/adding_expenses.gif", description: t('sidebar.expenses') },
    { image: "/gifs/adding_incomes.gif", description: t('sidebar.income') },
    { image: "/gifs/saving_avatar.gif", description: t('sidebar.profile') }
  ]

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

  const bannerStyles = useMemo(() => {
    if (totalBalance < 0) {
      return {
        container: "bg-rose-500/5 border-rose-500/10",
        iconContainer: "bg-rose-500/10 text-rose-500",
      };
    }
    if (totalBalance < 50) {
      return {
        container: "bg-amber-500/5 border-amber-500/10",
        iconContainer: "bg-amber-500/10 text-amber-500",
      };
    }
    return {
      container: "bg-emerald-500/5 border-emerald-500/10",
      iconContainer: "bg-emerald-500/10 text-emerald-500",
    };
  }, [totalBalance]);

  return (
    <PrivateLayout>
      {isNew && (
        <Dialog>
          <DialogContent>
            <div>
              <DialogTitle>{t('dashboard.welcomeTitle')}</DialogTitle>
              <DialogDescription>
                <span>{t('dashboard.welcomeDescription')}</span>
              </DialogDescription>
            </div>
            <CarouselWithThumbs images={images} />
            <div className='flex justify-end items-end'>
              <DialogClose>
                <Button><span>{t('dashboard.welcomeUnderstand')}</span></Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <motion.div
        className="container mx-auto max-w-5xl mt-8 mb-20 md:mt-12 md:mb-12 px-4 md:px-6 space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <BalanceCard
                balance={totalBalance}
                formatCurrency={formatCurrency}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="bg-card/30 p-4 rounded-3xl border border-border/40">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">{t('dashboard.quickActions')}</h3>
              <QuickActions />
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-4 h-full"
          >
            <StatCard
              title={t('dashboard.cardTotalIncome')}
              value={formatCurrency(totalIncome)}
              icon={TrendingUp}
              trend={`${isIncomePositive ? "+" : "-"}${incomePercentage.toFixed(1)}%`}
              trendDirection="up"
              className="border-emerald-500/10 shadow-none hover:shadow-sm"
            />
            <StatCard
              title={t('dashboard.cardTotalExpense')}
              value={formatCurrency(totalExpense)}
              icon={TrendingDown}
              trend={`${isExpensePositive ? "+" : "-"}${expensePercentage.toFixed(1)}%`}
              trendDirection="down"
              className="border-red-500/10 shadow-none hover:shadow-sm"
            />
            <div className={cn(
              "col-span-2 hidden md:flex items-center justify-between p-6 rounded-3xl border transition-colors duration-500",
              bannerStyles.container
            )}>
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl transition-colors duration-500", bannerStyles.iconContainer)}>
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">{totalBalance >= 0 ? t('dashboard.balancePositive') : t('dashboard.balanceWarning')}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.insightText')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="pt-4 pb-20 md:pb-0">
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            title={t('dashboard.listTitle')}
          />
        </motion.div>
      </motion.div>
    </PrivateLayout>
  );
};

export default DashboardPage;
