import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { RankLocale, RoadmapPhase, RoadmapQuarter, RoadmapYear } from '@/types/backoffice';
import {
    useArchiveRoadmapPhase,
    useArchiveRoadmapQuarter,
    useArchiveRoadmapYear,
    useCreateRoadmapPhase,
    useCreateYearWithQuarters,
    useDeleteRoadmapYearPermanently,
    useGetRoadmapPhases,
    useGetRoadmapQuarters,
    useGetRoadmapYears,
    useSetCurrentPhase,
    useUpdateRoadmapPhase,
} from '@/utils/services/api/roadmap-catalog-service';
import { useGetRoadmapItemsRaw } from '@/utils/services/api/roadmap-service';
import { sortQuarters, sortYears } from '@/utils/roadmap/catalog-utils';
import {
    formatRoadmapQuarterLabel,
    formatRoadmapQuarterShort,
    resolveRoadmapPhaseLabel,
} from '@/utils/roadmap/roadmap-i18n';
import {
    buildPhasePayloadFromLocalized,
    emptyRoadmapPhaseLocalized,
    getPrimaryPhaseName,
    roadmapPhaseToFormLocalized,
    ROADMAP_PHASE_FORM_LOCALES,
    updatePhaseLocalizedEntry,
} from '@/utils/roadmap/phase-form-shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Archive, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function RoadmapCatalogPage() {
    const { t, i18n } = useTranslation();
    const { data: years = [], isLoading: yearsLoading } = useGetRoadmapYears();
    const { data: quarters = [] } = useGetRoadmapQuarters();
    const { data: phases = [] } = useGetRoadmapPhases();
    const { data: items = [] } = useGetRoadmapItemsRaw();

    const createYear = useCreateYearWithQuarters();
    const createPhase = useCreateRoadmapPhase();
    const updatePhase = useUpdateRoadmapPhase();
    const archiveYear = useArchiveRoadmapYear();
    const deleteYear = useDeleteRoadmapYearPermanently();
    const archiveQuarter = useArchiveRoadmapQuarter();
    const archivePhase = useArchiveRoadmapPhase();
    const setCurrentPhase = useSetCurrentPhase();

    const [newYear, setNewYear] = React.useState(String(new Date().getFullYear()));
    const [selectedYearId, setSelectedYearId] = React.useState<string | null>(null);
    const [selectedQuarterId, setSelectedQuarterId] = React.useState<string | null>(null);
    const [selectedPhaseId, setSelectedPhaseId] = React.useState<string | null>(null);
    const [phaseContentLocale, setPhaseContentLocale] = React.useState<RankLocale>('pt');
    const [phaseForm, setPhaseForm] = React.useState(emptyRoadmapPhaseLocalized);
    const [deleteYearDialogOpen, setDeleteYearDialogOpen] = React.useState(false);

    const catalogYears = React.useMemo(
        () => [...years].sort(sortYears),
        [years],
    );

    const yearQuarters = React.useMemo(() => {
        if (!selectedYearId) return [];
        return quarters
            .filter((quarter) => quarter.yearId === selectedYearId)
            .sort(sortQuarters);
    }, [quarters, selectedYearId]);

    const quarterPhases = React.useMemo(() => {
        if (!selectedQuarterId) return [];
        return phases
            .filter((phase) => phase.quarterId === selectedQuarterId)
            .sort((left, right) => left.order - right.order);
    }, [phases, selectedQuarterId]);

    const selectedYearPhaseIds = React.useMemo(() => {
        if (!selectedYearId) return new Set<string>();
        const quarterIds = yearQuarters.map((quarter) => quarter.id!).filter(Boolean);
        return new Set(
            phases
                .filter((phase) => quarterIds.includes(phase.quarterId))
                .map((phase) => phase.id!)
                .filter(Boolean),
        );
    }, [phases, selectedYearId, yearQuarters]);

    const selectedYearLinkedItemsCount = React.useMemo(
        () => items.filter(
            (item) => item.phaseId && selectedYearPhaseIds.has(item.phaseId) && item.status !== 'archived',
        ).length,
        [items, selectedYearPhaseIds],
    );

    const selectedPhase = quarterPhases.find((phase) => phase.id === selectedPhaseId);

    React.useEffect(() => {
        if (selectedYearId && !years.some((year) => year.id === selectedYearId)) {
            setSelectedYearId(null);
            setSelectedQuarterId(null);
            setSelectedPhaseId(null);
        }
    }, [years, selectedYearId]);

    React.useEffect(() => {
        if (!selectedYearId && catalogYears[0]?.id) {
            setSelectedYearId(catalogYears[0].id!);
        }
    }, [catalogYears, selectedYearId]);

    React.useEffect(() => {
        if (!selectedQuarterId && yearQuarters[0]?.id) {
            setSelectedQuarterId(yearQuarters[0].id!);
        }
    }, [selectedQuarterId, yearQuarters]);

    React.useEffect(() => {
        if (selectedPhase) {
            setPhaseForm(roadmapPhaseToFormLocalized(selectedPhase));
            setPhaseContentLocale('pt');
        } else {
            setPhaseForm(emptyRoadmapPhaseLocalized());
            setPhaseContentLocale('pt');
        }
    }, [selectedPhase]);

    const primaryPhaseName = getPrimaryPhaseName(phaseForm);

    const updatePhaseLocalized = (locale: RankLocale, patch: { name?: string; description?: string }) => {
        setPhaseForm((current) => updatePhaseLocalizedEntry(current, locale, patch));
    };

    const countItemsForPhase = (phaseId?: string) =>
        items.filter((item) => item.phaseId === phaseId && item.status !== 'archived').length;

    const getYearLabel = (year: RoadmapYear) => {
        const duplicateCount = catalogYears.filter((entry) => entry.year === year.year).length;
        const suffix = duplicateCount > 1 ? ` · ${year.id!.slice(-4)}` : '';
        return `${year.year}${suffix}`;
    };

    const selectedCatalogYear = catalogYears.find((year) => year.id === selectedYearId);
    const selectedYearLabel = selectedCatalogYear ? getYearLabel(selectedCatalogYear) : '';

    const handleDeleteYear = () => {
        if (!selectedYearId) return;

        deleteYear.mutate(selectedYearId, {
            onSuccess: () => {
                setDeleteYearDialogOpen(false);
                setSelectedYearId(null);
                setSelectedQuarterId(null);
                setSelectedPhaseId(null);
                toast({ title: t('toast.success'), description: t('roadmap.catalog.yearDeleted') });
            },
            onError: (error) => {
                const hasItems = error instanceof Error && error.message === 'YEAR_HAS_ITEMS';
                const itemCount = hasItems
                    ? (error as Error & { itemCount?: number }).itemCount ?? selectedYearLinkedItemsCount
                    : 0;
                const description = hasItems
                    ? t('roadmap.catalog.yearDeleteBlocked', { count: itemCount })
                    : t('roadmap.catalog.yearDeleteError');
                toast({ title: t('toast.error'), description, variant: 'destructive' });
            },
        });
    };

    const handleCreateYear = () => {
        const yearValue = Number(newYear);
        if (!Number.isInteger(yearValue) || yearValue < 2000 || yearValue > 2100) {
            toast({ title: t('toast.error'), description: t('roadmap.catalog.invalidYear'), variant: 'destructive' });
            return;
        }

        createYear.mutate(yearValue, {
            onSuccess: () => {
                toast({ title: t('toast.success'), description: t('roadmap.catalog.yearCreated') });
                setNewYear(String(yearValue + 1));
            },
            onError: (error) => {
                const message = error instanceof Error && error.message === 'YEAR_ALREADY_EXISTS'
                    ? t('roadmap.catalog.yearExists')
                    : t('roadmap.catalog.yearCreateError');
                toast({ title: t('toast.error'), description: message, variant: 'destructive' });
            },
        });
    };

    const handleCreatePhase = () => {
        if (!selectedQuarterId) return;

        const payload = buildPhasePayloadFromLocalized(phaseForm);
        if (payload.name.length < 2) {
            toast({
                title: t('toast.error'),
                description: t('roadmap.catalog.phaseNameRequired'),
                variant: 'destructive',
            });
            return;
        }

        createPhase.mutate({
            quarterId: selectedQuarterId,
            ...payload,
            isCurrent: false,
            status: 'active',
            order: quarterPhases.length + 1,
        }, {
            onSuccess: (phaseId) => {
                toast({ title: t('toast.success'), description: t('roadmap.catalog.phaseCreated') });
                setSelectedPhaseId(phaseId);
            },
        });
    };

    const handleSavePhase = () => {
        if (!selectedPhase?.id) return;

        const payload = buildPhasePayloadFromLocalized(phaseForm);
        if (payload.name.length < 2) {
            toast({
                title: t('toast.error'),
                description: t('roadmap.catalog.phaseNameRequired'),
                variant: 'destructive',
            });
            return;
        }

        updatePhase.mutate({
            ...selectedPhase,
            ...payload,
        }, {
            onSuccess: () => toast({ title: t('toast.success'), description: t('roadmap.catalog.phaseSaved') }),
        });
    };

    const handleToggleCurrent = (phase: RoadmapPhase, checked: boolean) => {
        if (!phase.id) return;
        if (!checked) return;

        setCurrentPhase.mutate(phase.id, {
            onSuccess: () => toast({ title: t('toast.success'), description: t('roadmap.catalog.currentPhaseSet') }),
        });
    };

    const renderListButton = (
        label: string,
        isSelected: boolean,
        onClick: () => void,
        badge?: React.ReactNode,
    ) => (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors flex items-center justify-between gap-2',
                isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 hover:bg-muted/40',
            )}
        >
            <span className="font-medium truncate">{label}</span>
            {badge}
        </button>
    );

    return (
        <PrivateLayout>
            <PageShell
                title={t('roadmap.catalog.title')}
                description={t('roadmap.catalog.description')}
                eyebrow={t('sidebar.roadmap')}
            >
                <div className="space-y-4">
                    <div className="bo-surface p-4 flex flex-col sm:flex-row gap-3 items-end">
                        <div className="space-y-2 flex-1">
                            <Label>{t('roadmap.catalog.addYear')}</Label>
                            <Input
                                type="number"
                                min={2000}
                                max={2100}
                                value={newYear}
                                onChange={(event) => setNewYear(event.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreateYear} disabled={createYear.isPending}>
                            <Plus className="h-4 w-4" />
                            {t('roadmap.catalog.createYear')}
                        </Button>
                    </div>

                    {yearsLoading && <div className="bo-surface h-64 animate-pulse" />}

                    {!yearsLoading && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <section className="bo-surface p-4 space-y-3">
                                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                    {t('roadmap.catalog.years')}
                                </h2>
                                <div className="space-y-2">
                                    {catalogYears.map((year: RoadmapYear) => renderListButton(
                                        getYearLabel(year),
                                        selectedYearId === year.id,
                                        () => {
                                            setSelectedYearId(year.id!);
                                            setSelectedQuarterId(null);
                                            setSelectedPhaseId(null);
                                        },
                                        <div className="flex items-center gap-1">
                                            {year.status === 'archived' && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {t('roadmap.catalog.archived')}
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="text-[10px]">{t('roadmap.catalog.quartersBadge')}</Badge>
                                        </div>,
                                    ))}
                                    {catalogYears.length === 0 && (
                                        <p className="text-sm text-muted-foreground">{t('roadmap.catalog.noYears')}</p>
                                    )}
                                </div>
                                {selectedYearId && (
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => archiveYear.mutate(selectedYearId, {
                                                onSuccess: () => {
                                                    toast({ title: t('toast.success'), description: t('roadmap.catalog.yearArchived') });
                                                },
                                            })}
                                        >
                                            <Archive className="h-4 w-4" />
                                            {t('roadmap.catalog.archiveYear')}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setDeleteYearDialogOpen(true)}
                                            disabled={deleteYear.isPending || selectedYearLinkedItemsCount > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {t('roadmap.catalog.deleteYear')}
                                        </Button>
                                        {selectedYearLinkedItemsCount > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {t('roadmap.catalog.yearDeleteBlocked', { count: selectedYearLinkedItemsCount })}
                                            </p>
                                        )}
                                        <Dialog open={deleteYearDialogOpen} onOpenChange={setDeleteYearDialogOpen}>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{t('roadmap.catalog.deleteYearConfirmTitle')}</DialogTitle>
                                                    <DialogDescription>
                                                        {t('roadmap.catalog.deleteYearConfirm', { year: selectedYearLabel })}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">{t('default.cancel')}</Button>
                                                    </DialogClose>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={handleDeleteYear}
                                                        disabled={deleteYear.isPending}
                                                    >
                                                        {t('transactionList.delete')}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </section>

                            <section className="bo-surface p-4 space-y-3">
                                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                    {t('roadmap.catalog.quarters')}
                                </h2>
                                <div className="space-y-2">
                                    {yearQuarters.map((quarter: RoadmapQuarter) => renderListButton(
                                        selectedCatalogYear
                                            ? formatRoadmapQuarterLabel(t, selectedCatalogYear.year, quarter.quarter)
                                            : quarter.label,
                                        selectedQuarterId === quarter.id,
                                        () => {
                                            setSelectedQuarterId(quarter.id!);
                                            setSelectedPhaseId(null);
                                        },
                                        <Badge variant="outline" className="text-[10px]">
                                            {formatRoadmapQuarterShort(t, quarter.quarter)}
                                        </Badge>,
                                    ))}
                                    {selectedYearId && yearQuarters.length === 0 && (
                                        <p className="text-sm text-muted-foreground">{t('roadmap.catalog.noQuarters')}</p>
                                    )}
                                </div>
                                {selectedQuarterId && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => archiveQuarter.mutate(selectedQuarterId, {
                                            onSuccess: () => {
                                                setSelectedQuarterId(null);
                                                toast({ title: t('toast.success'), description: t('roadmap.catalog.quarterArchived') });
                                            },
                                        })}
                                    >
                                        <Archive className="h-4 w-4" />
                                        {t('roadmap.catalog.archiveQuarter')}
                                    </Button>
                                )}
                            </section>

                            <section className="bo-surface p-4 space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                        {t('roadmap.catalog.phases')}
                                    </h2>
                                    <Button size="sm" variant="outline" onClick={handleCreatePhase} disabled={!selectedQuarterId || !primaryPhaseName.trim()}>
                                        <Plus className="h-4 w-4" />
                                        {t('default.add')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {quarterPhases.map((phase) => renderListButton(
                                        resolveRoadmapPhaseLabel(phase, i18n.language, t),
                                        selectedPhaseId === phase.id,
                                        () => setSelectedPhaseId(phase.id!),
                                        <div className="flex items-center gap-1">
                                            {phase.isCurrent && <Badge className="text-[10px]">{t('roadmap.currentPhaseShort')}</Badge>}
                                            <Badge variant="outline" className="text-[10px]">{countItemsForPhase(phase.id)}</Badge>
                                        </div>,
                                    ))}
                                    {selectedQuarterId && quarterPhases.length === 0 && (
                                        <p className="text-sm text-muted-foreground">{t('roadmap.catalog.noPhases')}</p>
                                    )}
                                </div>

                                {selectedQuarterId && (
                                    <div className="space-y-3 border-t border-border/60 pt-4">
                                        <div className="space-y-3">
                                            <Label>{t('roadmap.catalog.phaseByLanguage')}</Label>
                                            <Tabs value={phaseContentLocale} onValueChange={(value) => setPhaseContentLocale(value as RankLocale)}>
                                                <TabsList className="bg-muted/50 w-full">
                                                    {ROADMAP_PHASE_FORM_LOCALES.map((locale) => (
                                                        <TabsTrigger key={locale} value={locale} className="flex-1">
                                                            {t(`categories.backoffice.language.${locale}`)}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                                {ROADMAP_PHASE_FORM_LOCALES.map((locale) => (
                                                    <TabsContent key={locale} value={locale} className="space-y-3 mt-3">
                                                        <div className="space-y-2">
                                                            <Label>
                                                                {t('roadmap.fieldPhase')}
                                                                {locale === 'pt' ? ' *' : ''}
                                                            </Label>
                                                            <Input
                                                                value={phaseForm[locale]?.name ?? ''}
                                                                onChange={(event) => updatePhaseLocalized(locale, { name: event.target.value })}
                                                                placeholder={t('roadmap.fieldPhasePlaceholder')}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>{t('roadmap.fieldDescription')}</Label>
                                                            <TextArea
                                                                value={phaseForm[locale]?.description ?? ''}
                                                                onChange={(event) => updatePhaseLocalized(locale, { description: event.target.value })}
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </TabsContent>
                                                ))}
                                            </Tabs>
                                        </div>

                                        {selectedPhase && (
                                            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                                                <Label htmlFor="phase-current">{t('roadmap.fieldIsCurrentPhase')}</Label>
                                                <Switch
                                                    id="phase-current"
                                                    checked={selectedPhase.isCurrent}
                                                    onCheckedChange={(checked) => handleToggleCurrent(selectedPhase, checked)}
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            {selectedPhase ? (
                                                <>
                                                    <Button className="flex-1" onClick={handleSavePhase} disabled={updatePhase.isPending}>
                                                        <Save className="h-4 w-4" />
                                                        {t('default.save')}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => archivePhase.mutate(selectedPhase.id!, {
                                                            onSuccess: () => {
                                                                setSelectedPhaseId(null);
                                                                toast({ title: t('toast.success'), description: t('roadmap.catalog.phaseArchived') });
                                                            },
                                                        })}
                                                    >
                                                        <Archive className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button className="w-full" onClick={handleCreatePhase} disabled={createPhase.isPending || !primaryPhaseName.trim()}>
                                                    <Plus className="h-4 w-4" />
                                                    {t('roadmap.catalog.createPhase')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default RoadmapCatalogPage;
