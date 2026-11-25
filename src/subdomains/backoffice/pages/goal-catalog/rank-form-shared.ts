import type { RankLocalized, RankLocalizedEntry, RankLocale } from '@/types/backoffice';
import { RANK_SUPPORTED_LOCALES } from '@/types/backoffice';

export const RANK_FORM_LOCALES = RANK_SUPPORTED_LOCALES;

export const emptyRankLocalized = (): RankLocalized => ({
    pt: { title: '', description: '' },
    en: { title: '', description: '' },
    es: { title: '', description: '' },
});

export function getPrimaryRankTitle(localized: RankLocalized): string {
    for (const locale of RANK_FORM_LOCALES) {
        const title = localized[locale]?.title?.trim();
        if (title) return title;
    }
    return '';
}

export function updateRankLocalizedEntry(
    localized: RankLocalized,
    locale: RankLocale,
    patch: Partial<RankLocalizedEntry>,
): RankLocalized {
    return {
        ...localized,
        [locale]: {
            title: patch.title ?? localized[locale]?.title ?? '',
            description: patch.description ?? localized[locale]?.description ?? '',
        },
    };
}
