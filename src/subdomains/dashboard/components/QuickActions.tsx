import React from 'react';
import { PlusCircle, MinusCircle, BarChart3, Wallet, Send, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const actions = [
    {
        icon: PlusCircle,
        label: 'Receita',
        href: '/dashboard/income',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        icon: MinusCircle,
        label: 'Despesa',
        href: '/dashboard/expenses',
        color: 'text-red-500',
        bg: 'bg-red-500/10'
    },
    {
        icon: ArrowLeftRight,
        label: 'Troca',
        href: '#',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        icon: BarChart3,
        label: 'Relatórios',
        href: '#',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
    {
        icon: Wallet,
        label: 'Cartões',
        href: '#',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    }
];

const QuickActions = () => {
    return (
        <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
            <div className="flex gap-4 md:grid md:grid-cols-5 min-w-max md:min-w-full">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.href}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 shadow-sm border border-border/50",
                            action.bg
                        )}>
                            <action.icon className={cn("w-7 h-7", action.color)} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
