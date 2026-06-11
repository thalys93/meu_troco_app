import type { Category, CategoryTransactionType, CategoryUpdateInput } from '@/types/Category';
import { normalizeCategoryLang } from '@/types/Category';

export type CategoryInlineDraft = {
    type: CategoryTransactionType;
    icon: string;
    label: string;
    order: number;
    active: boolean;
    lang: string;
};

export type CategoryInlineFieldErrors = {
    label: boolean;
};

export function draftFromCategory(
    category: Category,
    lang: string,
    listIndex: number
): CategoryInlineDraft {
    const key = normalizeCategoryLang(lang);
    const label =
        category.localized?.[key]?.label?.trim() ||
        category.localized?.pt?.label?.trim() ||
        category.legacyKey ||
        category.id;

    return {
        type: category.type,
        icon: category.icon,
        label,
        order: listIndex,
        active: category.active,
        lang
    };
}

export function validateCategoryInlineDraft(draft: CategoryInlineDraft): CategoryInlineFieldErrors {
    return { label: !draft.label.trim() };
}

export function buildCategoryUpdatePayload(
    draft: CategoryInlineDraft,
    category: Category
): CategoryUpdateInput {
    const langKey = normalizeCategoryLang(draft.lang);
    const localized = { ...(category.localized ?? {}) };
    localized[langKey] = { label: draft.label.trim() };

    return {
        type: draft.type,
        icon: draft.icon,
        localized,
        order: draft.order,
        active: draft.active
    };
}
