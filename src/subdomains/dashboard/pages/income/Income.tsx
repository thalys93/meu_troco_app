
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { TrendingUp } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/api/transation';
import { useTranslation } from 'react-i18next';

const IncomePage = () => {
  const {data: transactions, isLoading} = useUserTransactions()
  const incomeTransactions = transactions?.filter(t => t?.type === 'receita');
  const transactionsList = incomeTransactions
  const {t} = useTranslation();


  return (
    <PrivateLayout>
      <div className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold">{t('sidebar.income')}</h1>
            <p className="text-muted-foreground">{t('incomes.description')}</p>
          </div>
        </div>

        {/* Add Income Form */}
        <TransactionForm type="receita" />

        {/* Income History */}
        <TransactionList
          transactions={transactionsList}
          isLoading={isLoading}
          title={t('transactionList.incomesHistory')}
          limit={5}          
        />
      </div>
    </PrivateLayout>
  );
};

export default IncomePage;
