import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import type { RankCriterion, RankCriterionMetric, RankLocale, RankTier, RecordStatus } from '@/types/backoffice';
import { getRankLocalized } from '@/types/backoffice';
import {
    countMissingDefaultRanks,
    useCreateRankTier,
    useDeleteRankTier,
    useGetRankTiers,
    useSeedDefaultRanks,
    useUpdateRankTier,
} from '@/utils/services/api/goal-templates-service';
import { RANK_CRITERION_METRICS } from '@/constants/rank-criterion-metrics';
import { CATEGORY_ICON_OPTIONS, resolveCategoryIcon } from '@/utils/category-icons';
import {
    RANK_FORM_LOCALES,
    emptyRankLocalized,
    getPrimaryRankTitle,
    updateRankLocalizedEntry,
} from './rank-form-shared';
import { cn } from '@/lib/utils';
import { EmptyIcon } from '@phosphor-icons/react';
import { Download, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

type RankFormCriterion = {
    id: string;
    metric: RankCriterionMetric;
    targetValue: string;
};

type RankFormState = {
    slug: string;
    localized: ReturnType<typeof emptyRankLocalized>;
    level: string;
    icon: string;
    color: string;
    minPoints: string;
    status: RecordStatus;
    criteria: RankFormCriterion[];
};

const DEFAULT_COLOR = '#6366f1';
const DEFAULT_ICON = 'Shield';
const RANK_PANEL_HEIGHT = 'h-[min(680px,calc(100vh-14rem))]';

const createCriterion = (): RankFormCriterion => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    metric: 'transactions_count',
    targetValue: '1',
});

const initialForm: RankFormState = {
    slug: '',
    localized: emptyRankLocalized(),
    level: '1',
    icon: DEFAULT_ICON,
    color: DEFAULT_COLOR,
    minPoints: '0',
    status: 'active',
    criteria: [createCriterion()],
};

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function formatCriterionValue(
    metric: RankCriterionMetric,
    value: number,
    locale: string,
    t: TFunction,
): string {
    if (metric === 'savings_total') {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(value);
    }
    return `${value} ${t(`goalCatalog.criteria.unit.${metric}`, { defaultValue: '' })}`.trim();
}

function RankPreviewBadge({
    title,
    icon,
    color,
    level,
    levelLabel,
}: {
    title: string;
    icon: string;
    color: string;
    level: number;
    levelLabel: string;
}) {
    const Icon = resolveCategoryIcon(icon) ?? resolveCategoryIcon(DEFAULT_ICON);
    const PreviewIcon = Icon!;

    return (
        <div
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3"
            style={{ borderLeftWidth: 4, borderLeftColor: color }}
        >
            <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}22`, color }}
            >
                <PreviewIcon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{levelLabel}</p>
                <p className="font-semibold">{title}</p>
            </div>
        </div>
    );
}

function GoalCatalogPage() {
    const { t, i18n } = useTranslation();
    const { data: tiers = [], isLoading } = useGetRankTiers();
    const createTier = useCreateRankTier();
    const updateTier = useUpdateRankTier();
    const deleteTier = useDeleteRankTier();
    const seedRanks = useSeedDefaultRanks();
    const [editing, setEditing] = React.useState<RankTier | null>(null);
    const [form, setForm] = React.useState<RankFormState>(initialForm);
    const [slugTouched, setSlugTouched] = React.useState(false);
    const [contentLocale, setContentLocale] = React.useState<RankLocale>('pt');

    const sortedTiers = React.useMemo(
        () => [...tiers].sort((left, right) => left.level - right.level),
        [tiers],
    );

    const missingSeedCount = React.useMemo(
        () => countMissingDefaultRanks(tiers),
        [tiers],
    );

    const handleSeed = () => {
        seedRanks.mutate(undefined, {
            onSuccess: (count) => {
                toast({
                    title: t('toast.success'),
                    description: count > 0
                        ? t('goalCatalog.seedSuccess', '{{count}} ranks importados com sucesso.', { count })
                        : t('goalCatalog.seedNothingToImport', 'Todos os ranks padrão já estão importados.'),
                });
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('goalCatalog.seedError', 'Não foi possível importar os ranks padrão.'),
                    variant: 'destructive',
                });
            },
        });
    };

    const activeLocaleContent = form.localized[contentLocale] ?? { title: '', description: '' };
    const previewTitle = activeLocaleContent.title.trim()
        || getPrimaryRankTitle(form.localized)
        || t('goalCatalog.previewPlaceholder', 'Novo rank');

    const resetForm = () => {
        setEditing(null);
        setSlugTouched(false);
        setContentLocale('pt');
        setForm(initialForm);
    };

    const startEdit = (tier: RankTier) => {
        setEditing(tier);
        setSlugTouched(true);
        setContentLocale('pt');
        setForm({
            slug: tier.slug,
            localized: {
                pt: tier.localized.pt ?? { title: '', description: '' },
                en: tier.localized.en ?? { title: '', description: '' },
                es: tier.localized.es ?? { title: '', description: '' },
            },
            level: String(tier.level),
            icon: tier.icon,
            color: tier.color,
            minPoints: String(tier.minPoints),
            status: tier.status,
            criteria: tier.criteria.length > 0
                ? tier.criteria.map((criterion) => ({
                    id: criterion.id,
                    metric: criterion.metric,
                    targetValue: String(criterion.targetValue),
                }))
                : [createCriterion()],
        });
    };

    const updateLocalized = (locale: RankLocale, patch: { title?: string; description?: string }) => {
        setForm((current) => {
            const localized = updateRankLocalizedEntry(current.localized, locale, patch);
            const shouldSyncSlug = !slugTouched && locale === 'pt' && patch.title !== undefined;
            return {
                ...current,
                localized,
                slug: shouldSyncSlug ? slugify(patch.title ?? '') : current.slug,
            };
        });
    };

    const updateCriterion = (criterionId: string, patch: Partial<RankFormCriterion>) => {
        setForm((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) => (
                criterion.id === criterionId ? { ...criterion, ...patch } : criterion
            )),
        }));
    };

    const addCriterion = () => {
        setForm((current) => ({
            ...current,
            criteria: [...current.criteria, createCriterion()],
        }));
    };

    const removeCriterion = (criterionId: string) => {
        setForm((current) => ({
            ...current,
            criteria: current.criteria.length <= 1
                ? current.criteria
                : current.criteria.filter((criterion) => criterion.id !== criterionId),
        }));
    };

    const buildPayload = (): Omit<RankTier, 'id' | 'createdAt' | 'updatedAt'> => {
        const criteria: RankCriterion[] = form.criteria
            .map((criterion) => ({
                id: criterion.id,
                metric: criterion.metric,
                targetValue: Number(criterion.targetValue) || 0,
            }))
            .filter((criterion) => criterion.targetValue >= 0);

        return {
            slug: form.slug.trim(),
            localized: {
                pt: {
                    title: form.localized.pt?.title.trim() ?? '',
                    description: form.localized.pt?.description.trim() ?? '',
                },
                en: {
                    title: form.localized.en?.title.trim() ?? '',
                    description: form.localized.en?.description.trim() ?? '',
                },
                es: {
                    title: form.localized.es?.title.trim() ?? '',
                    description: form.localized.es?.description.trim() ?? '',
                },
            },
            level: Math.max(1, Number(form.level) || 1),
            icon: form.icon,
            color: form.color,
            minPoints: Math.max(0, Number(form.minPoints) || 0),
            status: form.status,
            criteria: criteria.length > 0 ? criteria : [{
                id: createCriterion().id,
                metric: 'transactions_count' as const,
                targetValue: 1,
            }],
        };
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const ptTitle = form.localized.pt?.title.trim();
        if (!ptTitle || ptTitle.length < 2) {
            setContentLocale('pt');
            toast({
                title: t('toast.error'),
                description: t('goalCatalog.ptTitleRequired', 'Informe o nome do rank em português.'),
                variant: 'destructive',
            });
            return;
        }

        const payload = buildPayload();
        const mutation = editing?.id ? updateTier : createTier;
        const data = editing?.id ? { ...payload, id: editing.id } : payload;

        mutation.mutate(data as RankTier, {
            onSuccess: () => {
                toast({
                    title: t('toast.success'),
                    description: t('goalCatalog.saved', 'Rank salvo com sucesso.'),
                });
                resetForm();
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('goalCatalog.saveError', 'Não foi possível salvar o rank.'),
                    variant: 'destructive',
                });
            },
        });
    };

    const handleDelete = (tier: RankTier) => {
        if (!tier.id) return;
        deleteTier.mutate(tier.id, {
            onSuccess: () => {
                toast({
                    title: t('toast.success'),
                    description: t('goalCatalog.deleted', 'Rank removido com sucesso.'),
                });
                if (editing?.id === tier.id) resetForm();
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('goalCatalog.deleteError', 'Não foi possível remover o rank.'),
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <PrivateLayout>
            <PageShell
                title={t('goalCatalog.title', 'Catálogo de Ranks')}
                description={t('goalCatalog.description', 'Defina os ranks que os usuários podem desbloquear ao atingir critérios financeiros.')}
                eyebrow={t('sidebar.backoffice')}
                actions={missingSeedCount > 0 ? (
                    <Button
                        variant="outline"
                        onClick={handleSeed}
                        disabled={seedRanks.isPending}
                    >
                        <Download className="h-4 w-4" />
                        {sortedTiers.length === 0
                            ? t('goalCatalog.seed', 'Importar ranks padrão')
                            : t('goalCatalog.seedMissing', 'Importar faltantes ({{count}})', { count: missingSeedCount })}
                    </Button>
                ) : undefined}
            >
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6">
                    <form
                        onSubmit={handleSubmit}
                        className={cn('bo-surface flex flex-col', RANK_PANEL_HEIGHT)}
                    >
                        <div className="shrink-0 space-y-4 p-5 pb-0">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-semibold">{editing ? t('default.edit') : t('default.add')}</h2>
                                {editing && (
                                    <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                                        <X className="h-4 w-4" />
                                        {t('default.cancel', 'Cancelar')}
                                    </Button>
                                )}
                            </div>

                            <RankPreviewBadge
                                title={previewTitle}
                                icon={form.icon}
                                color={form.color}
                                level={Number(form.level) || 1}
                                levelLabel={t('goalCatalog.levelBadge', 'Nível {{level}}', { level: Number(form.level) || 1 })}
                            />
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="space-y-6 p-5">
                        <section className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">{t('goalCatalog.sectionIdentity', 'Identidade')}</h3>
                            <div className="space-y-2">
                                <Label>{t('goalCatalog.fieldSlug', 'Slug')}</Label>
                                <Input
                                    name="slug"
                                    value={form.slug}
                                    onChange={(event) => {
                                        setSlugTouched(true);
                                        setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
                                    }}
                                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                    required
                                />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">{t('goalCatalog.sectionContent', 'Conteúdo por idioma')}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{t('goalCatalog.contentHint', 'Cada rank pode ter nome e descrição diferentes por idioma.')}</p>
                            </div>
                            <Tabs value={contentLocale} onValueChange={(value) => setContentLocale(value as RankLocale)} className="w-full">
                                <TabsList className="bg-muted/50 w-full grid grid-cols-3">
                                    {RANK_FORM_LOCALES.map((locale) => (
                                        <TabsTrigger key={locale} value={locale}>
                                            {t(`categories.backoffice.language.${locale}`)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {RANK_FORM_LOCALES.map((locale) => (
                                    <TabsContent key={locale} value={locale} className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>
                                                {t('goalCatalog.fieldTitle', 'Nome do rank')}
                                                {locale === 'pt' ? ' *' : ''}
                                            </Label>
                                            <Input
                                                name={`rankTitle-${locale}`}
                                                value={form.localized[locale]?.title ?? ''}
                                                onChange={(event) => updateLocalized(locale, { title: event.target.value })}
                                                required={locale === 'pt'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('goalCatalog.fieldDescription', 'Descrição')}</Label>
                                            <TextArea
                                                name={`rankDescription-${locale}`}
                                                value={form.localized[locale]?.description ?? ''}
                                                onChange={(event) => updateLocalized(locale, { description: event.target.value })}
                                                placeholder={t('goalCatalog.descriptionPlaceholder', 'O que representa este rank para o usuário?')}
                                            />
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">{t('goalCatalog.sectionVisual', 'Visual e hierarquia')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('goalCatalog.fieldLevel', 'Nível')}</Label>
                                    <Input
                                        name="level"
                                        type="number"
                                        min={1}
                                        value={form.level}
                                        onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('goalCatalog.fieldMinPoints', 'Pontos mínimos')}</Label>
                                    <Input
                                        name="minPoints"
                                        type="number"
                                        min={0}
                                        value={form.minPoints}
                                        onChange={(event) => setForm((current) => ({ ...current, minPoints: event.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('goalCatalog.fieldIcon', 'Ícone')}</Label>
                                    <Select value={form.icon} onValueChange={(value) => setForm((current) => ({ ...current, icon: value }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CATEGORY_ICON_OPTIONS.map((iconName) => {
                                                const Icon = resolveCategoryIcon(iconName);
                                                if (!Icon) return null;
                                                return (
                                                    <SelectItem key={iconName} value={iconName}>
                                                        <span className="flex items-center gap-2">
                                                            <Icon className="h-4 w-4" />
                                                            {iconName}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('goalCatalog.fieldColor', 'Cor')}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            name="color"
                                            type="color"
                                            value={form.color}
                                            onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                                            className="h-10 w-14 cursor-pointer p-1"
                                        />
                                        <Input
                                            name="colorHex"
                                            value={form.color}
                                            onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('goalCatalog.sectionCriteria', 'Critérios de desbloqueio')}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{t('goalCatalog.criteriaHint', 'O usuário precisa cumprir todos os critérios para alcançar este rank.')}</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                                    <Plus className="h-4 w-4" />
                                    {t('goalCatalog.addCriterion', 'Critério')}
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {form.criteria.map((criterion, index) => (
                                    <div key={criterion.id} className="rounded-xl border border-border/70 bg-muted/10 p-3 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {t('goalCatalog.criterionLabel', 'Critério')} {index + 1}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => removeCriterion(criterion.id)}
                                                disabled={form.criteria.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>{t('goalCatalog.fieldCriterionMetric', 'Métrica')}</Label>
                                                <Select
                                                    value={criterion.metric}
                                                    onValueChange={(value) => updateCriterion(criterion.id, { metric: value as RankCriterionMetric })}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {RANK_CRITERION_METRICS.map((metric) => (
                                                            <SelectItem key={metric} value={metric}>
                                                                {t(`goalCatalog.criteria.metric.${metric}`, metric)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('goalCatalog.fieldCriterionTarget', 'Meta')}</Label>
                                                <Input
                                                    name={`criterion-target-${criterion.id}`}
                                                    type="number"
                                                    min={0}
                                                    step={criterion.metric === 'savings_total' ? '0.01' : '1'}
                                                    value={criterion.targetValue}
                                                    onChange={(event) => updateCriterion(criterion.id, { targetValue: event.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="space-y-2">
                            <Label>{t('goalCatalog.fieldStatus', 'Status')}</Label>
                            <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as RecordStatus }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t('users.backoffice.status.active', 'Ativo')}</SelectItem>
                                    <SelectItem value="inactive">{t('users.backoffice.status.inactive', 'Inativo')}</SelectItem>
                                    <SelectItem value="archived">{t('plans.backoffice.status.archived', 'Arquivado')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                            </div>
                        </ScrollArea>

                        <div className="shrink-0 border-t border-border/60 p-5">
                            <Button type="submit" className="w-full" disabled={createTier.isPending || updateTier.isPending}>
                                <Save className="h-4 w-4" />
                                {t('default.save')}
                            </Button>
                        </div>
                    </form>

                    <ScrollArea className={cn(RANK_PANEL_HEIGHT, 'pr-3')}>
                        <div className="space-y-4">
                        {isLoading && <div className="bo-surface h-40 animate-pulse" />}
                        {!isLoading && sortedTiers.length === 0 && (
                            <div className="bo-surface p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground text-center">
                                <EmptyIcon className="h-6 w-6" />
                                <p>{t('goalCatalog.empty', 'Nenhum rank cadastrado.')}</p>
                                <p className="text-xs max-w-sm">{t('goalCatalog.emptyHint', 'Comece pelo rank inicial (ex.: nível 1 — Iniciante) e defina os critérios para subir de nível.')}</p>
                            </div>
                        )}
                        {sortedTiers.map((tier) => {
                            const TierIcon = resolveCategoryIcon(tier.icon) ?? resolveCategoryIcon(DEFAULT_ICON);
                            const DisplayIcon = TierIcon!;
                            const localized = getRankLocalized(tier, i18n.language);

                            return (
                                <article
                                    key={tier.id}
                                    className={cn('bo-surface-elevated p-5 space-y-4', editing?.id === tier.id && 'ring-2 ring-primary/30')}
                                    style={{ borderLeftWidth: 4, borderLeftColor: tier.color }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="flex gap-3 min-w-0">
                                            <div
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                                style={{ backgroundColor: `${tier.color}22`, color: tier.color }}
                                            >
                                                <DisplayIcon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="secondary">{t('goalCatalog.levelBadge', 'Nível {{level}}', { level: tier.level })}</Badge>
                                                    <h3 className="font-semibold truncate">{localized.title}</h3>
                                                    <Badge variant="outline">{t(`goalCatalog.status.${tier.status}`, tier.status)}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 font-mono">{tier.slug}</p>
                                                <p className="text-sm text-muted-foreground mt-2">{localized.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(tier)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(tier)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <Badge variant="outline">
                                            {t('goalCatalog.minPointsBadge', '{{points}} pts', { points: tier.minPoints })}
                                        </Badge>
                                        {RANK_FORM_LOCALES.map((locale) => {
                                            const entry = tier.localized[locale];
                                            if (!entry?.title?.trim()) return null;
                                            return (
                                                <Badge key={locale} variant="secondary">
                                                    {t(`categories.backoffice.language.${locale}`)}
                                                </Badge>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {t('goalCatalog.unlockRequirements', 'Requisitos')}
                                        </p>
                                        <ul className="space-y-2">
                                            {tier.criteria.map((criterion) => (
                                                <li key={criterion.id} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm flex items-center justify-between gap-3">
                                                    <span>{t(`goalCatalog.criteria.metric.${criterion.metric}`, criterion.metric)}</span>
                                                    <span className="font-medium tabular-nums">
                                                        {formatCriterionValue(criterion.metric, criterion.targetValue, i18n.language, t)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        {tier.criteria.length === 0 && (
                                            <p className="text-sm text-muted-foreground">{t('goalCatalog.noCriteria', 'Sem critérios definidos.')}</p>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                        </div>
                    </ScrollArea>
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default GoalCatalogPage;
