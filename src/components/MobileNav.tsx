/* eslint-disable @typescript-eslint/no-unused-expressions */

import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, User, ChevronDown, ChevronUp, Moon, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { BankIcon } from '@phosphor-icons/react';

const MobileNav = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const {setTheme, theme} = useTheme()
  const {user , handleLogout} = useUser()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },    
    { name: 'Receitas', href: '/dashboard/income', icon: TrendingUp },
    { name: 'Despesas', href: '/dashboard/expenses', icon: TrendingDown },        
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border/50 px-4 py-2 md:hidden">
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
              {!open ? <ChevronDown className="text-white ml-auto h-4 w-4 shrink-0 text-muted-foreground" /> :
                <ChevronUp className="text-white ml-auto h-4 w-4 shrink-0 text-muted-foreground" />}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>{user?.displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <NavLink to="/dashboard/profile">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                <span>Perfil</span>
              </DropdownMenuItem>
            </NavLink>

            <NavLink to="/dashboard/transactions">
              <DropdownMenuItem>
                <BankIcon className="w-4 h-4 mr-2" />
                <span>Transações</span>
              </DropdownMenuItem>
            </NavLink>
            <DropdownMenuItem onClick={(e) => {e.preventDefault(), setTheme(theme === 'light' ? 'dark' : 'light')}}>
              <Moon className="w-4 h-4 mr-2" />
              <span>Modo Escuro</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <DoorOpen className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
};

export default MobileNav;
