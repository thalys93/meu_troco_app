/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Bank } from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const MobileNav = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const isMobile = useIsMobile();

  const navigation = useMemo((): NavItem[] => {
    const items: (NavItem | null)[] = [
      { name: t('sidebar.home'), href: '/dashboard', icon: Home },
      { name: t('sidebar.income'), href: '/dashboard/income', icon: TrendingUp },
      { name: t('sidebar.expenses'), href: '/dashboard/expenses', icon: TrendingDown },
      { name: t('dashboard.actions.wallets'), href: '/dashboard/wallets', icon: Wallet },
      isMobile ? { name: t('sidebar.transactions'), href: '/dashboard/transactions', icon: Bank } : null,
    ];
    return items.filter((item): item is NavItem => item !== null);
  }, [t, isMobile]);

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
          "mobile-nav-scroll max-w-screen-xl mx-auto overflow-x-auto overflow-y-hidden flex items-center px-4 py-3 scroll-smooth",
          hasOverflow ? "justify-start" : "justify-center"
        )}
      >
        <div className="inline-flex flex-nowrap items-center gap-8 md:gap-16 min-w-max pl-4 pr-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-shrink-0 flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-300",
                  isActive
                    ? "text-primary bg-primary/5 scale-105"
                    : "text-muted-foreground hover:bg-accent/10"
                )}
              >
                <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileNav;
