import type { RankCriterionMetric } from '@/types/backoffice';
import type { TFunction } from 'i18next';

export function formatRankCriterionValue(
    metric: RankCriterionMetric,
    value: number,
    locale: string,
    t: TFunction,
): string {
    if (metric === 'savings_total') {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(value);
    }
    return `${value} ${t(`goalCatalog.criteria.unit.${metric}`, { defaultValue: '' })}`.trim();
}
