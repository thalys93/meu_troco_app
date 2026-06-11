import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { cn } from '@/lib/utils';
import { useBackofficeStats } from '@/utils/services/api/api';
import { useGetAllNotificationsAdmin } from '@/utils/services/api/notifications-service';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { LayoutGrid, Bell, ArrowUpRight, Users, ShoppingBag, Map } from 'lucide-react';
import type { NotificationType } from '@/types/Notification';
import { BackofficeUsersError } from '@/utils/helpers/authGuard';
import MetricCard from '@/subdomains/backoffice/components/MetricCard';

const COLORS = {
    users: 'hsl(142.1 76.2% 36.3%)',
    expenses: 'hsl(0 84.2% 60.2%)',
    income: 'hsl(160 84% 39%)',
    bills: 'hsl(38 92% 50%)',
    wallets: 'hsl(224.3 76.3% 48%)',
} as const;

const NOTIFICATION_COLORS = {
    changelog: 'hsl(224.3 76.3% 48%)',
    terms: 'hsl(142.1 76.2% 36.3%)',
} as const;

type PlatformSegmentKey = keyof typeof COLORS;

function getStatsErrorMessage(error: Error | null | undefined, t: (key: string) => string): string {
    if (!error) return t('backoffice.stats.loadError');
    if (error.message === BackofficeUsersError.FIRESTORE_DENIED) {
        return t('backoffice.stats.loadErrorFirestore');
    }
    if (error.message === BackofficeUsersError.FORBIDDEN) {
        return t('backoffice.stats.loadErrorForbidden');
    }
    return t('backoffice.stats.loadError');
}

function BackofficeHomePage() {
    const { data, isLoading, isError, error } = useBackofficeStats();
    const { data: notifications = [], isLoading: notificationsLoading } = useGetAllNotificationsAdmin();
    const { t } = useTranslation();

    const changelogCount = notifications.filter((n) => n.type === 'changelog').length;
    const termsCount = notifications.filter((n) => n.type === 'terms').length;
    const notificationsTotal = notifications.length;
    const notificationsMaxDomain = Math.max(notificationsTotal, 1);

    const notificationsChartData = [
        { segment: 'stack', changelog: changelogCount, terms: termsCount },
    ];

    const notificationsChartConfig = {
        changelog: { label: t('notifications.typeChangelog'), color: NOTIFICATION_COLORS.changelog },
        terms: { label: t('notifications.typeTerms'), color: NOTIFICATION_COLORS.terms },
    };

    const notificationSegments: { key: NotificationType; value: number; label: string; color: string }[] = [
        { key: 'changelog', value: changelogCount, label: t('notifications.typeChangelog'), color: NOTIFICATION_COLORS.changelog },
        { key: 'terms', value: termsCount, label: t('notifications.typeTerms'), color: NOTIFICATION_COLORS.terms },
    ];

    const segments: {
        key: PlatformSegmentKey;
        value: number;
        label: string;
        color: string;
        href?: string;
    }[] = [
        { key: 'users', value: data.users, label: t('backoffice.stats.users'), color: COLORS.users, href: '/backoffice/users' },
        { key: 'expenses', value: data.expenses, label: t('backoffice.stats.expenses'), color: COLORS.expenses },
        { key: 'income', value: data.income, label: t('backoffice.stats.income'), color: COLORS.income },
        { key: 'bills', value: data.bills, label: t('backoffice.stats.bills'), color: COLORS.bills },
        { key: 'wallets', value: data.wallets, label: t('backoffice.stats.wallets'), color: COLORS.wallets },
    ];

    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    const maxDomain = Math.max(total, 1);
    const hasPlatformStats = total > 0;

    const chartData = [
        {
            segment: 'stack',
            users: data.users,
            expenses: data.expenses,
            income: data.income,
            bills: data.bills,
            wallets: data.wallets,
        },
    ];

    const chartConfig = {
        users: { label: t('backoffice.stats.users'), color: COLORS.users },
        expenses: { label: t('backoffice.stats.expenses'), color: COLORS.expenses },
        income: { label: t('backoffice.stats.income'), color: COLORS.income },
        bills: { label: t('backoffice.stats.bills'), color: COLORS.bills },
        wallets: { label: t('backoffice.stats.wallets'), color: COLORS.wallets },
    };

    return (
        <PrivateLayout>
            <PageShell
                title={t('backoffice.stats.title')}
                description={t('backoffice.stats.description')}
                eyebrow={t('sidebar.backoffice')}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link to="/backoffice/users">
                            <MetricCard
                                title={t('backoffice.stats.users')}
                                value={isLoading ? '...' : data.users}
                                icon={Users}
                                subtitle={t('users.backoffice.title')}
                                iconClassName="text-emerald-500"
                            />
                        </Link>
                        <Link to="/backoffice/plans">
                            <MetricCard
                                title={t('backoffice.plans')}
                                value={t('plans.backoffice.status.active', 'Ativos')}
                                icon={ShoppingBag}
                                subtitle={t('backoffice.plans.description')}
                                iconClassName="text-sky-500"
                            />
                        </Link>
                        <Link to="/backoffice/roadmap">
                            <MetricCard
                                title={t('roadmap.title')}
                                value={t('roadmap.view.kanban')}
                                icon={Map}
                                subtitle={t('roadmap.description')}
                                iconClassName="text-amber-500"
                            />
                        </Link>
                    </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div
                        className={cn(
                            'bo-surface-elevated p-5',
                            isLoading && 'animate-pulse'
                        )}
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                    <LayoutGrid className="h-5 w-5 text-primary" aria-hidden />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {t('backoffice.stats.chartTitle')}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {t('backoffice.stats.chartSubtitle', { total })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isError ? (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                {getStatsErrorMessage(error, t)}
                            </div>
                        ) : hasPlatformStats ? (
                            <ChartContainer config={chartConfig} className="h-[80px] w-full aspect-auto">
                                <BarChart
                                    layout="vertical"
                                    data={chartData}
                                    margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                                >
                                    <XAxis type="number" hide domain={[0, maxDomain]} />
                                    <YAxis type="category" dataKey="segment" width={0} hide />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="users" stackId="a" fill={COLORS.users} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="expenses" stackId="a" fill={COLORS.expenses} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="income" stackId="a" fill={COLORS.income} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="bills" stackId="a" fill={COLORS.bills} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="wallets" stackId="a" fill={COLORS.wallets} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex h-[80px] items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 text-sm text-muted-foreground">
                                {t('backoffice.stats.empty')}
                            </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            {segments.map(({ key, value, label, color, href }) => (
                                <span key={key} className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                        style={{ backgroundColor: color }}
                                        aria-hidden
                                    />
                                    {href ? (
                                        <Link
                                            to={href}
                                            className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                                        >
                                            {label}: <span className="font-medium text-foreground">{value}</span>
                                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {label}: <span className="font-medium text-foreground">{value}</span>
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div
                        className={cn(
                            'bo-surface-elevated p-5',
                            notificationsLoading && 'animate-pulse'
                        )}
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                    <Bell className="h-5 w-5 text-primary" aria-hidden />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {t('backoffice.stats.notificationsChartTitle')}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {t('backoffice.stats.notificationsChartSubtitle', { total: notificationsTotal })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {notificationsTotal > 0 ? (
                            <ChartContainer config={notificationsChartConfig} className="h-[80px] w-full aspect-auto">
                                <BarChart
                                    layout="vertical"
                                    data={notificationsChartData}
                                    margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                                >
                                    <XAxis type="number" hide domain={[0, notificationsMaxDomain]} />
                                    <YAxis type="category" dataKey="segment" width={0} hide />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="changelog" stackId="notif" fill={NOTIFICATION_COLORS.changelog} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="terms" stackId="notif" fill={NOTIFICATION_COLORS.terms} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex h-[80px] items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 text-sm text-muted-foreground">
                                {t('backoffice.stats.empty')}
                            </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                            {notificationSegments.map(({ key, value, label, color }) => (
                                <span key={key} className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                        style={{ backgroundColor: color }}
                                        aria-hidden
                                    />
                                    <span className="text-muted-foreground">
                                        {label}: <span className="font-medium text-foreground">{value}</span>
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default BackofficeHomePage;
