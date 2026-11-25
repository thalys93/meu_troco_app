import React from 'react';
import { Check, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RankBadge } from '@/components/rank/RankBadge';
import { formatRankCriterionValue } from '@/components/rank/format-rank-criterion';
import type { RankTier } from '@/types/backoffice';
import { getRankLocalized } from '@/types/backoffice';
import type { RankMetricsSnapshot } from '@/subdomains/dashboard/utils/rank-metrics';
import { cn } from '@/lib/utils';

type UserRankDetailsContentProps = {
    tier: RankTier;
    metrics: RankMetricsSnapshot;
    className?: string;
    showBadge?: boolean;
};

export function UserRankDetailsContent({
    tier,
    metrics,
    className,
    showBadge = true,
}: UserRankDetailsContentProps) {
    const { t, i18n } = useTranslation();
    const { title, description } = getRankLocalized(tier, i18n.language);
    const metCriteria = tier.criteria.filter(
        (c) => (metrics[c.metric] ?? 0) >= c.targetValue,
    );

    return (
        <div className={cn('space-y-4', className)}>
            {showBadge ? (
                <RankBadge
                    title={title}
                    icon={tier.icon}
                    color={tier.color}
                    levelLabel={t('dashboard.rank.level', {
                        level: tier.level,
                        defaultValue: `Nível ${tier.level}`,
                    })}
                />
            ) : (
                <p className="font-semibold text-foreground pr-6">{title}</p>
            )}

            {description ? (
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t('dashboard.rank.legend', 'Legenda')}
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{description}</p>
                </div>
            ) : null}

            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('dashboard.rank.criteriaMet', 'Metas batidas neste rank')}
                </p>
                {tier.criteria.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('goalCatalog.noCriteria', 'Sem critérios definidos.')}
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {tier.criteria.map((criterion) => {
                            const current = metrics[criterion.metric] ?? 0;
                            const met = current >= criterion.targetValue;
                            return (
                                <li
                                    key={criterion.id}
                                    className={cn(
                                        'flex items-start gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm',
                                        met ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/30',
                                    )}
                                >
                                    {met ? (
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    ) : (
                                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground">
                                            {t(`goalCatalog.criteria.metric.${criterion.metric}`, criterion.metric)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatRankCriterionValue(
                                                criterion.metric,
                                                current,
                                                i18n.language,
                                                t,
                                            )}
                                            {' / '}
                                            {formatRankCriterionValue(
                                                criterion.metric,
                                                criterion.targetValue,
                                                i18n.language,
                                                t,
                                            )}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {metCriteria.length > 0 && tier.criteria.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                        {t('dashboard.rank.criteriaMetCount', '{{met}} de {{total}} metas atingidas', {
                            met: metCriteria.length,
                            total: tier.criteria.length,
                        })}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
