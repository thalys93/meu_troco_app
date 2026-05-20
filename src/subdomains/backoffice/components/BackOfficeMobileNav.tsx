/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Home, User, Moon, ShoppingBag, Bell, Tags, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from 'react-i18next';

const BackOfficeMobileNav = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const {setTheme, theme} = useTheme()
  const {user , handleLogout} = useUser()
  const {t} = useTranslation();

  const navigation = [
    { name: t('sidebar.home'), href: '/backoffice/home', icon: Home },
    { name: t('sidebar.plans'), href: '/backoffice/plans', icon: ShoppingBag },
    { name: t('sidebar.notifications'), href: '/backoffice/notifications', icon: Bell },
    { name: t('sidebar.categories'), href: '/backoffice/categories', icon: Tags },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.05)] px-2 py-2 md:hidden">
      <nav className="flex justify-around items-center">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              {item.name}
            </Link>
          );
        })}

        <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button className='flex flex-row items-center'>
              <User className="w-5 h-5" />              
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>{user?.displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <NavLink to="/backoffice/profile">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                <span>{t('sidebar.profile')}</span>
              </DropdownMenuItem>
            </NavLink>
            
            <DropdownMenuItem onClick={(e) => {e.preventDefault(), setTheme(theme === 'light' ? 'dark' : 'light')}}>
              <Moon className="w-4 h-4 mr-2" />
              <span>{t('default.darkmode')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <DoorOpen className="w-4 h-4 mr-2" />
              <span>{t('sidebar.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
};

export default BackOfficeMobileNav;
