import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, Trash, Download, ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import {
    useGetAllCategoriesAdmin,
    useDeleteCategory,
    useSeedDefaultCategories,
    useReorderCategories,
    countMissingDefaultCategories,
    getMissingDefaultCategorySeeds,
} from '@/utils/services/api/categories-service';
import { EmptyIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Category, CategoryTransactionType } from '@/types/Category';
import { getCategoryLocalized } from '@/types/Category';
import { resolveCategoryIcon } from '@/utils/category-icons';
import CategoryInlineEditRow from './CategoryInlineEditRow';
import SortableCategoryRow from './SortableCategoryRow';
import { CategoryInlineDraft, draftFromCategory } from './category-inline-utils';
import {
    groupCategoriesByType,
    toOrderUpdates,
    withListOrderIndices
} from './category-list-utils';

type CategorySectionConfig = {
    type: CategoryTransactionType;
    titleKey: string;
    countKey: string;
    accent: string;
    headerBg: string;
    icon: React.ComponentType<{ className?: string }>;
};

const SECTIONS: CategorySectionConfig[] = [
    {
        type: 'despesa',
        titleKey: 'categories.backoffice.sectionExpenses',
        countKey: 'categories.backoffice.sectionCountExpense',
        accent: 'border-rose-500/40',
        headerBg: 'bg-gradient-to-r from-rose-500/8 via-rose-500/4 to-transparent',
        icon: ArrowDownLeft
    },
    {
        type: 'receita',
        titleKey: 'categories.backoffice.sectionIncome',
        countKey: 'categories.backoffice.sectionCountIncome',
        accent: 'border-emerald-500/40',
        headerBg: 'bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent',
        icon: ArrowUpRight
    },
    {
        type: 'conta',
        titleKey: 'categories.backoffice.sectionBills',
        countKey: 'categories.backoffice.sectionCountBill',
        accent: 'border-amber-500/40',
        headerBg: 'bg-gradient-to-r from-amber-500/8 via-amber-500/4 to-transparent',
        icon: Receipt
    }
];

type InlineSession = {
    categoryId: string;
    listIndex: number;
    draft: CategoryInlineDraft;
};

type CategoryRowProps = {
    category: Category;
    listIndex: number;
    isDimmed: boolean;
    onOpenEdit: (category: Category, listIndex: number) => void;
    onDelete: (id: string) => void;
};

function CategoryRow({ category, listIndex, isDimmed, onOpenEdit, onDelete }: CategoryRowProps) {
    const { t, i18n } = useTranslation();
    const label = getCategoryLocalized(category, i18n.language);
    const Icon = resolveCategoryIcon(category.icon);

    return (
        <div
            role="button"
            tabIndex={0}
            className={cn(
                'group flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                'px-3 py-3 transition-colors cursor-pointer',
                'hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset',
                isDimmed && 'pointer-events-none opacity-40'
            )}
            onClick={() => onOpenEdit(category, listIndex)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenEdit(category, listIndex);
                }
            }}
        >
            <div className="min-w-0 flex-1 flex items-center gap-3">
                <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/50 text-xs font-mono tabular-nums text-muted-foreground"
                    title={t('categories.backoffice.fieldOrder')}
                >
                    {listIndex}
                </span>
                {Icon && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 shadow-sm">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </span>
                )}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{label}</span>
                        {!category.active && (
                            <Badge
                                variant="outline"
                                className="rounded-md font-normal bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            >
                                {t('categories.backoffice.inactive')}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                        {category.id}
                    </p>
                </div>
            </div>
            <div
                className="flex shrink-0 gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash className="w-4 h-4 mr-1" />
                            {t('transactionList.delete')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('categories.backoffice.deleteConfirmTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('categories.backoffice.deleteConfirmDescription', { name: label })}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t('default.cancel')}</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={() => onDelete(category.id)}>
                                    {t('transactionList.delete')}
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

type CategorySectionProps = {
    config: CategorySectionConfig;
    categories: Category[];
    inlineSession: InlineSession | null;
    sortDisabled: boolean;
    missingSeedCount?: number;
    onSeed?: () => void;
    seedPending?: boolean;
    onOpenEdit: (category: Category, listIndex: number) => void;
    onDraftChange: (draft: CategoryInlineDraft) => void;
    onCancelEdit: () => void;
    onSaved: () => void;
    onDelete: (id: string) => void;
    onReorder: (type: CategoryTransactionType, reordered: Category[]) => void;
};

function CategorySection({
    config,
    categories,
    inlineSession,
    sortDisabled,
    missingSeedCount = 0,
    onSeed,
    seedPending = false,
    onOpenEdit,
    onDraftChange,
    onCancelEdit,
    onSaved,
    onDelete,
    onReorder
}: CategorySectionProps) {
    const { t } = useTranslation();
    const SectionIcon = config.icon;
    const hasInlineSession = !!inlineSession;
    const dragDisabled = sortDisabled || hasInlineSession;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id || dragDisabled) return;

            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = withListOrderIndices(arrayMove(categories, oldIndex, newIndex));
            onReorder(config.type, reordered);
        },
        [categories, config.type, dragDisabled, onReorder]
    );

    const sortableIds = useMemo(() => categories.map((c) => c.id), [categories]);

    return (
        <section
            className={cn(
                'flex flex-col min-h-0 rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden',
                config.accent,
                'border-l-4',
                categories.length === 0 && 'border-dashed'
            )}
        >
            <div className={cn('shrink-0 px-4 py-3 flex items-center gap-3', config.headerBg)}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 border border-border/50 shadow-sm">
                    <SectionIcon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div>
                    <h2 className="text-sm font-semibold tracking-tight">{t(config.titleKey)}</h2>
                    <p className="text-xs text-muted-foreground">
                        {t(config.countKey, { count: categories.length })}
                    </p>
                </div>
            </div>

            {categories.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground text-center space-y-3">
                    <p>{t('categories.backoffice.sectionEmpty')}</p>
                    {missingSeedCount > 0 && onSeed && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onSeed}
                            disabled={seedPending}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t('categories.backoffice.seedSectionMissing', {
                                count: missingSeedCount,
                            })}
                        </Button>
                    )}
                </div>
            ) : (
                <ScrollArea className="h-[min(530px,calc(100vh-14rem))]">
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                            <div>
                                {categories.map((category, listIndex) => {
                                    const isEditing =
                                        inlineSession?.categoryId === category.id;

                                    if (isEditing && inlineSession) {
                                        return (
                                            <div
                                                key={category.id}
                                                className="border-b border-border/60 last:border-b-0"
                                            >
                                                <CategoryInlineEditRow
                                                    category={category}
                                                    listIndex={listIndex}
                                                    draft={inlineSession.draft}
                                                    onDraftChange={onDraftChange}
                                                    onCancel={onCancelEdit}
                                                    onSaved={onSaved}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <SortableCategoryRow
                                            key={category.id}
                                            id={category.id}
                                            disabled={dragDisabled}
                                        >
                                            <CategoryRow
                                                category={category}
                                                listIndex={listIndex}
                                                isDimmed={hasInlineSession}
                                                onOpenEdit={onOpenEdit}
                                                onDelete={onDelete}
                                            />
                                        </SortableCategoryRow>
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                </ScrollArea>
            )}
        </section>
    );
}

function CategoriesPage() {
    const { t, i18n } = useTranslation();
    const { data: categories, isLoading, refetch } = useGetAllCategoriesAdmin();
    const navigate = useNavigate();
    const deleteCategory = useDeleteCategory();
    const seedCategories = useSeedDefaultCategories();
    const reorderCategories = useReorderCategories();
    const [inlineSession, setInlineSession] = useState<InlineSession | null>(null);
    const [orderedSections, setOrderedSections] = useState<
        Record<CategoryTransactionType, Category[]>
    >({
        despesa: [],
        receita: [],
        conta: [],
    });

    useEffect(() => {
        if (!categories) return;
        setOrderedSections(groupCategoriesByType(categories));
    }, [categories]);

    const clearInlineSession = useCallback(() => setInlineSession(null), []);

    const openInlineEdit = useCallback(
        (category: Category, listIndex: number) => {
            if (inlineSession) return;
            setInlineSession({
                categoryId: category.id,
                listIndex,
                draft: draftFromCategory(category, i18n.language, listIndex)
            });
        },
        [inlineSession, i18n.language]
    );

    const handleDraftChange = useCallback((draft: CategoryInlineDraft) => {
        setInlineSession((prev) => (prev ? { ...prev, draft } : prev));
    }, []);

    const handleInlineSaved = useCallback(() => {
        clearInlineSession();
        refetch();
    }, [clearInlineSession, refetch]);

    const handleReorder = useCallback(
        (type: CategoryTransactionType, reordered: Category[]) => {
            setOrderedSections((prev) => ({ ...prev, [type]: reordered }));

            reorderCategories.mutate(toOrderUpdates(reordered), {
                onError: () => {
                    toast({
                        title: t('toast.error'),
                        description: t('categories.backoffice.reorderError'),
                        variant: 'destructive'
                    });
                    if (categories) {
                        setOrderedSections(groupCategoriesByType(categories));
                    }
                }
            });
        },
        [categories, reorderCategories, t]
    );

    const handleDelete = (id: string) => {
        if (inlineSession?.categoryId === id) clearInlineSession();
        deleteCategory.mutate(id, {
            onSuccess: () => {
                toast({
                    title: t('categories.backoffice.deleted'),
                    description: t('categories.backoffice.deletedDescription'),
                    variant: 'destructive'
                });
                refetch();
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('categories.backoffice.deleteError'),
                    variant: 'destructive'
                });
            }
        });
    };

    const missingSeedCount = useMemo(
        () => countMissingDefaultCategories(categories ?? []),
        [categories]
    );

    const handleSeed = () => {
        seedCategories.mutate(undefined, {
            onSuccess: (count) => {
                toast({
                    title: t('toast.success'),
                    description:
                        count > 0
                            ? t('categories.backoffice.seedSuccess', { count })
                            : t('categories.backoffice.seedNothingToImport'),
                });
                refetch();
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('categories.backoffice.seedError'),
                    variant: 'destructive'
                });
            }
        });
    };

    const isEmpty = !categories?.length && !isLoading;
    const sortDisabled = reorderCategories.isPending;

    return (
        <PrivateLayout>
            <PageShell
                className="flex flex-col min-h-[calc(100vh-7rem)]"
                title={t('categories.backoffice.title')}
                description={t('categories.backoffice.description')}
                actions={
                    <div className="flex flex-wrap gap-2">
                        {missingSeedCount > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleSeed}
                                disabled={seedCategories.isPending}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {isEmpty
                                    ? t('categories.backoffice.seed')
                                    : t('categories.backoffice.seedMissing', {
                                          count: missingSeedCount,
                                      })}
                            </Button>
                        )}
                        <Button onClick={() => navigate('/backoffice/category/')}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('categories.backoffice.new')}
                        </Button>
                    </div>
                }
            >
                <div
                    className={cn(
                        'grid flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 lg:gap-5',
                        isLoading && 'animate-pulse'
                    )}
                >
                    {!isEmpty &&
                        SECTIONS.map((config) => (
                            <CategorySection
                                key={config.type}
                                config={config}
                                categories={orderedSections[config.type]}
                                inlineSession={inlineSession}
                                sortDisabled={sortDisabled}
                                missingSeedCount={
                                    getMissingDefaultCategorySeeds(categories ?? []).filter(
                                        (item) => item.type === config.type
                                    ).length
                                }
                                onSeed={handleSeed}
                                seedPending={seedCategories.isPending}
                                onOpenEdit={openInlineEdit}
                                onDraftChange={handleDraftChange}
                                onCancelEdit={clearInlineSession}
                                onSaved={handleInlineSaved}
                                onDelete={handleDelete}
                                onReorder={handleReorder}
                            />
                        ))}

                    {isEmpty && (
                        <div className="col-span-full flex flex-col items-center gap-4 text-muted-foreground py-12 rounded-xl border border-dashed border-border/80">
                            <div className="flex items-center gap-2">
                                <EmptyIcon className="w-6 h-6" />
                                {t('categories.backoffice.empty')}
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleSeed}
                                disabled={seedCategories.isPending}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {t('categories.backoffice.seed')}
                            </Button>
                        </div>
                    )}
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default CategoriesPage;
