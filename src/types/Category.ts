import type { Timestamp } from 'firebase/firestore';

export type CategoryTransactionType = 'receita' | 'despesa' | 'conta';

export type CategoryLocalizedEntry = { label: string };

export type CategoryLocalized = Record<string, CategoryLocalizedEntry>;

export interface Category {
    id: string;
    legacyKey?: string;
    type: CategoryTransactionType;
    icon: string;
    localized?: CategoryLocalized;
    order: number;
    active: boolean;
    showInBothTypes?: boolean;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface CategoryCreateInput {
    type: CategoryTransactionType;
    icon: string;
    localized: CategoryLocalized;
    order: number;
    active?: boolean;
    showInBothTypes?: boolean;
}

export interface CategoryUpdateInput {
    type?: CategoryTransactionType;
    icon?: string;
    localized?: CategoryLocalized;
    order?: number;
    active?: boolean;
    showInBothTypes?: boolean;
}

export function normalizeCategoryLang(lang: string): string {
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('es')) return 'es';
    return 'pt';
}

export function getCategoryLocalized(category: Category, lang: string): string {
    const key = normalizeCategoryLang(lang);
    const entry = category.localized?.[key];
    if (entry?.label) return entry.label;
    const pt = category.localized?.pt;
    if (pt?.label) return pt.label;
    return category.legacyKey ?? category.id;
}
