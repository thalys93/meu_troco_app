import type { Timestamp } from 'firebase/firestore';

export type RecordStatus = 'active' | 'inactive' | 'archived';
export type WorkStatus = 'todo' | 'in_progress' | 'done' | 'archived';
export type RoadmapStatus = 'planned' | 'in_progress' | 'done' | 'archived';
export type Priority = 'low' | 'medium' | 'high';

export const RANK_SUPPORTED_LOCALES = ['pt', 'en', 'es'] as const;
export type RankLocale = (typeof RANK_SUPPORTED_LOCALES)[number];

export type RankLocalizedEntry = {
    title: string;
    description: string;
};

export type RankLocalized = Partial<Record<RankLocale, RankLocalizedEntry>>;

export type RankCriterionMetric =
    | 'transactions_count'
    | 'savings_total'
    | 'savings_streak_days'
    | 'budget_adherence_days'
    | 'wallets_count'
    | 'cards_count'
    | 'income_months'
    | 'goals_completed';

export type RankCriterion = {
    id: string;
    metric: RankCriterionMetric;
    targetValue: number;
};

export type RankTier = {
    id?: string;
    slug: string;
    localized: RankLocalized;
    level: number;
    icon: string;
    color: string;
    minPoints: number;
    criteria: RankCriterion[];
    status: RecordStatus;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type InternalTask = {
    id?: string;
    title: string;
    description: string;
    status: WorkStatus;
    priority: Priority;
    assignee?: string;
    dueDate?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type RoadmapYear = {
    id?: string;
    year: number;
    status: RecordStatus;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type RoadmapQuarter = {
    id?: string;
    yearId: string;
    quarter: 1 | 2 | 3 | 4;
    label: string;
    status: RecordStatus;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type RoadmapPhaseLocalizedEntry = {
    name: string;
    description?: string;
};

export type RoadmapPhaseLocalized = Partial<Record<RankLocale, RoadmapPhaseLocalizedEntry>>;

export type RoadmapPhase = {
    id?: string;
    quarterId: string;
    name: string;
    description?: string;
    localized?: RoadmapPhaseLocalized;
    isCurrent: boolean;
    status: RecordStatus;
    order: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export function normalizeRoadmapPhaseLang(lang: string): RankLocale {
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('es')) return 'es';
    return 'en';
}

export function getRoadmapPhaseLocalized(phase: RoadmapPhase, lang: string): RoadmapPhaseLocalizedEntry {
    const key = normalizeRoadmapPhaseLang(lang);
    const entry = phase.localized?.[key];
    if (entry?.name?.trim()) {
        return {
            name: entry.name,
            description: entry.description ?? '',
        };
    }

    const pt = phase.localized?.pt;
    if (pt?.name?.trim()) {
        return {
            name: pt.name,
            description: pt.description ?? '',
        };
    }

    for (const locale of RANK_SUPPORTED_LOCALES) {
        const fallback = phase.localized?.[locale];
        if (fallback?.name?.trim()) {
            return {
                name: fallback.name,
                description: fallback.description ?? '',
            };
        }
    }

    return {
        name: phase.name,
        description: phase.description ?? '',
    };
}

export type RoadmapItemLocalizedEntry = {
    title: string;
    description?: string;
};

export type RoadmapItemLocalized = Partial<Record<RankLocale, RoadmapItemLocalizedEntry>>;

export type RoadmapItem = {
    id?: string;
    title: string;
    description: string;
    localized?: RoadmapItemLocalized;
    status: RoadmapStatus;
    priority: Priority;
    phaseId: string;
    order: number;
    quarter?: string;
    phase?: string;
    isCurrentPhase?: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export function getRoadmapItemLocalized(item: RoadmapItem, lang: string): RoadmapItemLocalizedEntry {
    const key = normalizeRoadmapPhaseLang(lang);
    const entry = item.localized?.[key];
    if (entry?.title?.trim()) {
        return {
            title: entry.title,
            description: entry.description ?? '',
        };
    }

    const pt = item.localized?.pt;
    if (pt?.title?.trim()) {
        return {
            title: pt.title,
            description: pt.description ?? '',
        };
    }

    for (const locale of RANK_SUPPORTED_LOCALES) {
        const fallback = item.localized?.[locale];
        if (fallback?.title?.trim()) {
            return {
                title: fallback.title,
                description: fallback.description ?? '',
            };
        }
    }

    return {
        title: item.title,
        description: item.description ?? '',
    };
}

export type RoadmapTimelineItem = {
    id: string;
    title: string;
    description: string;
    status: RoadmapStatus;
    priority: Priority;
    phaseId: string;
    phaseName: string;
};

export type RoadmapTimelinePhase = {
    id: string;
    name: string;
    isCurrent: boolean;
    items: RoadmapTimelineItem[];
};

export type RoadmapTimelineQuarter = {
    id: string;
    label: string;
    quarter: number;
    year: number;
    items: RoadmapTimelineItem[];
    phases: RoadmapTimelinePhase[];
    isCurrentQuarter: boolean;
    currentPhaseName?: string;
};

export type RoadmapTimelineTree = {
    quarters: RoadmapTimelineQuarter[];
    currentPhase?: {
        name: string;
        quarterLabel: string;
    };
};

export function normalizeRankLang(lang: string): RankLocale {
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('es')) return 'es';
    return 'pt';
}

export function getRankLocalized(tier: RankTier, lang: string): RankLocalizedEntry {
    const key = normalizeRankLang(lang);
    const entry = tier.localized?.[key];
    if (entry?.title?.trim()) return entry;

    const pt = tier.localized?.pt;
    if (pt?.title?.trim()) return pt;

    for (const locale of RANK_SUPPORTED_LOCALES) {
        const fallback = tier.localized?.[locale];
        if (fallback?.title?.trim()) return fallback;
    }

    return { title: tier.slug, description: '' };
}
