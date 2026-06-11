import type { Category, CategoryTransactionType } from '@/types/Category';

export function sortCategoriesByOrder(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => a.order - b.order);
}

export function groupCategoriesByType(
    categories: Category[]
): Record<CategoryTransactionType, Category[]> {
    return {
        despesa: sortCategoriesByOrder(categories.filter((c) => c.type === 'despesa')),
        receita: sortCategoriesByOrder(categories.filter((c) => c.type === 'receita')),
        conta: sortCategoriesByOrder(categories.filter((c) => c.type === 'conta')),
    };
}

export function withListOrderIndices(categories: Category[]): Category[] {
    return categories.map((category, index) => ({ ...category, order: index }));
}

export function toOrderUpdates(categories: Category[]): { id: string; order: number }[] {
    return categories.map((category, index) => ({ id: category.id, order: index }));
}
