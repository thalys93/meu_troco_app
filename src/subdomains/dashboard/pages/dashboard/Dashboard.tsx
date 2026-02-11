import TransactionList from '@/components/TransactionList';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/api/transation';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import CarouselWithThumbs, { imagesProps } from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import DashboardHeader from '../../components/DashboardHeader';
import BalanceCard from '../../components/BalanceCard';
import QuickActions from '../../components/QuickActions';
import StatCard from '@/components/StatCard';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import useUserStore from '@/store/UserStore';
import { firebaseTimestampToDate } from '@/utils/helpers/getFirebaseDate';

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
        className="container mx-auto max-w-5xl my-20 md:my-12 px-4 md:px-6 space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <DashboardHeader />
        </motion.div>

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
            <div className="col-span-2 hidden md:flex items-center justify-between p-6 rounded-3xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">{isBalancePositive ? t('dashboard.balancePositive') : t('dashboard.balanceWarning')}</p>
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
