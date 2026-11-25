import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RankBadge } from '@/components/rank/RankBadge';
import { formatRankCriterionValue } from '@/components/rank/format-rank-criterion';
import { getRankLocalized, type RankTier } from '@/types/backoffice';
import type { RankMetricsSnapshot } from '@/subdomains/dashboard/utils/rank-metrics';
import { tierCriteriaMet } from '@/subdomains/dashboard/utils/rank-resolution';
import { cn } from '@/lib/utils';

type UserRankCatalogSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tiers: RankTier[];
    currentRank: RankTier | null;
    metrics: RankMetricsSnapshot;
};

function RankCatalogRow({
    tier,
    metrics,
    isCurrent,
}: {
    tier: RankTier;
    metrics: RankMetricsSnapshot;
    isCurrent: boolean;
}) {
    const { t, i18n } = useTranslation();
    const { title, description } = getRankLocalized(tier, i18n.language);
    const achieved = tierCriteriaMet(tier, metrics);

    return (
        <div
            className={cn(
                'rounded-2xl border p-4 space-y-3',
                isCurrent
                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                    : achieved
                      ? 'border-emerald-500/25 bg-emerald-500/5'
                      : 'border-border/50 bg-card/50',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <RankBadge
                    variant="compact"
                    title={title}
                    icon={tier.icon}
                    color={tier.color}
                    levelLabel={t('dashboard.rank.level', { level: tier.level })}
                />
                {achieved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                        {isCurrent
                            ? t('dashboard.rank.catalog.current', 'Atual')
                            : t('dashboard.rank.catalog.unlocked', 'Desbloqueado')}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        {t('dashboard.rank.catalog.locked', 'Bloqueado')}
                    </span>
                )}
            </div>

            {description ? (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {description}
                </p>
            ) : null}

            {tier.criteria.length > 0 ? (
                <ul className="space-y-1.5 text-xs">
                    {tier.criteria.map((criterion) => {
                        const current = metrics[criterion.metric] ?? 0;
                        const met = current >= criterion.targetValue;
                        return (
                            <li
                                key={criterion.id}
                                className={cn(
                                    'flex items-center justify-between gap-2 rounded-md px-2 py-1',
                                    met ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground',
                                )}
                            >
                                <span className="truncate">
                                    {t(`goalCatalog.criteria.metric.${criterion.metric}`, criterion.metric)}
                                </span>
                                <span className="shrink-0 tabular-nums font-mono text-[11px]">
                                    {formatRankCriterionValue(criterion.metric, current, i18n.language, t)}
                                    {' / '}
                                    {formatRankCriterionValue(criterion.metric, criterion.targetValue, i18n.language, t)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}

export function UserRankCatalogSheet({
    open,
    onOpenChange,
    tiers,
    currentRank,
    metrics,
}: UserRankCatalogSheetProps) {
    const { t } = useTranslation();

    const sortedTiers = React.useMemo(
        () => [...tiers].sort((a, b) => a.level - b.level),
        [tiers],
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50 text-left">
                    <SheetTitle>{t('dashboard.rank.catalog.title', 'Todos os ranks')}</SheetTitle>
                    <SheetDescription>
                        {t(
                            'dashboard.rank.catalog.description',
                            'Veja os níveis que você já desbloqueou e o que falta para subir.',
                        )}
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-3 pb-6">
                        {sortedTiers.map((tier) => (
                            <RankCatalogRow
                                key={tier.id ?? tier.slug}
                                tier={tier}
                                metrics={metrics}
                                isCurrent={currentRank?.slug === tier.slug}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
