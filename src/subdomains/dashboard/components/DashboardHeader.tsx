import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/use-user';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LayoutModeToggle from '@/components/LayoutModeToggle';
import NotificationsTrigger from '@/subdomains/dashboard/components/notifications/NotificationsTrigger';
import UserRankBadge from '@/components/UserRankBadge';

const DashboardHeader = () => {
    const { user, handleLogout } = useUser();
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between py-4 px-2 md:px-0">
            <Link to="/dashboard/profile" className="flex items-center gap-3 group transition-transform active:scale-95">
                <Avatar className="h-12 w-12 border-2 border-primary/20 transition-all group-hover:border-primary/50 group-hover:shadow-md">
                    <AvatarImage src={user?.details?.avatar} alt={user?.displayName} className='object-cover'/>
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.displayName?.charAt(0) ?? '?'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('dashboard.welcomeGreeting')}</p>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight group-hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-none">{user?.displayName ?? '...'}</h1>
                    <UserRankBadge />
                </div>
            </Link>

            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <NotificationsTrigger />
                <ThemeToggle />
                <LanguageSwitcher />
                <LayoutModeToggle />
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    asChild
                    aria-label={t('sidebar.settings')}
                >
                    <Link to="/dashboard/settings">
                        <Settings className="w-5 h-5" />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                    onClick={handleLogout}
                    aria-label={t('sidebar.logout')}
                >
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default DashboardHeader;
