
import TransactionForm from '@/components/TransactionForm';
import PrivateLayout from '../../layout/PrivateLayout';
import { useTranslation } from 'react-i18next';

const ExpensesPage = () => {  
  const { t } = useTranslation();
  return (
    <PrivateLayout>      
      <TransactionForm type="despesa" />
    </PrivateLayout>
  );
};

export default ExpensesPage;
