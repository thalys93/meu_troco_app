import type {
    RankLocale,
    RoadmapItem,
    RoadmapItemLocalized,
    RoadmapItemLocalizedEntry,
} from '@/types/backoffice';
import { RANK_SUPPORTED_LOCALES } from '@/types/backoffice';

export const ROADMAP_ITEM_FORM_LOCALES = RANK_SUPPORTED_LOCALES;

export function emptyRoadmapItemLocalized(): RoadmapItemLocalized {
    return {
        pt: { title: '', description: '' },
        en: { title: '', description: '' },
        es: { title: '', description: '' },
    };
}

export function getPrimaryItemTitle(localized: RoadmapItemLocalized): string {
    for (const locale of ROADMAP_ITEM_FORM_LOCALES) {
        const title = localized[locale]?.title?.trim();
        if (title) return title;
    }
    return '';
}

export function updateItemLocalizedEntry(
    localized: RoadmapItemLocalized,
    locale: RankLocale,
    patch: Partial<RoadmapItemLocalizedEntry>,
): RoadmapItemLocalized {
    return {
        ...localized,
        [locale]: {
            title: patch.title ?? localized[locale]?.title ?? '',
            description: patch.description ?? localized[locale]?.description ?? '',
        },
    };
}

export function roadmapItemToFormLocalized(item: RoadmapItem): RoadmapItemLocalized {
    const base = emptyRoadmapItemLocalized();

    if (item.localized) {
        for (const locale of ROADMAP_ITEM_FORM_LOCALES) {
            const entry = item.localized[locale];
            if (entry) {
                base[locale] = {
                    title: entry.title ?? '',
                    description: entry.description ?? '',
                };
            }
        }
        return base;
    }

    base.pt = {
        title: item.title ?? '',
        description: item.description ?? '',
    };
    return base;
}

export function buildItemPayloadFromLocalized(localized: RoadmapItemLocalized) {
    const cleaned: RoadmapItemLocalized = {};

    for (const locale of ROADMAP_ITEM_FORM_LOCALES) {
        const entry = localized[locale];
        const title = entry?.title?.trim() ?? '';
        const description = entry?.description?.trim() ?? '';
        if (!title && !description) continue;
        cleaned[locale] = { title, description };
    }

    const primaryTitle = getPrimaryItemTitle(cleaned);
    const primaryDescription = cleaned.pt?.description?.trim()
        ?? cleaned.en?.description?.trim()
        ?? cleaned.es?.description?.trim()
        ?? '';

    return {
        title: primaryTitle,
        description: primaryDescription,
        localized: cleaned,
    };
}
