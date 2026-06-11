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
import { useAccountStatus } from '@/hooks/use-account-status';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
    const { isReadOnly } = useAccountStatus();
    const { t } = useTranslation();

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
                {isReadOnly && (
                    <div className="mx-auto mt-4 px-4 md:px-6">
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-3">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <span>{t('account.blocked.banner', 'Sua conta está bloqueada para alterações. Você pode consultar seus dados, mas não pode criar ou editar informações.')}</span>
                        </div>
                    </div>
                )}
                <section className="w-full">
                    {children}
                </section>
            </div>

            <MobileNav />
        </main>
    );
}

export default PrivateLayout