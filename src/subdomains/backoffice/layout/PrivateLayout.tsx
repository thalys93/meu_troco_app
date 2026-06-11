import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile'
import React from 'react'
import BackOfficeSidebar from '../components/BackOfficeSidebar';
import BackOfficeMobileNav from '../components/BackOfficeMobileNav';
import BackOfficeHeader from '../components/BackOfficeHeader';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen backoffice-page">
      <SidebarProvider>
        <div className="flex flex-row w-full min-h-screen">
          {!isMobile && <BackOfficeSidebar />}
          <main className="flex-1 flex flex-col min-w-0">
            {!isMobile && (
              <div className="flex items-center gap-2 shrink-0">
                <SidebarTrigger className="transition-all m-4 rounded-md shrink-0" />
                <BackOfficeHeader />
              </div>
            )}
            <div className="flex-1 p-4 sm:p-6 pb-24 md:pb-6">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </div>
          </main>
        </div>

        {isMobile && <BackOfficeMobileNav />}
      </SidebarProvider>
    </div>
  )
}

export default PrivateLayout