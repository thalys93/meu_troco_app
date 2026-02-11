import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Bell, Settings, User, Moon, DoorOpen, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useUserStore from '@/store/UserStore';
import { Link, NavLink } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useUser } from '@/hooks/use-user';
import { BankIcon } from '@phosphor-icons/react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const DashboardHeader = () => {
    const { user, handleLogout } = useUser();
    const { setTheme, theme } = useTheme();
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between py-4 px-2 md:px-0">
            <Link to="/dashboard/profile" className="flex items-center gap-3 group transition-transform active:scale-95">
                <Avatar className="h-12 w-12 border-2 border-primary/20 transition-all group-hover:border-primary/50 group-hover:shadow-md">
                    <AvatarImage src={user?.details?.avatar} alt={user?.displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.displayName?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('dashboard.welcomeGreeting')}</p>
                    <h1 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{user?.displayName}</h1>
                </div>
            </Link>

            <div className="flex items-center gap-1 md:gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 transition-all active:scale-90">
                    <Search className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 transition-all active:scale-90 relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                </Button>

                <ThemeToggle className='text-muted-foreground' />

                <LanguageSwitcher className='text-muted-foreground' />

                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 transition-all active:scale-90">
                            <Settings className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 border-border/50 backdrop-blur-lg">
                        <NavLink to="/dashboard/profile">
                            <DropdownMenuItem className="rounded-xl cursor-pointer">
                                <User className="w-4 h-4 mr-2" />
                                <span className="font-medium">{t('sidebar.profile')}</span>
                            </DropdownMenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/transactions">
                            <DropdownMenuItem className="rounded-xl cursor-pointer">
                                <BankIcon className="w-4 h-4 mr-2" />
                                <span className="font-medium">{t('sidebar.transactions')}</span>
                            </DropdownMenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/settings">
                            <DropdownMenuItem className="rounded-xl cursor-pointer">
                                <Settings2 className="w-4 h-4 mr-2" />
                                <span className="font-medium">{t('sidebar.settings')}</span>
                            </DropdownMenuItem>
                        </NavLink>

                        <DropdownMenuSeparator className="bg-border/50" />

                        <DropdownMenuItem
                            className="rounded-xl cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            <DoorOpen className="w-4 h-4 mr-2" />
                            <span className="font-medium">{t('sidebar.logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default DashboardHeader;
