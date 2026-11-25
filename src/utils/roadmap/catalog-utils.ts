import type {
    RoadmapItem,
    RoadmapPhase,
    RoadmapQuarter,
    RoadmapTimelineItem,
    RoadmapTimelinePhase,
    RoadmapTimelineQuarter,
    RoadmapTimelineTree,
    RoadmapYear,
} from '@/types/backoffice';
import { getRoadmapItemLocalized, getRoadmapPhaseLocalized } from '@/types/backoffice';

export function parseQuarterLabel(value: string) {
    const normalized = value.trim().replace(/\s+/g, ' ');
    const match = normalized.match(/(\d{4})\s*Q(\d)/i);
    if (!match) return null;
    const year = Number(match[1]);
    const quarter = Number(match[2]) as 1 | 2 | 3 | 4;
    if (quarter < 1 || quarter > 4) return null;
    return { year, quarter, label: `${year} Q${quarter}` };
}

export function formatQuarterLabel(year: number, quarter: number) {
    return `${year} Q${quarter}`;
}

export function sortYears(left: RoadmapYear, right: RoadmapYear) {
    if (left.year !== right.year) return left.year - right.year;
    return left.order - right.order;
}

export function sortQuarters(left: RoadmapQuarter, right: RoadmapQuarter) {
    if (left.order !== right.order) return left.order - right.order;
    return left.quarter - right.quarter;
}

export function sortPhases(left: RoadmapPhase, right: RoadmapPhase) {
    return left.order - right.order;
}

export function sortQuarterLabels(left: string, right: string) {
    const a = parseQuarterLabel(left);
    const b = parseQuarterLabel(right);
    if (!a && !b) return left.localeCompare(right);
    if (!a) return 1;
    if (!b) return -1;
    if (a.year !== b.year) return a.year - b.year;
    if (a.quarter !== b.quarter) return a.quarter - b.quarter;
    return a.label.localeCompare(b.label);
}

export function buildRoadmapTimelineTree({
    years,
    quarters,
    phases,
    items,
    lang = 'pt-BR',
}: {
    years: RoadmapYear[];
    quarters: RoadmapQuarter[];
    phases: RoadmapPhase[];
    items: RoadmapItem[];
    lang?: string;
}): RoadmapTimelineTree {
    const activeYears = years.filter((year) => year.status === 'active').sort(sortYears);
    const activeQuarters = quarters
        .filter((quarter) => quarter.status === 'active')
        .sort(sortQuarters);
    const activePhases = phases
        .filter((phase) => phase.status === 'active')
        .sort(sortPhases);
    const visibleItems = items.filter((item) => item.status !== 'archived');

    const yearById = new Map(activeYears.map((year) => [year.id!, year]));
    const phaseById = new Map(activePhases.map((phase) => [phase.id!, phase]));
    const currentPhase = activePhases.find((phase) => phase.isCurrent);

    const quarterNodes: RoadmapTimelineQuarter[] = activeQuarters
        .filter((quarter) => yearById.has(quarter.yearId))
        .map((quarter) => {
            const year = yearById.get(quarter.yearId)!;
            const quarterPhases = activePhases.filter((phase) => phase.quarterId === quarter.id);
            const quarterPhaseIds = new Set(quarterPhases.map((phase) => phase.id));
            const quarterItems = visibleItems
                .filter((item) => item.phaseId && quarterPhaseIds.has(item.phaseId))
                .map((item) => {
                    const phase = phaseById.get(item.phaseId);
                    const localizedItem = getRoadmapItemLocalized(item, lang);
                    return {
                        id: item.id!,
                        title: localizedItem.title,
                        description: localizedItem.description ?? '',
                        status: item.status,
                        priority: item.priority,
                        phaseId: item.phaseId,
                        phaseName: phase ? getRoadmapPhaseLocalized(phase, lang).name : '',
                    };
                });

            const isCurrentQuarter = Boolean(
                currentPhase && quarterPhases.some((phase) => phase.id === currentPhase.id),
            );

            const itemsByPhaseId = quarterItems.reduce<Map<string, RoadmapTimelineItem[]>>((acc, item) => {
                const existing = acc.get(item.phaseId) ?? [];
                acc.set(item.phaseId, [...existing, item]);
                return acc;
            }, new Map());

            const phaseNodes: RoadmapTimelinePhase[] = quarterPhases
                .map((phase) => {
                    const phaseItems = itemsByPhaseId.get(phase.id!) ?? [];
                    return {
                        id: phase.id!,
                        name: getRoadmapPhaseLocalized(phase, lang).name,
                        isCurrent: phase.isCurrent,
                        items: phaseItems,
                    };
                })
                .filter((phase) => phase.items.length > 0 || phase.isCurrent);

            return {
                id: quarter.id!,
                label: quarter.label,
                quarter: quarter.quarter,
                year: year.year,
                items: quarterItems,
                phases: phaseNodes,
                isCurrentQuarter,
                currentPhaseName: isCurrentQuarter && currentPhase
                    ? getRoadmapPhaseLocalized(currentPhase, lang).name
                    : undefined,
            };
        })
        .filter((quarter) => quarter.items.length > 0 || quarter.isCurrentQuarter);

    return {
        quarters: quarterNodes,
        currentPhase: currentPhase
            ? {
                name: getRoadmapPhaseLocalized(currentPhase, lang).name,
                quarterLabel: activeQuarters.find((quarter) => quarter.id === currentPhase.quarterId)?.label ?? '',
            }
            : undefined,
    };
}

export function groupItemsByQuarterLabel(
    items: RoadmapItem[],
    quarters: RoadmapQuarter[],
    phases: RoadmapPhase[],
    fallbackLabel: string,
) {
    const quarterByPhaseId = new Map<string, RoadmapQuarter>();
    for (const phase of phases) {
        const quarter = quarters.find((entry) => entry.id === phase.quarterId);
        if (quarter?.id) quarterByPhaseId.set(phase.id!, quarter);
    }

    return items.reduce<Record<string, RoadmapItem[]>>((acc, item) => {
        const quarter = quarterByPhaseId.get(item.phaseId);
        const key = quarter?.label ?? item.quarter ?? fallbackLabel;
        acc[key] = [...(acc[key] ?? []), item];
        return acc;
    }, {});
}
