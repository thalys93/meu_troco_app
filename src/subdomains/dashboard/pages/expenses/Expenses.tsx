
import TransactionForm from '@/components/TransactionForm';
import PrivateLayout from '../../layout/PrivateLayout';
import { useTranslation } from 'react-i18next';

const ExpensesPage = () => {  
  const { t } = useTranslation();
  return (
    <PrivateLayout>      
      <div className='container mx-auto px-4 md:px-6 mt-8 md:-mt-6 pb-24 md:pb-0'>
        <TransactionForm type="despesa" />
      </div>  
    </PrivateLayout>
  );
};

export default ExpensesPage;
