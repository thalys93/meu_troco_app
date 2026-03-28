/* eslint-disable react-hooks/exhaustive-deps */
import MobileNav from '@/components/MobileNav';
import { useUser } from '@/hooks/use-user';
import useUserStore from '@/store/UserStore';
import { User } from '@/types/entities/User';
import { useGetUserData } from '@/utils/services/api/auth';
import React from 'react'
import DashboardHeader from '../components/DashboardHeader';
import { cn } from '@/lib/utils';
import {
    DashboardPreferencesProvider,
    useDashboardPreferences
} from '../context/dashboard-preferences';

function PrivateLayout({ children }: { children: React.ReactNode }) {
    const { handleAddUser } = useUser();
    const { uid } = useUserStore();
    const { data } = useGetUserData(uid);

    React.useEffect(() => {
        if (uid && data) {
            handleAddUser(data as User);
        }
    }, [uid, data]);

    return (
        <DashboardPreferencesProvider>
            <PrivateLayoutContent>{children}</PrivateLayoutContent>
        </DashboardPreferencesProvider>
    );
}

function PrivateLayoutContent({ children }: { children: React.ReactNode }) {
    const { layoutMode } = useDashboardPreferences();
    const isNotionLayout = layoutMode === 'notion';

    return (
        <main className={cn(
            "min-h-screen bg-gradient-to-br from-background via-background to-emerald-950/10 flex flex-col",
            isNotionLayout && "to-sky-950/10"
        )}>
            <header className="sticky top-0 z-50 w-full border-b border-border/5 bg-background/80 backdrop-blur-md">
                <div className={cn(
                    "mx-auto px-4 md:px-6",
                    isNotionLayout ? "max-w-screen-2xl" : "max-w-5xl"
                )}>
                    <DashboardHeader />
                </div>
            </header>

            <div className={cn(
                "flex-1 w-full mx-auto transition-all duration-300",
                isNotionLayout ? "max-w-screen-2xl" : "max-w-6xl"
            )}>
                <section className="w-full">
                    {children}
                </section>
            </div>

            <MobileNav />
        </main>
    );
}

export default PrivateLayout