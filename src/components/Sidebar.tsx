
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, User, LogOut, DollarSign, Crown, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from '@radix-ui/react-select';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import AvatarTrigger from './AvatarTrigger';
import { BankIcon } from '@phosphor-icons/react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const AppSidebar = () => {
  const [open, setOpen] = React.useState(false);
  const { theme } = useTheme();
  const { user, handleLogout } = useUser();
  const { t } = useTranslation()

  const navigation = [
    { name: t('sidebar.home'), href: '/dashboard', icon: Home },
    { name: t('sidebar.transactions'), href: "/dashboard/transactions", icon: BankIcon },
    { name: t('sidebar.income'), href: '/dashboard/income', icon: TrendingUp },
    { name: t('sidebar.expenses'), href: '/dashboard/expenses', icon: TrendingDown },
    // { name: 'Premium', href: '/pricing', icon: Crown },
    // { name: 'Pagamentos', href: '/payments', icon: CreditCard },    
  ];

  return (
    <Sidebar variant='floating'>
      <div className={cn("flex flex-col h-full", theme == "dark" && "bg-gradient-to-br from-green-900/45 via-zinc-900/50 to-zinc-950/70 rounded")}>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <span className="font-bold">Meu Troco</span>
            </div>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary hover:text-secondary-foreground",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground",
                      (item.name === 'Premium' || item.name === 'Pagamentos') && "text-primary hover:bg-primary/10"
                    )
                  }
                >
                  <item.icon className={cn("h-4 w-4", (item.name === 'Premium' || item.name === 'Pagamentos') && "text-primary")} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger>
              <AvatarTrigger open={open} user={user} canChange={false} />
            </DropdownMenuTrigger>

            <DropdownMenuContent className='flex flex-1 flex-col w-52'>
              <NavLink
                to="/dashboard/profile"
                className=" group w-full hover:bg-secondary hover:text-secondary-foregroundflex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                <DropdownMenuItem className='flex items-center gap-2'>
                  <User className="h-4 w-4 group-hover:text-secondary-foreground transition-all" />
                  <span className='group-hover:text-secondary-foreground transition-all'>{t('sidebar.profile')}</span>
                </DropdownMenuItem>
              </NavLink>

              <Separator className="h-[1px] bg-muted mx-2" />

              <NavLink
                to="/"
                className=" group w-full hover:bg-secondary hover:text-secondary-foregroundflex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"
                onClick={handleLogout}
              >

                <DropdownMenuItem className='flex items-center gap-2'>
                  <LogOut className="h-4 w-4 group-hover:text-secondary-foreground transition-all" />
                  <span className='group-hover:text-secondary-foreground transition-all'>{t('sidebar.logout')}</span>
                </DropdownMenuItem>
              </NavLink>

            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </div>
    </Sidebar >
  );
};

export default AppSidebar;
