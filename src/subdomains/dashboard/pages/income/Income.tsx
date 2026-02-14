
import TransactionForm from '@/components/TransactionForm';
import PrivateLayout from '../../layout/PrivateLayout';
import { useTranslation } from 'react-i18next';

const IncomePage = () => {
  const { t } = useTranslation();


  return (
    <PrivateLayout>
      <TransactionForm type="receita" />
    </PrivateLayout>
  );
};

export default IncomePage;
