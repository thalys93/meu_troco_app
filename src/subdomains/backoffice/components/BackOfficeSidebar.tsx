import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, LogOut, ShoppingBag, Bell, Tags, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@radix-ui/react-select';
import { useUser } from '@/hooks/use-user';
import AvatarTrigger from '@/components/AvatarTrigger';
import { BuildingOfficeIcon } from '@phosphor-icons/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';

const AppSidebar = () => {
  const [open, setOpen] = React.useState(false);
  const { user, handleLogout } = useUser();
  const { t } = useTranslation();

  const navigation = [
    { name: t('sidebar.home'), href: '/backoffice/home', icon: Home },
    { name: t('sidebar.plans'), href: '/backoffice/plans', icon: ShoppingBag },
    { name: t('sidebar.notifications'), href: '/backoffice/notifications', icon: Bell },
    { name: t('sidebar.categories'), href: '/backoffice/categories', icon: Tags },
  ];

  return (
    <Sidebar variant="floating" className="bg-sidebar border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2">
          <BuildingOfficeIcon className="w-6 h-6 text-primary" aria-hidden />
          <span className="font-bold text-sidebar-foreground">Meu Troco Backoffice</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder={t('sidebar.searchPlaceholder')}
              className="pl-8 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm"
              readOnly
              aria-label={t('sidebar.searchPlaceholder')}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3">
            {t('sidebar.mainMenu')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{item.name}</span>
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-sidebar-accent focus:ring-2 focus:ring-sidebar-ring"
              aria-expanded={open}
              aria-haspopup="true"
            >
              <AvatarTrigger open={open} user={user} canChange={false} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="start" side="top">
            <NavLink
              to="/backoffice/profile"
              className="group w-full"
              onClick={() => setOpen(false)}
            >
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" aria-hidden />
                <span>{t('sidebar.profile')}</span>
              </DropdownMenuItem>
            </NavLink>
            <Separator className="my-1" />
            <NavLink to="/" onClick={handleLogout} className="group w-full">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" aria-hidden />
                <span>{t('sidebar.logout')}</span>
              </DropdownMenuItem>
            </NavLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
