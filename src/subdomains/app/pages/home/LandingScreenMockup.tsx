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
    Settings,
    BarChart3,
    Sparkles,
    Mail,
    ChevronLeft,
    ChevronRight,
    Activity,
    Receipt,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type LandingScreen = 'dashboard' | 'transactions' | 'reports' | 'forecasts' | 'profile';

interface LandingScreenMockupProps {
    screen: LandingScreen;
}

const frameClass =
    'relative overflow-hidden bg-background text-foreground rounded-2xl aspect-[16/10] shadow-2xl border border-border flex flex-col select-none';

function MockHeader() {
    const { t } = useTranslation();
    return (
        <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">JD</div>
                <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t('dashboard.welcomeGreeting')}</p>
                    <h1 className="text-base font-bold tracking-tight">John Doe</h1>
                </div>
            </div>
            <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
        </header>
    );
}

function DashboardView() {
    const { t } = useTranslation();
    const stats = [
        { label: t('dashboard.cardTotalIncome'), value: 'R$ 4.200', trend: '+12%', color: 'text-primary' },
        { label: t('dashboard.cardTotalExpense'), value: 'R$ 2.700', trend: '-8%', color: 'text-rose-500' },
    ];
    const quickActions = [
        { icon: PlusCircle, label: 'Receita', color: 'text-primary', bg: 'bg-primary/10' },
        { icon: MinusCircle, label: 'Despesa', color: 'text-red-500', bg: 'bg-red-500/10' },
        { icon: ArrowLeftRight, label: 'Troca', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    return (
        <div className="p-6 h-full">
            <MockHeader />
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/30 p-5 rounded-2xl text-primary-foreground shadow-lg">
                        <p className="text-[10px] font-semibold text-primary-foreground/80 uppercase mb-1">{t('dashboard.cardTotalTitle')}</p>
                        <p className="text-2xl font-black tracking-tighter">R$ 1.500,00</p>
                    </div>
                    <div className="bg-card/50 p-4 rounded-2xl border border-border/40">
                        <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase">{t('dashboard.quickActions')}</p>
                        <div className="grid grid-cols-3 gap-2">
                            {quickActions.map((action, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center`}>
                                        <action.icon className={`w-4 h-4 ${action.color}`} />
                                    </div>
                                    <span className="text-[9px] font-medium text-muted-foreground">{action.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-3 rounded-2xl bg-card border border-border/60">
                                <p className="text-[9px] text-muted-foreground mb-1">{stat.label}</p>
                                <p className="text-sm font-bold">{stat.value}</p>
                                <p className={`text-[9px] font-bold ${stat.color}`}>{stat.trend}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold">{t('dashboard.balancePositive')}</p>
                            <p className="text-[9px] text-muted-foreground">{t('dashboard.insightText')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TransactionsView() {
    const { t } = useTranslation();
    const rows = [
        { name: 'Supermercado', date: '12 Fev', value: '- R$ 245', expense: true },
        { name: t('categories.Freelancer'), date: '10 Fev', value: '+ R$ 1.500', expense: false },
        { name: 'Netflix', date: '8 Fev', value: '- R$ 55,90', expense: true },
        { name: 'Salário', date: '5 Fev', value: '+ R$ 3.800', expense: false },
    ];

    return (
        <div className="p-6 h-full flex flex-col">
            <MockHeader />
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button type="button" className="p-1 rounded-lg bg-muted"><ChevronLeft className="w-3.5 h-3.5" /></button>
                    <span className="text-xs font-bold">Fevereiro 2026</span>
                    <button type="button" className="p-1 rounded-lg bg-muted"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
                <Receipt className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                    { label: t('landing_v2.transactions.income'), value: 'R$ 5.300', icon: TrendingUp, color: 'text-primary' },
                    { label: t('landing_v2.transactions.expense'), value: 'R$ 2.700', icon: TrendingDown, color: 'text-rose-500' },
                    { label: 'Saldo', value: 'R$ 2.600', icon: Activity, color: 'text-amber-500' },
                ].map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-card border border-border/50 text-center">
                        <item.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${item.color}`} />
                        <p className="text-[8px] text-muted-foreground">{item.label}</p>
                        <p className="text-[10px] font-bold">{item.value}</p>
                    </div>
                ))}
            </div>
            <div className="flex-1 bg-card/50 border border-border/60 rounded-2xl p-4 space-y-3 overflow-hidden">
                <p className="text-xs font-bold">{t('dashboard.listTitle')}</p>
                {rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${row.expense ? 'bg-rose-500/10' : 'bg-primary/10'}`}>
                                {row.expense ? <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> : <TrendingUp className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold">{row.name}</p>
                                <p className="text-[9px] text-muted-foreground">{row.date}</p>
                            </div>
                        </div>
                        <span className={`text-[11px] font-bold ${row.expense ? 'text-rose-500' : 'text-primary'}`}>{row.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReportsView() {
    const { t } = useTranslation();
    const categories = [
        { label: t('categories.Alimentação'), pct: 35, color: 'bg-primary' },
        { label: t('categories.Moradia'), pct: 28, color: 'bg-blue-500' },
        { label: t('categories.Entretenimento'), pct: 15, color: 'bg-amber-500' },
        { label: 'Outros', pct: 22, color: 'bg-violet-500' },
    ];
    const months = [40, 55, 48, 62, 58, 45];

    return (
        <div className="p-6 h-full">
            <MockHeader />
            <div className="grid grid-cols-2 gap-4 h-[calc(100%-4rem)]">
                <div className="bg-card/50 border border-border/60 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <p className="text-xs font-bold">{t('landing_v3.features.reports.bullet1')}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-4">
                        <div
                            className="w-24 h-24 rounded-full shrink-0"
                            style={{
                                background: 'conic-gradient(hsl(var(--primary)) 0% 35%, #3b82f6 35% 63%, #f59e0b 63% 78%, #8b5cf6 78% 100%)',
                            }}
                        />
                        <div className="space-y-1.5 flex-1">
                            {categories.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${cat.color}`} />
                                        <span className="text-[9px] text-muted-foreground truncate">{cat.label}</span>
                                    </div>
                                    <span className="text-[9px] font-bold">{cat.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-card/50 border border-border/60 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className="text-xs font-bold">{t('landing_v3.features.reports.bullet2')}</p>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-1.5 px-1">
                        {months.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-primary/20 rounded-t-md relative" style={{ height: `${h}%` }}>
                                    <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-md" style={{ height: '70%' }} />
                                </div>
                                <span className="text-[8px] text-muted-foreground">{['A', 'M', 'J', 'J', 'A', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ForecastsView() {
    const { t } = useTranslation();
    const projections = [
        { month: 'Mar', value: 'R$ 2.100', h: 65 },
        { month: 'Abr', value: 'R$ 2.450', h: 78 },
        { month: 'Mai', value: 'R$ 2.800', h: 92 },
    ];

    return (
        <div className="p-6 h-full flex flex-col">
            <MockHeader />
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[10px] font-medium text-foreground">{t('landing_v3.features.forecasts.bullet2')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="bg-card/50 border border-border/60 rounded-2xl p-4">
                    <p className="text-[10px] text-muted-foreground mb-1">{t('landing_v3.features.forecasts.bullet1')}</p>
                    <p className="text-xl font-black text-primary mb-3">R$ 2.800</p>
                    <p className="text-[9px] text-muted-foreground mb-2">{t('landing_v3.features.forecasts.bullet3')}</p>
                    <div className="flex items-end gap-2 h-20">
                        {projections.map((p, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-primary/20 rounded-t-lg" style={{ height: `${p.h}%` }}>
                                    <div className="w-full h-full bg-primary/80 rounded-t-lg" />
                                </div>
                                <span className="text-[8px] font-bold">{p.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    {[
                        { title: 'Meta de economia', value: '78%', ok: true },
                        { title: 'Gasto em lazer', value: '+22% vs média', ok: false },
                        { title: 'Reserva de emergência', value: '3,2 meses', ok: true },
                    ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-card border border-border/50">
                            <p className="text-[10px] font-semibold mb-0.5">{item.title}</p>
                            <p className={`text-xs font-bold ${item.ok ? 'text-primary' : 'text-amber-500'}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProfileView() {
    const { t } = useTranslation();
    const toggles = [
        { label: t('profile.settings.emailNotifications'), on: true },
        { label: t('profile.settings.pushNotifications'), on: true },
        { label: t('profile.settings.monthlyReports'), on: false },
    ];

    return (
        <div className="p-6 h-full">
            <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold mb-2">JD</div>
                <p className="text-sm font-bold">John Doe</p>
                <p className="text-[10px] text-muted-foreground">john@email.com</p>
            </div>
            <div className="space-y-2">
                {[
                    { icon: User, label: t('landing_v3.features.profile.bullet1') },
                    { icon: Bell, label: t('landing_v3.features.profile.bullet2') },
                    { icon: Mail, label: t('landing_v3.features.profile.bullet3') },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                        <item.icon className="w-4 h-4 text-primary" />
                        <span className="text-[11px] font-medium flex-1">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                ))}
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
                {toggles.map((toggle, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-[10px] font-medium">{toggle.label}</span>
                        <div className={`w-8 h-4 rounded-full relative ${toggle.on ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${toggle.on ? 'left-4' : 'left-0.5'}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const LandingScreenMockup: React.FC<LandingScreenMockupProps> = ({ screen }) => {
    const navIcon = (active: boolean) => (active ? 'w-4 h-4 text-primary' : 'w-4 h-4 text-muted-foreground/40');

    const views: Record<LandingScreen, React.ReactNode> = {
        dashboard: <DashboardView />,
        transactions: <TransactionsView />,
        reports: <ReportsView />,
        forecasts: <ForecastsView />,
        profile: <ProfileView />,
    };

    const activeNav: Record<LandingScreen, number> = {
        dashboard: 0,
        transactions: 1,
        reports: 2,
        forecasts: 2,
        profile: 3,
    };

    const navIndex = activeNav[screen];

    return (
        <div className={frameClass}>
            <div className="flex-1 overflow-hidden">{views[screen]}</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl px-6 py-2 flex gap-6 items-center shadow-xl">
                    <Home className={navIcon(navIndex === 0)} />
                    <TrendingUp className={navIcon(navIndex === 1)} />
                    <BarChart3 className={navIcon(navIndex === 2)} />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${navIndex === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingScreenMockup;
