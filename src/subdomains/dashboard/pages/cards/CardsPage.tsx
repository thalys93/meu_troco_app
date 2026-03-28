import PrivateLayout from '@/subdomains/dashboard/layout/PrivateLayout';
import { CardList } from './components/CardList';
import { useDashboardPreferences } from '@/subdomains/dashboard/context/dashboard-preferences';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

function CardsPageBody() {
    const { layoutMode } = useDashboardPreferences();
    const isMobile = useIsMobile();
    const isNotionDesktop = layoutMode === 'notion' && !isMobile;

    return (
        <div
            className={cn(
                'container mx-auto mt-8 mb-20 md:mb-28 px-4 md:px-6',
                isNotionDesktop ? 'max-w-screen-2xl' : 'max-w-5xl'
            )}
        >
            <CardList />
        </div>
    );
}

const CardsPage = () => {
    return (
        <PrivateLayout>
            <CardsPageBody />
        </PrivateLayout>
    );
};

export default CardsPage;
