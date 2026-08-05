import type { Category, CategoryTransactionType } from '@/types/Category';

const SECTION_TYPES: CategoryTransactionType[] = ['despesa', 'conta', 'receita'];

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

export function isCategorySectionType(id: string): id is CategoryTransactionType {
    return SECTION_TYPES.includes(id as CategoryTransactionType);
}

export function findCategoryContainer(
    id: string,
    sections: Record<CategoryTransactionType, Category[]>
): CategoryTransactionType | null {
    if (isCategorySectionType(id)) return id;
    for (const type of SECTION_TYPES) {
        if (sections[type].some((category) => category.id === id)) return type;
    }
    return null;
}

function moveItemInList<T>(list: T[], fromIndex: number, toIndex: number): T[] {
    const next = [...list];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

export function applyCategoryDrag(
    sections: Record<CategoryTransactionType, Category[]>,
    activeId: string,
    overId: string
): Record<CategoryTransactionType, Category[]> | null {
    if (activeId === overId) return null;

    const fromType = findCategoryContainer(activeId, sections);
    const toType = findCategoryContainer(overId, sections);
    if (!fromType || !toType) return null;

    const fromList = sections[fromType];
    const activeIndex = fromList.findIndex((category) => category.id === activeId);
    if (activeIndex === -1) return null;

    if (fromType === toType) {
        if (isCategorySectionType(overId)) return null;
        const overIndex = fromList.findIndex((category) => category.id === overId);
        if (overIndex === -1 || activeIndex === overIndex) return null;
        return {
            ...sections,
            [fromType]: withListOrderIndices(moveItemInList(fromList, activeIndex, overIndex)),
        };
    }

    const moved: Category = { ...fromList[activeIndex], type: toType };
    const nextFrom = withListOrderIndices(fromList.filter((_, index) => index !== activeIndex));
    const toList = sections[toType];

    let insertIndex = toList.length;
    if (!isCategorySectionType(overId)) {
        const overIndex = toList.findIndex((category) => category.id === overId);
        if (overIndex !== -1) insertIndex = overIndex;
    }

    const nextTo = withListOrderIndices([
        ...toList.slice(0, insertIndex),
        moved,
        ...toList.slice(insertIndex),
    ]);

    return {
        ...sections,
        [fromType]: nextFrom,
        [toType]: nextTo,
    };
}

export function toOrderAndTypeUpdates(
    sections: Record<CategoryTransactionType, Category[]>,
    types: CategoryTransactionType[]
): { id: string; order: number; type: CategoryTransactionType }[] {
    return types.flatMap((type) =>
        sections[type].map((category, index) => ({
            id: category.id,
            order: index,
            type: category.type,
        }))
    );
}
