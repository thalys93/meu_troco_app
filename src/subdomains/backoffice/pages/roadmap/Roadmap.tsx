import React from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { RoadmapVerticalTimeline } from '@/components/roadmap/RoadmapVerticalTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import type { Priority, RankLocale, RoadmapItem, RoadmapPhase, RoadmapQuarter, RoadmapStatus, RoadmapYear } from '@/types/backoffice';
import { getRoadmapItemLocalized } from '@/types/backoffice';
import { useGetActiveRoadmapCatalog } from '@/utils/services/api/roadmap-catalog-service';
import {
    useCreateRoadmapItem,
    useGetRoadmapItems,
    useUpdateRoadmapItem,
} from '@/utils/services/api/roadmap-service';
import { buildRoadmapTimelineTree } from '@/utils/roadmap/catalog-utils';
import {
    formatRoadmapPhaseDisplayName,
    formatRoadmapQuarterLabel,
    resolveRoadmapPhaseLabel,
    translateRoadmapPriority,
    translateRoadmapStatus,
} from '@/utils/roadmap/roadmap-i18n';
import { cn } from '@/lib/utils';
import { Edit, GripVertical, Save, Trash2, X } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EntityActionsMenu, type ActionMenuItem } from '@/components/EntityActionsMenu';
import {
    buildItemPayloadFromLocalized,
    emptyRoadmapItemLocalized,
    getPrimaryItemTitle,
    roadmapItemToFormLocalized,
    ROADMAP_ITEM_FORM_LOCALES,
    updateItemLocalizedEntry,
} from '@/utils/roadmap/item-form-shared';

type RoadmapColumnStatus = Exclude<RoadmapStatus, 'archived'>;
type ViewMode = 'kanban' | 'timeline';

type EnrichedRoadmapItem = RoadmapItem & {
    phaseName: string;
    quarterLabel: string;
};

const columns: RoadmapColumnStatus[] = ['planned', 'in_progress', 'done'];

const initialCatalogForm = {
    status: 'planned' as RoadmapStatus,
    priority: 'medium' as Priority,
    yearId: '',
    quarterId: '',
    phaseId: '',
};

function enrichItem(
    item: RoadmapItem,
    phases: RoadmapPhase[],
    quarters: RoadmapQuarter[],
    years: RoadmapYear[],
    lang: string,
    t: TFunction,
): EnrichedRoadmapItem {
    const phase = phases.find((entry) => entry.id === item.phaseId);
    const quarter = quarters.find((entry) => entry.id === phase?.quarterId);
    const year = years.find((entry) => entry.id === quarter?.yearId);
    const quarterLabel = quarter && year
        ? formatRoadmapQuarterLabel(t, year.year, quarter.quarter)
        : item.quarter ?? t('roadmap.noQuarter');
    const localizedItem = getRoadmapItemLocalized(item, lang);

    return {
        ...item,
        title: localizedItem.title,
        description: localizedItem.description ?? '',
        phaseName: phase
            ? resolveRoadmapPhaseLabel(phase, lang, t)
            : formatRoadmapPhaseDisplayName(item.phase ?? '', t),
        quarterLabel,
    };
}

function RoadmapCard({
    item,
    onEdit,
    onDelete,
}: {
    item: EnrichedRoadmapItem;
    onEdit: (item: RoadmapItem) => void;
    onDelete: (item: RoadmapItem) => void;
}) {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id ?? item.title,
        data: { status: item.status },
    });

    const actionItems = React.useMemo<ActionMenuItem[]>(
        () => [
            {
                id: 'edit',
                label: t('default.edit'),
                icon: <Edit className="h-4 w-4" />,
                onSelect: () => onEdit(item),
            },
            {
                id: 'delete',
                label: t('transactionList.delete'),
                icon: <Trash2 className="h-4 w-4" />,
                onSelect: () => onDelete(item),
                destructive: true,
            },
        ],
        [item, onDelete, onEdit, t]
    );

    const card = (
        <article
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform) }}
            className={cn('rounded-xl border border-border/70 bg-card p-4 shadow-sm space-y-3', isDragging && 'opacity-70')}
        >
            <div className="flex items-start justify-between gap-2">
                <button type="button" className="mt-1 text-muted-foreground cursor-grab" {...listeners} {...attributes}>
                    <GripVertical className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{item.quarterLabel}</Badge>
                {item.phaseName && <Badge variant="secondary">{item.phaseName}</Badge>}
                <Badge variant="secondary">{translateRoadmapPriority(t, item.priority)}</Badge>
            </div>
        </article>
    );

    return (
        <EntityActionsMenu items={actionItems} menuLabel={t('transactionList.actions')}>
            {card}
        </EntityActionsMenu>
    );
}

function RoadmapColumn({
    status,
    items,
    onEdit,
    onDelete,
}: {
    status: RoadmapColumnStatus;
    items: EnrichedRoadmapItem[];
    onEdit: (item: RoadmapItem) => void;
    onDelete: (item: RoadmapItem) => void;
}) {
    const { t } = useTranslation();
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <section ref={setNodeRef} className={cn('bo-surface p-4 min-h-[360px] space-y-3', isOver && 'ring-2 ring-primary/40')}>
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">{translateRoadmapStatus(t, status)}</h2>
                <Badge variant="outline">{items.length}</Badge>
            </div>
            {items.map((item) => (
                <RoadmapCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </section>
    );
}

function RoadmapPage() {
    const { t, i18n } = useTranslation();
    const { data: items = [], isLoading: itemsLoading } = useGetRoadmapItems();
    const { data: catalog, isLoading: catalogLoading } = useGetActiveRoadmapCatalog();
    const createItem = useCreateRoadmapItem();
    const updateItem = useUpdateRoadmapItem();
    const [editing, setEditing] = React.useState<RoadmapItem | null>(null);
    const [catalogForm, setCatalogForm] = React.useState(initialCatalogForm);
    const [itemContentLocale, setItemContentLocale] = React.useState<RankLocale>('pt');
    const [itemLocalized, setItemLocalized] = React.useState(emptyRoadmapItemLocalized);
    const [viewMode, setViewMode] = React.useState<ViewMode>('kanban');

    const years = catalog?.years ?? [];
    const quarters = catalog?.quarters ?? [];
    const phases = catalog?.phases ?? [];

    const enrichedItems = React.useMemo(
        () => items.map((item) => enrichItem(item, phases, quarters, years, i18n.language, t)),
        [items, phases, quarters, years, i18n.language, t],
    );

    const formYear = years.find((year) => year.id === catalogForm.yearId)?.year;
    const primaryItemTitle = getPrimaryItemTitle(itemLocalized);

    const visibleItems = React.useMemo(
        () => enrichedItems.filter((item) => item.status !== 'archived'),
        [enrichedItems],
    );

    const timelineTree = React.useMemo(
        () => buildRoadmapTimelineTree({ years, quarters, phases, items, lang: i18n.language }),
        [years, quarters, phases, items, i18n.language],
    );

    const currentPhase = phases.find((phase) => phase.isCurrent);
    const currentQuarter = currentPhase
        ? quarters.find((quarter) => quarter.id === currentPhase.quarterId)
        : undefined;
    const currentYear = currentQuarter
        ? years.find((year) => year.id === currentQuarter.yearId)
        : undefined;

    const formQuarters = quarters.filter((quarter) => quarter.yearId === catalogForm.yearId);
    const formPhases = phases.filter((phase) => phase.quarterId === catalogForm.quarterId);

    const updateItemLocalized = (locale: RankLocale, patch: { title?: string; description?: string }) => {
        setItemLocalized((current) => updateItemLocalizedEntry(current, locale, patch));
    };

    const isLoading = itemsLoading || catalogLoading;

    const resetForm = () => {
        setEditing(null);
        setCatalogForm(initialCatalogForm);
        setItemLocalized(emptyRoadmapItemLocalized());
        setItemContentLocale('pt');
    };

    const startEdit = (item: RoadmapItem) => {
        const phase = phases.find((entry) => entry.id === item.phaseId);
        const quarter = quarters.find((entry) => entry.id === phase?.quarterId);
        setEditing(item);
        setCatalogForm({
            status: item.status,
            priority: item.priority,
            yearId: quarter?.yearId ?? '',
            quarterId: phase?.quarterId ?? '',
            phaseId: item.phaseId,
        });
        setItemLocalized(roadmapItemToFormLocalized(item));
        setItemContentLocale('pt');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!catalogForm.phaseId) {
            toast({
                title: t('toast.error'),
                description: t('roadmap.catalog.phaseRequired'),
                variant: 'destructive',
            });
            return;
        }

        const localizedPayload = buildItemPayloadFromLocalized(itemLocalized);
        if (localizedPayload.title.length < 2) {
            toast({
                title: t('toast.error'),
                description: t('roadmap.itemTitleRequired'),
                variant: 'destructive',
            });
            return;
        }

        const payload: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt'> = {
            ...localizedPayload,
            status: catalogForm.status,
            priority: catalogForm.priority,
            phaseId: catalogForm.phaseId,
            order: editing?.order ?? items.length + 1,
        };

        try {
            if (editing?.id) {
                await updateItem.mutateAsync({ ...payload, id: editing.id });
            } else {
                await createItem.mutateAsync(payload);
            }

            toast({ title: t('toast.success'), description: t('roadmap.saved') });
            resetForm();
        } catch {
            toast({
                title: t('toast.error'),
                description: t('roadmap.saveError'),
                variant: 'destructive',
            });
        }
    };

    const handleDelete = (item: RoadmapItem) => {
        if (!item.id) return;
        updateItem.mutate({ ...item, status: 'archived' }, {
            onSuccess: () => toast({ title: t('toast.success'), description: t('roadmap.archived') }),
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const overStatus = event.over?.id as RoadmapColumnStatus | undefined;
        const itemId = event.active.id as string;
        if (!overStatus || !columns.includes(overStatus)) return;
        const item = items.find((current) => current.id === itemId);
        if (!item || item.status === overStatus) return;
        updateItem.mutate({ ...item, status: overStatus });
    };

    const handleTimelineEdit = (itemId: string) => {
        const item = items.find((entry) => entry.id === itemId);
        if (item) startEdit(item);
    };

    const handleTimelineDelete = (itemId: string) => {
        const item = items.find((entry) => entry.id === itemId);
        if (item) handleDelete(item);
    };

    return (
        <PrivateLayout>
            <PageShell
                title={t('roadmap.title')}
                description={t('roadmap.description')}
                eyebrow={t('sidebar.roadmap')}
            >
                <div className="space-y-6">
                    {years.length === 0 && !isLoading && (
                        <div className="bo-surface p-4 text-sm text-muted-foreground">
                            {t('roadmap.catalog.setupHint')}{' '}
                            <Link to="/backoffice/roadmap-catalog" className="text-primary hover:underline">
                                {t('sidebar.roadmapCatalog')}
                            </Link>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,2fr)_minmax(320px,3fr)] gap-6 items-start">
                        {!isLoading ? (
                            <RoadmapVerticalTimeline
                                tree={timelineTree}
                                variant="admin"
                                onEditItem={handleTimelineEdit}
                                onDeleteItem={handleTimelineDelete}
                                className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
                            />
                        ) : (
                            <div className="bo-surface h-64 animate-pulse" />
                        )}

                        <form onSubmit={handleSubmit} className="bo-surface p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-semibold">{editing ? t('default.edit') : t('default.add')}</h2>
                            {editing && (
                                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                    {t('default.cancel')}
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label>{t('roadmap.itemByLanguage')}</Label>
                            <Tabs value={itemContentLocale} onValueChange={(value) => setItemContentLocale(value as RankLocale)}>
                                <TabsList className="bg-muted/50 w-full sm:w-auto">
                                    {ROADMAP_ITEM_FORM_LOCALES.map((locale) => (
                                        <TabsTrigger key={locale} value={locale} className="flex-1 sm:flex-none">
                                            {t(`categories.backoffice.language.${locale}`)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {ROADMAP_ITEM_FORM_LOCALES.map((locale) => (
                                    <TabsContent key={locale} value={locale} className="space-y-3 mt-3">
                                        <div className="space-y-2">
                                            <Label>
                                                {t('roadmap.fieldTitle')}
                                                {locale === 'pt' ? ' *' : ''}
                                            </Label>
                                            <Input
                                                name={`roadmapTitle-${locale}`}
                                                value={itemLocalized[locale]?.title ?? ''}
                                                onChange={(event) => updateItemLocalized(locale, { title: event.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('roadmap.fieldDescription')}</Label>
                                            <TextArea
                                                name={`description-${locale}`}
                                                value={itemLocalized[locale]?.description ?? ''}
                                                onChange={(event) => updateItemLocalized(locale, { description: event.target.value })}
                                                rows={4}
                                                className="min-h-[120px] resize-y"
                                            />
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>{t('roadmap.catalog.year')}</Label>
                                <Select
                                    value={catalogForm.yearId}
                                    onValueChange={(value) => setCatalogForm((current) => ({ ...current, yearId: value, quarterId: '', phaseId: '' }))}
                                >
                                    <SelectTrigger><SelectValue placeholder={t('roadmap.catalog.selectYear')} /></SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year.id} value={year.id!}>{year.year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('roadmap.fieldQuarter')}</Label>
                                <Select
                                    value={catalogForm.quarterId}
                                    onValueChange={(value) => setCatalogForm((current) => ({ ...current, quarterId: value, phaseId: '' }))}
                                    disabled={!catalogForm.yearId}
                                >
                                    <SelectTrigger><SelectValue placeholder={t('roadmap.catalog.selectQuarter')} /></SelectTrigger>
                                    <SelectContent>
                                        {formQuarters.map((quarter) => (
                                            <SelectItem key={quarter.id} value={quarter.id!}>
                                                {formYear
                                                    ? formatRoadmapQuarterLabel(t, formYear, quarter.quarter)
                                                    : quarter.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('roadmap.fieldPhase')}</Label>
                                <Select
                                    value={catalogForm.phaseId}
                                    onValueChange={(value) => setCatalogForm((current) => ({ ...current, phaseId: value }))}
                                    disabled={!catalogForm.quarterId}
                                >
                                    <SelectTrigger><SelectValue placeholder={t('roadmap.catalog.selectPhase')} /></SelectTrigger>
                                    <SelectContent>
                                        {formPhases.map((phase) => (
                                            <SelectItem key={phase.id} value={phase.id!}>
                                                {resolveRoadmapPhaseLabel(phase, i18n.language, t)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('roadmap.fieldStatus')}</Label>
                                <Select value={catalogForm.status} onValueChange={(value) => setCatalogForm((current) => ({ ...current, status: value as RoadmapStatus }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">{translateRoadmapStatus(t, 'planned')}</SelectItem>
                                        <SelectItem value="in_progress">{translateRoadmapStatus(t, 'in_progress')}</SelectItem>
                                        <SelectItem value="done">{translateRoadmapStatus(t, 'done')}</SelectItem>
                                        <SelectItem value="archived">{translateRoadmapStatus(t, 'archived')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('roadmap.fieldPriority')}</Label>
                                <Select value={catalogForm.priority} onValueChange={(value) => setCatalogForm((current) => ({ ...current, priority: value as Priority }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">{translateRoadmapPriority(t, 'low')}</SelectItem>
                                        <SelectItem value="medium">{translateRoadmapPriority(t, 'medium')}</SelectItem>
                                        <SelectItem value="high">{translateRoadmapPriority(t, 'high')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createItem.isPending || updateItem.isPending || !primaryItemTitle.trim()}>
                                <Save className="h-4 w-4" />
                                {t('default.save')}
                            </Button>
                        </div>
                    </form>
                    </div>

                    {currentPhase && (
                        <div className="bo-surface flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
                            <Badge>{t('roadmap.currentPhaseBadge')}</Badge>
                            <span className="font-medium">{resolveRoadmapPhaseLabel(currentPhase, i18n.language, t)}</span>
                            {currentQuarter && currentYear && (
                                <span className="text-muted-foreground">
                                    · {formatRoadmapQuarterLabel(t, currentYear.year, currentQuarter.quarter)}
                                </span>
                            )}
                        </div>
                    )}

                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                        <TabsList>
                            <TabsTrigger value="kanban">{t('roadmap.view.kanban')}</TabsTrigger>
                            <TabsTrigger value="timeline">{t('roadmap.view.timeline')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {isLoading && <div className="bo-surface h-64 animate-pulse" />}

                    {!isLoading && viewMode === 'kanban' && (
                        <DndContext onDragEnd={handleDragEnd}>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                                {columns.map((status) => (
                                    <RoadmapColumn
                                        key={status}
                                        status={status}
                                        items={visibleItems.filter((item) => item.status === status)}
                                        onEdit={startEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </DndContext>
                    )}

                    {!isLoading && viewMode === 'timeline' && (
                        <RoadmapTimeline
                            tree={timelineTree}
                            variant="admin"
                            onEditItem={handleTimelineEdit}
                            onDeleteItem={handleTimelineDelete}
                        />
                    )}
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default RoadmapPage;
