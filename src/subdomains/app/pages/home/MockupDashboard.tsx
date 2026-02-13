import React from 'react';
import {
    Home,
    TrendingUp,
    TrendingDown,
    Wallet,
    User,
    Search,
    Bell,
    PlusCircle,
    MinusCircle,
    ArrowLeftRight,
    Settings
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MockupDashboardProps {
    device: 'desktop' | 'mobile';
    tab: 'dashboard' | 'transactions' | 'incomes' | 'expenses';
    onTabChange: (tab: any) => void;
}

const MockupDashboard: React.FC<MockupDashboardProps> = ({ device, tab, onTabChange }) => {
    const { t } = useTranslation();
    const isDesktop = device === 'desktop';

    const transactions = [
        { name: t('categories.Freelancer'), date: '9 Fev', value: '+ R$ 1.500', isIncome: true }
    ];

    const stats = [
        { label: t('dashboard.cardTotalIncome'), value: 'R$ 1.500', trend: '+100%', icon: TrendingUp, color: 'text-emerald-500', border: 'border-emerald-500/10' },
        { label: t('dashboard.cardTotalExpense'), value: 'R$ 0,00', trend: '+0%', icon: TrendingDown, color: 'text-rose-500', border: 'border-rose-500/10' },
    ];

    const quickActions = [
        { icon: PlusCircle, label: 'Receita', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { icon: MinusCircle, label: 'Despesa', color: 'text-red-500', bg: 'bg-red-500/10' },
        { icon: ArrowLeftRight, label: 'Troca', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    if (isDesktop) {
        return (
            <div className="relative overflow-hidden bg-background text-foreground rounded-2xl aspect-[16/10] transition-all duration-500 shadow-2xl border border-border flex flex-col">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto hide-scrollbar select-none p-8 pb-32">
                    <div className="container mx-auto max-w-6xl space-y-8">
                        {/* Header Desktop */}
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold border-2 border-primary/20 shadow-md">JD</div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t('dashboard.welcomeGreeting')}</p>
                                    <h1 className="text-xl font-bold tracking-tight">John Doe</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-muted-foreground" />
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                <Settings className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Coluna Esquerda */}
                            <div className="space-y-6">
                                {/* Balance Card */}
                                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900/30 p-8 rounded-[2rem] text-white shadow-xl">
                                    <p className="text-sm font-semibold text-emerald-100/80 uppercase tracking-wider mb-2">{t('dashboard.cardTotalTitle')}</p>
                                    <h2 className="text-4xl font-black tracking-tighter">R$ 1.500,00</h2>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-card/30 p-6 rounded-3xl border border-border/40">
                                    <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">{t('dashboard.quickActions')}</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {quickActions.map((action, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <div className={`w-14 h-14 rounded-full ${action.bg} flex items-center justify-center border border-border shadow-sm`}>
                                                    <action.icon className={`w-6 h-6 ${action.color}`} />
                                                </div>
                                                <span className="text-xs font-semibold text-muted-foreground">{action.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    {stats.map((stat, i) => (
                                        <div key={i} className={`p-6 rounded-3xl bg-card border ${stat.border} shadow-sm`}>
                                            <p className="text-xs text-muted-foreground font-medium mb-2">{stat.label}</p>
                                            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                                            <p className={`text-xs font-bold ${stat.color}`}>{stat.trend}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{t('dashboard.balancePositive')}</p>
                                        <p className="text-xs text-muted-foreground">{t('dashboard.insightText')}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-card/50 border border-border/60 rounded-3xl p-6 shadow-sm">
                                    <h4 className="font-bold text-foreground mb-4 flex items-center justify-between">
                                        {t('dashboard.listTitle')}
                                        <span className="text-xs text-primary font-medium">Ver tudo</span>
                                    </h4>
                                    <div className="space-y-4">
                                        {transactions.map((tr, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{tr.name}</p>
                                                        <span className="text-xs text-muted-foreground font-medium">{tr.date}</span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-black text-emerald-500">{tr.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl px-8 py-3 flex gap-8 items-center shadow-xl">
                        <Home className="w-5 h-5 text-emerald-500" />
                        <TrendingUp className="w-5 h-5 text-muted-foreground/50" />
                        <TrendingDown className="w-5 h-5 text-muted-foreground/50" />
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mobile Layout
    return (
        <div className="relative overflow-hidden bg-background text-foreground rounded-[3rem] border-[8px] border-zinc-900 dark:border-zinc-800 aspect-[9/19] transition-all duration-500 shadow-2xl border-border flex flex-col">
            {/* Scrollable Content Mobile */}
            <div className="flex-1 overflow-y-auto hide-scrollbar select-none">
                {/* Header Mobile */}
                <div className="pt-14 px-6 pb-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold border-2 border-primary/20 shadow-md">JD</div>
                        <div className="flex gap-4">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <Settings className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold mb-6 italic">{t('dashboard.welcomeGreeting')} John!</h2>
                </div>

                <div className="px-6 space-y-6 pb-24">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900/30 p-8 rounded-[2rem] text-white shadow-xl">
                        <p className="text-xs font-semibold text-emerald-100/80 uppercase mb-2">{t('dashboard.cardTotalTitle')}</p>
                        <h3 className="text-3xl font-black tracking-tighter">R$ 1.500,00</h3>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                        {quickActions.map((action, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div className={`w-16 h-16 rounded-full ${action.bg} flex items-center justify-center border border-border shadow-sm`}>
                                    <action.icon className={`w-7 h-7 ${action.color}`} />
                                </div>
                                <span className="text-[10px] font-semibold text-muted-foreground">{action.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className={`p-5 rounded-[1.5rem] bg-card border ${stat.border}`}>
                                <p className="text-[10px] text-muted-foreground font-medium mb-1">{stat.label}</p>
                                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                <p className={`text-[10px] font-bold ${stat.color}`}>{stat.trend}</p>
                            </div>
                        ))}
                    </div>

                    {/* Transactions */}
                    <div>
                        <h4 className="font-bold text-foreground mb-4 px-2 tracking-tight">{t('dashboard.listTitle')}</h4>
                        <div className="bg-card border border-border/50 rounded-[2rem] p-6 space-y-5 shadow-sm">
                            {transactions.map((tr, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{tr.name}</p>
                                            <span className="text-[10px] text-muted-foreground font-medium">{tr.date}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-emerald-500">{tr.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Nav Mobile */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-3 flex justify-between items-center shadow-2xl z-20">
                <Home className="w-5 h-5 text-emerald-500" />
                <TrendingUp className="w-5 h-5 text-muted-foreground/50" />
                <TrendingDown className="w-5 h-5 text-muted-foreground/50" />
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30">
                    <User className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

export default MockupDashboard;