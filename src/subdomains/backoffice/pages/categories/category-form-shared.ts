import type { CategoryCreateInput, CategoryLocalized } from '@/types/Category';

export const CATEGORY_FORM_LOCALES = ['pt', 'en', 'es'] as const;

export const emptyCategoryLocalized: CategoryLocalized = {
    pt: { label: '' },
    en: { label: '' },
    es: { label: '' }
};

export const categoryFormDefaultValues: CategoryCreateInput = {
    type: 'despesa',
    icon: 'Tag',
    localized: { ...emptyCategoryLocalized },
    order: 0,
    active: true
};
