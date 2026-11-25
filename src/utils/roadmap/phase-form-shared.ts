import type {
    RankLocale,
    RoadmapPhase,
    RoadmapPhaseLocalized,
    RoadmapPhaseLocalizedEntry,
} from '@/types/backoffice';
import { RANK_SUPPORTED_LOCALES } from '@/types/backoffice';

export const ROADMAP_PHASE_FORM_LOCALES = RANK_SUPPORTED_LOCALES;

export function emptyRoadmapPhaseLocalized(): RoadmapPhaseLocalized {
    return {
        pt: { name: '', description: '' },
        en: { name: '', description: '' },
        es: { name: '', description: '' },
    };
}

export function getPrimaryPhaseName(localized: RoadmapPhaseLocalized): string {
    for (const locale of ROADMAP_PHASE_FORM_LOCALES) {
        const name = localized[locale]?.name?.trim();
        if (name) return name;
    }
    return '';
}

export function updatePhaseLocalizedEntry(
    localized: RoadmapPhaseLocalized,
    locale: RankLocale,
    patch: Partial<RoadmapPhaseLocalizedEntry>,
): RoadmapPhaseLocalized {
    return {
        ...localized,
        [locale]: {
            name: patch.name ?? localized[locale]?.name ?? '',
            description: patch.description ?? localized[locale]?.description ?? '',
        },
    };
}

export function roadmapPhaseToFormLocalized(phase: RoadmapPhase): RoadmapPhaseLocalized {
    const base = emptyRoadmapPhaseLocalized();

    if (phase.localized) {
        for (const locale of ROADMAP_PHASE_FORM_LOCALES) {
            const entry = phase.localized[locale];
            if (entry) {
                base[locale] = {
                    name: entry.name ?? '',
                    description: entry.description ?? '',
                };
            }
        }
        return base;
    }

    base.pt = {
        name: phase.name ?? '',
        description: phase.description ?? '',
    };
    return base;
}

export function buildPhasePayloadFromLocalized(localized: RoadmapPhaseLocalized) {
    const cleaned: RoadmapPhaseLocalized = {};

    for (const locale of ROADMAP_PHASE_FORM_LOCALES) {
        const entry = localized[locale];
        const name = entry?.name?.trim() ?? '';
        const description = entry?.description?.trim() ?? '';
        if (!name && !description) continue;
        cleaned[locale] = { name, description };
    }

    const primaryName = getPrimaryPhaseName(cleaned);
    const primaryDescription = cleaned.pt?.description?.trim()
        ?? cleaned.en?.description?.trim()
        ?? cleaned.es?.description?.trim()
        ?? '';

    return {
        name: primaryName,
        description: primaryDescription,
        localized: cleaned,
    };
}

export function phaseNamesMatch(left: RoadmapPhase, rightName: string) {
    const normalized = rightName.trim();
    if (!normalized) return false;
    if (left.name.trim() === normalized) return true;

    return ROADMAP_PHASE_FORM_LOCALES.some(
        (locale) => left.localized?.[locale]?.name?.trim() === normalized,
    );
}
