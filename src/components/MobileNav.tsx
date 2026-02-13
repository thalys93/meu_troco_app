/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const MobileNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('sidebar.home'), href: '/dashboard', icon: Home },
    { name: t('sidebar.income'), href: '/dashboard/income', icon: TrendingUp },
    { name: t('sidebar.expenses'), href: '/dashboard/expenses', icon: TrendingDown },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
      <nav className="max-w-screen-xl mx-auto flex justify-center items-center gap-8 md:gap-16 px-4 py-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-300",
                isActive
                  ? "text-primary bg-primary/5 scale-105"
                  : "text-muted-foreground hover:bg-accent/10"
              )}
            >
              <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;
