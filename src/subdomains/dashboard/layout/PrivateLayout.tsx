/* eslint-disable react-hooks/exhaustive-deps */
import MobileNav from '@/components/MobileNav';
import { useUser } from '@/hooks/use-user';
import useUserStore from '@/store/UserStore';
import { User } from '@/types/entities/User';
import { useGetUserData } from '@/utils/api/auth';
import React from 'react'
import DashboardHeader from '../components/DashboardHeader';

function PrivateLayout({ children }: { children: React.ReactNode }) {
    const { handleAddUser } = useUser();
    const { uid } = useUserStore();
    const { data } = useGetUserData(uid);

    React.useEffect(() => {
        if (uid) {
            handleAddUser(data as User)
        }
    }, [uid, data])

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-950/10 flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/5 bg-background/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 md:px-6">
                    <DashboardHeader />
                </div>
            </header>

            <div className="flex-1 w-full max-w-screen-2xl mx-auto">
                <section className="w-full">
                    {children}
                </section>
            </div>

            {/* Global Navigation (Visible on all screens) */}
            <MobileNav />
        </main>
    );
}

export default PrivateLayout