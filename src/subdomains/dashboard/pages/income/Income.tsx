
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { TrendingUp } from 'lucide-react';
import PrivateLayout from '../../layout/PrivateLayout';
import { useUserTransactions } from '@/utils/api/transation';
import { useTranslation } from 'react-i18next';

const IncomePage = () => {
  const { data: transactions, isLoading } = useUserTransactions()
  const incomeTransactions = transactions?.filter(t => t?.type === 'receita');
  const transactionsList = incomeTransactions
  const { t } = useTranslation();


  return (
    <PrivateLayout>
        <TransactionForm type="receita" />      
    </PrivateLayout>
  );
};

export default IncomePage;
