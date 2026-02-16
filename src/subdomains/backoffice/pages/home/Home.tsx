import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import { cn } from '@/lib/utils';
import { useBackofficeStats } from '@/utils/services/api/api';
import { useGetAllNotificationsAdmin } from '@/utils/services/api/notifications-service';
import { useTranslation } from 'react-i18next';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { LayoutGrid, Bell } from 'lucide-react';
import type { NotificationType } from '@/types/Notification';

const COLORS = {
    users: 'hsl(var(--primary))',
    expenses: 'hsl(var(--destructive))',
    income: 'hsl(142.1 76.2% 36.3%)',
    cards: 'hsl(224.3 76.3% 48%)',
} as const;

const NOTIFICATION_COLORS = {
    changelog: 'hsl(224.3 76.3% 48%)',
    terms: 'hsl(142.1 76.2% 36.3%)',
} as const;

function BackofficeHomePage() {
    const { data, isLoading } = useBackofficeStats();
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

    const total = data.users + data.expenses + data.income + data.cards;
    const maxDomain = Math.max(total, 1);

    const chartData = [
        {
            segment: 'stack',
            users: data.users,
            expenses: data.expenses,
            income: data.income,
            cards: data.cards,
        },
    ];

    const chartConfig = {
        users: { label: t('backoffice.stats.users'), color: COLORS.users },
        expenses: { label: t('backoffice.stats.expenses'), color: COLORS.expenses },
        income: { label: t('backoffice.stats.income'), color: COLORS.income },
        cards: { label: t('backoffice.stats.cards'), color: COLORS.cards },
    };

    const segments = [
        { key: 'users', value: data.users, label: t('backoffice.stats.users'), color: COLORS.users },
        { key: 'expenses', value: data.expenses, label: t('backoffice.stats.expenses'), color: COLORS.expenses },
        { key: 'income', value: data.income, label: t('backoffice.stats.income'), color: COLORS.income },
        { key: 'cards', value: data.cards, label: t('backoffice.stats.cards'), color: COLORS.cards },
    ];

    return (
        <PrivateLayout>
            <section className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('backoffice.stats.title')}</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {t('backoffice.stats.description')}
                    </p>
                </div>

                <div
                    className={cn(
                        'rounded-xl border border-border/80 bg-card p-5 shadow-sm',
                        isLoading && 'animate-pulse'
                    )}
                >
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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

                    <ChartContainer config={chartConfig} className="h-[80px] w-full">
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
                            <Bar dataKey="cards" stackId="a" fill={COLORS.cards} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ChartContainer>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        {segments.map(({ key, value, label, color }) => (
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

                <div
                    className={cn(
                        'rounded-xl border border-border/80 bg-card p-5 shadow-sm',
                        notificationsLoading && 'animate-pulse'
                    )}
                >
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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

                    <ChartContainer config={notificationsChartConfig} className="h-[80px] w-full">
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
            </section>
        </PrivateLayout>
    );
}

export default BackofficeHomePage;
