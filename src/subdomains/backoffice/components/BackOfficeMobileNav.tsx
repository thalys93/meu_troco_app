import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Moon, User, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from 'react-i18next';
import { BACKOFFICE_NAV_ITEMS, flattenBackofficeNav } from '../config/backoffice-nav';

const BackOfficeMobileNav = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const { setTheme, theme } = useTheme();
  const { user, handleLogout } = useUser();
  const { t } = useTranslation();

  const mobileNav = flattenBackofficeNav(BACKOFFICE_NAV_ITEMS).slice(0, 4);
  const moreNav = flattenBackofficeNav(BACKOFFICE_NAV_ITEMS).slice(4);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-1 py-2 md:hidden">
      <nav className="flex justify-around items-center mobile-nav-scroll overflow-x-auto">
        {mobileNav.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors shrink-0',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              {t(item.labelKey)}
            </Link>
          );
        })}

        <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex flex-col h-auto gap-0.5 px-3 py-1.5 shrink-0">
              <User className="w-5 h-5" />
              <span className="text-[10px]">{t('sidebar.more')}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top">
            <DropdownMenuLabel>{user?.displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {moreNav.map((item) => (
              <NavLink key={item.href} to={item.href ?? '#'} onClick={() => setOpen(false)}>
                <DropdownMenuItem>
                  <item.icon className="w-4 h-4 mr-2" />
                  <span>{t(item.labelKey)}</span>
                </DropdownMenuItem>
              </NavLink>
            ))}
            <NavLink to="/backoffice/profile" onClick={() => setOpen(false)}>
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                <span>{t('sidebar.profile')}</span>
              </DropdownMenuItem>
            </NavLink>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setTheme(theme === 'light' ? 'dark' : 'light');
              }}
            >
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
