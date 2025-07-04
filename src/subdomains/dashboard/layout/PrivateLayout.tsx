import MobileNav from '@/components/MobileNav';
import AppSidebar from '@/components/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react'

function PrivateLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile()
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-950/10">
            <SidebarProvider>
                <div className="flex flex-row w-full">
                    {!isMobile && <AppSidebar />}
                    <section className="flex flex-row w-full">
                        {!isMobile && <SidebarTrigger className="transition-all md:m-5 rounded" />}
                        {children}
                    </section>
                </div>

                {isMobile && <MobileNav />}
            </SidebarProvider>
        </main>
    );
}

export default PrivateLayout