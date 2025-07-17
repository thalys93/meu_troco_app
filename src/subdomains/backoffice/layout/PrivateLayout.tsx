import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile'
import useUserStore from '@/store/UserStore';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import BackOfficeSidebar from '../components/BackOfficeSidebar';
import BackOfficeMobileNav from '../components/BackOfficeMobileNav';

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user } = useUserStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user.accountType !== AccountTypes.ADMIN) navigate("/backoffice/login");
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-950/10">
      <SidebarProvider>
        <div className="flex flex-row w-full">
          {!isMobile && <BackOfficeSidebar />}
          <section className="flex flex-row w-full">
            {!isMobile && <SidebarTrigger className="transition-all md:m-5 rounded" />}
            {children}
          </section>
        </div>

        {isMobile && <BackOfficeMobileNav />}
      </SidebarProvider>
    </div>
  )
}

export default PrivateLayout