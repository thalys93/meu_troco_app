import type { RankCriterion, RankCriterionMetric, RankTier } from '@/types/backoffice';
import type { RankMetricsSnapshot } from '@/subdomains/dashboard/utils/rank-metrics';

export function tierCriteriaMet(tier: RankTier, metrics: RankMetricsSnapshot): boolean {
    if (!tier.criteria.length) return false;
    return tier.criteria.every((criterion) =>
        metricMeetsTarget(metrics, criterion),
    );
}

function metricMeetsTarget(
    metrics: RankMetricsSnapshot,
    criterion: RankCriterion,
): boolean {
    const current = metrics[criterion.metric] ?? 0;
    return current >= criterion.targetValue;
}

export function resolveAchievedRank(
    tiers: RankTier[],
    metrics: RankMetricsSnapshot,
): RankTier | null {
    const sorted = [...tiers].sort((a, b) => a.level - b.level);
    let achieved: RankTier | null = null;

    for (const tier of sorted) {
        if (tierCriteriaMet(tier, metrics)) {
            achieved = tier;
        }
    }

    return achieved;
}

export function resolveNextRank(
    tiers: RankTier[],
    current: RankTier | null,
    metrics: RankMetricsSnapshot,
): RankTier | null {
    const sorted = [...tiers].sort((a, b) => a.level - b.level);
    const floorLevel = current?.level ?? 0;

    for (const tier of sorted) {
        if (tier.level <= floorLevel) continue;
        if (!tierCriteriaMet(tier, metrics)) return tier;
    }

    return null;
}

export function criterionProgress(
    metrics: RankMetricsSnapshot,
    metric: RankCriterionMetric,
    target: number,
): number {
    if (target <= 0) return 1;
    return Math.min(1, (metrics[metric] ?? 0) / target);
}
