/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, BarChart3, Settings, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Bank } from '@phosphor-icons/react';
import { useDashboardPreferences } from '@/subdomains/dashboard/context/dashboard-preferences';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const MobileNav = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { layoutMode } = useDashboardPreferences();
  const navRef = useRef<HTMLElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const isNotionDesktop = layoutMode === 'notion';

  const navigation = useMemo((): NavItem[] => {
    const items: NavItem[] = [
      { name: t('sidebar.home'), href: '/dashboard', icon: Home },
      { name: t('sidebar.transactions'), href: '/dashboard/transactions', icon: Bank },
      { name: t('sidebar.bills'), href: '/dashboard/contas', icon: Receipt },
      { name: t('sidebar.wallets'), href: '/dashboard/wallets', icon: CreditCard },
      { name: t('sidebar.reports'), href: '/dashboard/relatorios', icon: BarChart3 },
      { name: t('sidebar.settings'), href: '/dashboard/settings', icon: Settings },
    ];

    if (isNotionDesktop) {
      return items.filter((item) =>
        ['/dashboard', '/dashboard/wallets', '/dashboard/relatorios', '/dashboard/settings'].includes(item.href)
      );
    }

    return items;
  }, [t, isNotionDesktop]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const checkOverflow = () => {
      const overflow = nav.scrollWidth > nav.clientWidth;
      setHasOverflow(overflow);
      if (overflow) nav.scrollLeft = 0;
    };

    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
      <nav
        ref={navRef}
        className={cn(
          "mobile-nav-scroll max-w-screen-xl mx-auto overflow-x-auto overflow-y-hidden flex items-center px-2 py-2 scroll-smooth",
          hasOverflow ? "justify-start" : "justify-around"
        )}
      >
        <div className="inline-flex w-full flex-nowrap items-center justify-around gap-1 min-w-max px-1">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-shrink-0 flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 min-w-[4.5rem]",
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:bg-accent/10"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "scale-105")} />
                <span className="text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap text-center leading-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileNav;
