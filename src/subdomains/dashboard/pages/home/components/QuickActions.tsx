import React, { useMemo } from 'react';
import { PlusCircle, MinusCircle, BarChart3, Wallet, Send, ArrowLeftRight, Scale3D } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bank } from '@phosphor-icons/react';

const QuickActions = () => {
    const { t } = useTranslation();

    const actions = useMemo(() => [
        {
            icon: PlusCircle,
            label: t('dashboard.actions.receipt'),
            href: '/dashboard/income',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            disabled: false,
        },
        {
            icon: MinusCircle,
            label: t('dashboard.actions.expense'),
            href: '/dashboard/expenses',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            disabled: false,
        },        
        {
            icon: Bank,
            label: t('sidebar.transactions'),
            href: '/dashboard/transactions',
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            disabled: false,
        },
        {
            icon: Wallet,
            label: t('dashboard.actions.wallets'),
            href: '/dashboard/wallets',
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            disabled: false,
        },
        {
            icon: Scale3D,
            label: t('dashboard.actions.converter'),
            href: '/dashboard/converter',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            disabled: false,
        },
        {
            icon: BarChart3,
            label: t('dashboard.actions.reports'),
            href: '#',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            disabled: true,
        },
    ], [t]);

    return (
        <div className="overflow-x-scroll overflow-y-hidden py-2 px-2 snap-x snap-mandatory">
            <div className="inline-flex flex-nowrap gap-7 my-3 min-w-max">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.href}
                        className="flex flex-col items-center gap-3 group flex-shrink-0 snap-start"
                        {...(action.disabled && { disabled: true })}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 shadow-sm border border-border/50",
                            action.bg,
                            action.disabled && 'opacity-50 cursor-not-allowed'
                        )}>
                            <action.icon className={cn("w-7 h-7", action.color)} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
