import PrivateLayout from "@/subdomains/dashboard/layout/PrivateLayout";
import { CardList } from "@/subdomains/dashboard/pages/cards/components/CardList";
import { useDashboardPreferences } from "@/subdomains/dashboard/context/dashboard-preferences";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { WalletsOverview } from "@/subdomains/dashboard/pages/wallets/components/WalletsOverview";

function WalletsPageBody() {
    const { layoutMode } = useDashboardPreferences();
    const isMobile = useIsMobile();
    const isNotionDesktop = layoutMode === "notion" && !isMobile;

    return (
        <div
            className={cn(
                "container mx-auto mt-8 mb-20 md:mb-28 px-4 md:px-6",
                isNotionDesktop ? "max-w-screen-2xl" : "max-w-5xl"
            )}
        >
            <div className="space-y-8">
                <CardList />
                <WalletsOverview />
            </div>
        </div>
    );
}

const WalletsPage = () => {
    return (
        <PrivateLayout>
            <WalletsPageBody />
        </PrivateLayout>
    );
};

export default WalletsPage;
