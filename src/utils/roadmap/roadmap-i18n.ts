import type { TFunction } from 'i18next';
import type { Priority, RoadmapPhase, RoadmapStatus } from '@/types/backoffice';
import { getRoadmapPhaseLocalized } from '@/types/backoffice';

export const ROADMAP_DEFAULT_PHASE_NAME = 'Geral';

export function formatRoadmapQuarterLabel(
    t: TFunction,
    year: number,
    quarter: 1 | 2 | 3 | 4,
) {
    return t('roadmap.quarter.label', { year, quarter });
}

export function formatRoadmapQuarterShort(
    t: TFunction,
    quarter: 1 | 2 | 3 | 4,
) {
    return t('roadmap.quarter.short', { quarter });
}

export function translateRoadmapStatus(t: TFunction, status: RoadmapStatus | string) {
    return t(`roadmap.status.${status}`, { defaultValue: status });
}

export function translateRoadmapPriority(t: TFunction, priority: Priority | string) {
    return t(`roadmap.priority.${priority}`, { defaultValue: priority });
}

export function formatRoadmapPhaseDisplayName(name: string, t: TFunction) {
    if (name === ROADMAP_DEFAULT_PHASE_NAME) {
        return t('roadmap.catalog.defaultPhaseName');
    }
    return name;
}

export function resolveRoadmapPhaseLabel(phase: RoadmapPhase | undefined, lang: string, t: TFunction) {
    if (!phase) return '';
    const localized = getRoadmapPhaseLocalized(phase, lang);
    return formatRoadmapPhaseDisplayName(localized.name, t);
}
