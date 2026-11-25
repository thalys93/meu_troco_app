import TransactionForm from '@/components/TransactionForm';
import PrivateLayout from '../../layout/PrivateLayout';

const ContasPage = () => {
  return (
    <PrivateLayout>
      <div className="container mx-auto w-full max-w-lg px-4 md:px-6 mt-4 md:mt-0 pb-28 md:pb-10">
        <TransactionForm type="conta" />
      </div>
    </PrivateLayout>
  );
};

export default ContasPage;
