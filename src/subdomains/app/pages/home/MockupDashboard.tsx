import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Target,
    Wallet,
    User,
    DollarSign,
    MoreVertical,
    ChevronDown,
    Monitor,
    Smartphone,
    Languages,
    Moon
} from 'lucide-react';

interface MockupDashboardProps {
    device: 'desktop' | 'mobile';
    tab: 'dashboard' | 'transactions' | 'incomes' | 'expenses';
    onTabChange: (tab: any) => void;
}

const MockupDashboard: React.FC<MockupDashboardProps> = ({ device, tab, onTabChange }) => {
    const isDesktop = device === 'desktop';

    const transactions = [
        { name: 'Freelancer', category: 'Salary', date: 'Feb 9', value: '+ $1,500', isIncome: true }
    ];

    const stats = [
        { label: 'Total Balance', value: '$ 1,500', trend: '+ 100.00% compared to last month', icon: Wallet, color: 'text-emerald-500', border: 'border-emerald-500/20' },
        { label: 'Total Revenue', value: '$ 1,500', trend: '+ 100.00% compared to last month', icon: TrendingUp, color: 'text-emerald-500', border: 'border-emerald-500/20' },
        { label: 'Total Expenses', value: '$ 0.00', trend: '+ 0.00% compared to last month', icon: TrendingDown, color: 'text-rose-500', border: 'border-rose-500/20' },
    ];

    return (
        <div className={`relative overflow-hidden bg-background text-foreground ${isDesktop ? 'rounded-2xl aspect-[16/10]' : 'rounded-[3rem] border-[8px] border-zinc-900 dark:border-zinc-800 aspect-[9/19]'} transition-all duration-500 shadow-2xl border border-border`}>
            <div className="absolute inset-0 flex flex-col overflow-hidden select-none">
                {isDesktop ? (
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <aside className="w-64 border-r border-border bg-card/50 flex flex-col p-4">
                            <div className="flex items-center gap-2 px-2 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                </div>
                                <span className="font-bold text-lg text-foreground italic">Meu Troco</span>
                                <Languages className="w-4 h-4 ml-auto text-muted-foreground" />
                                <Moon className="w-4 h-4 text-muted-foreground" />
                            </div>

                            <nav className="flex-1 space-y-1">
                                {[
                                    { id: 'dashboard', label: 'Home', icon: Home },
                                    { id: 'transactions', label: 'Transactions', icon: BarChart3 },
                                    { id: 'incomes', label: 'Incomes', icon: TrendingUp },
                                    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onTabChange(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${tab === item.id ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-auto pt-4 border-t border-border flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-xs text-white shadow-lg">JD</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">John Doe</p>
                                    <p className="text-[10px] text-muted-foreground truncate">john.doe@gmail.com</p>
                                </div>
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 flex flex-col p-8 overflow-y-auto bg-gradient-to-br from-background via-background to-secondary/10">
                            <header className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                                    <Calendar className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                                    <p className="text-sm text-muted-foreground font-medium">February 2026</p>
                                </div>
                            </header>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                                {stats.map((stat, i) => (
                                    <div key={i} className={`p-6 rounded-2xl bg-card border ${stat.border} relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow`}>
                                        <stat.icon className={`absolute top-4 right-4 w-5 h-5 ${stat.color} opacity-30`} />
                                        <p className="text-xs text-muted-foreground font-medium mb-2">{stat.label}</p>
                                        <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                                        <p className={`text-[10px] font-semibold ${stat.color}`}>{stat.trend}</p>
                                    </div>
                                ))}
                            </div>

                            <section className="bg-card border border-border rounded-2xl overflow-hidden p-6 shadow-sm">
                                <h4 className="font-semibold text-foreground mb-6">Recent Transactions</h4>
                                <div className="space-y-4">
                                    {transactions.map((tr, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{tr.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-bold text-white shadow-sm">{tr.category}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium">{tr.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-sm font-bold ${tr.isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{tr.value}</span>
                                                <MoreVertical className="w-4 h-4 text-muted-foreground/50" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </main>
                    </div>
                ) : (
                    /* Mobile Mockup */
                    <div className="flex flex-col h-full bg-background">
                        <div className="pt-12 px-6 pb-6 bg-gradient-to-b from-secondary/20 to-transparent">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="w-6 h-6 text-emerald-500" />
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                                    <p className="text-xs text-muted-foreground font-medium">February 2026</p>
                                </div>
                            </div>

                            <div className="space-y-4 overflow-y-auto pb-24">
                                {stats.map((stat, i) => (
                                    <div key={i} className={`p-6 rounded-2xl bg-card border ${stat.border} relative overflow-hidden shadow-sm`}>
                                        <stat.icon className={`absolute top-4 right-4 w-5 h-5 ${stat.color} opacity-30`} />
                                        <p className="text-xs text-muted-foreground font-medium mb-2">{stat.label}</p>
                                        <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                                        <p className={`text-[10px] font-semibold ${stat.color}`}>{stat.trend}</p>
                                    </div>
                                ))}

                                <div className="mt-8">
                                    <h4 className="font-semibold text-foreground mb-4 px-2">Recent Transactions</h4>
                                    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                                        {transactions.map((tr, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{tr.name}</p>
                                                        <span className="text-[10px] text-muted-foreground font-medium">{tr.date}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-bold ${tr.isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{tr.value}</span>
                                                    <MoreVertical className="w-4 h-4 text-muted-foreground/50" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Nav Mobile */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] bg-card/90 backdrop-blur-xl border border-border rounded-2xl px-6 py-3 flex justify-between items-center shadow-2xl">
                            {[
                                { id: 'dashboard', icon: Home, label: 'Home' },
                                { id: 'incomes', icon: TrendingUp, label: 'Incomes' },
                                { id: 'expenses', icon: TrendingDown, label: 'Expenses' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className={`flex flex-col items-center gap-1 transition-all ${tab === item.id ? 'text-emerald-500 scale-110' : 'text-muted-foreground/60'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[8px] font-semibold">{item.label}</span>
                                </button>
                            ))}
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30">
                                <User className="w-5 h-5" />
                                <ChevronDown className="w-3 h-3 ml-0.5 opacity-50" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockupDashboard;
