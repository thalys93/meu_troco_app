import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile'
import useUserStore from '@/store/UserStore';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import BackOfficeSidebar from '../components/BackOfficeSidebar';
import BackOfficeMobileNav from '../components/BackOfficeMobileNav';
import BackOfficeHeader from '../components/BackOfficeHeader';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user } = useUserStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user.accountType !== AccountTypes.ADMIN) navigate("/backoffice/login");
  }, [user])

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
            <div className="flex-1 p-6">
              {children}
            </div>
          </main>
        </div>

        {isMobile && <BackOfficeMobileNav />}
      </SidebarProvider>
    </div>
  )
}

export default PrivateLayout