import PrivateLayout from '@/subdomains/dashboard/layout/PrivateLayout';
import { CardList } from './components/CardList';

const CardsPage = () => {
    return (
        <PrivateLayout>
            <div className="container mx-auto max-w-5xl mt-8 mb-20 px-4 md:px-6">
                <CardList />
            </div>
        </PrivateLayout>
    );
};

export default CardsPage;
