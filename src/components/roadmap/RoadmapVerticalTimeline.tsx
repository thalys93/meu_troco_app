import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RoadmapTimelineItem, RoadmapTimelinePhase, RoadmapTimelineTree } from '@/types/backoffice';
import { sortQuarterLabels } from '@/utils/roadmap/catalog-utils';
import {
    formatRoadmapPhaseDisplayName,
    formatRoadmapQuarterLabel,
    translateRoadmapPriority,
    translateRoadmapStatus,
} from '@/utils/roadmap/roadmap-i18n';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type RoadmapColumnStatus = 'planned' | 'in_progress' | 'done';

const statusAccent: Record<RoadmapColumnStatus, { border: string; glow: string }> = {
    planned: { border: 'border-l-slate-400', glow: 'shadow-slate-400/15' },
    in_progress: { border: 'border-l-blue-500', glow: 'shadow-blue-500/20' },
    done: { border: 'border-l-emerald-500', glow: 'shadow-emerald-500/15' },
};

function RoadmapVerticalItemAccordion({
    item,
    variant,
    onEdit,
    onDelete,
}: {
    item: RoadmapTimelineItem;
    variant: 'admin' | 'public';
    onEdit?: (itemId: string) => void;
    onDelete?: (itemId: string) => void;
}) {
    const { t } = useTranslation();
    const accent = statusAccent[item.status as RoadmapColumnStatus] ?? statusAccent.planned;

    return (
        <AccordionItem
            value={item.id}
            className={cn(
                'rounded-lg border border-border/60 border-l-[3px] bg-card/95 shadow-sm backdrop-blur-sm overflow-hidden',
                accent.border,
                accent.glow,
            )}
        >
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                <div className="flex flex-1 items-start justify-between gap-2 text-left">
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <span className="font-semibold text-sm leading-tight block">{item.title}</span>
                        <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[10px]">{translateRoadmapStatus(t, item.status)}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{translateRoadmapPriority(t, item.priority)}</Badge>
                        </div>
                    </div>
                    {variant === 'admin' && onEdit && onDelete && (
                        <div className="flex gap-0.5 shrink-0" onClick={(event) => event.stopPropagation()}>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item.id)}>
                                <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            </AccordionTrigger>
            {item.description && (
                <AccordionContent className="px-3 pb-3 pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </AccordionContent>
            )}
        </AccordionItem>
    );
}

function RoadmapVerticalPhaseBlock({
    phase,
    variant,
    onEditItem,
    onDeleteItem,
}: {
    phase: RoadmapTimelinePhase;
    variant: 'admin' | 'public';
    onEditItem?: (itemId: string) => void;
    onDeleteItem?: (itemId: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className={cn('space-y-2', phase.isCurrent && 'rounded-lg ring-1 ring-primary/25 bg-primary/[0.03] p-2 -mx-2')}>
            <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatRoadmapPhaseDisplayName(phase.name, t)}
                </h4>
                {phase.isCurrent && (
                    <Badge className="text-[10px]">{t('roadmap.currentPhaseBadge')}</Badge>
                )}
                {phase.items.length > 0 && (
                    <Badge variant="outline" className="text-[10px] tabular-nums">
                        {t('roadmap.timelineItemCount', { count: phase.items.length })}
                    </Badge>
                )}
            </div>
            {phase.items.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-2">
                    {phase.items.map((item) => (
                        <RoadmapVerticalItemAccordion
                            key={item.id}
                            item={item}
                            variant={variant}
                            onEdit={onEditItem}
                            onDelete={onDeleteItem}
                        />
                    ))}
                </Accordion>
            ) : (
                <p className="text-xs text-muted-foreground italic px-1">{t('roadmap.verticalPhaseEmpty')}</p>
            )}
        </div>
    );
}

type RoadmapVerticalTimelineProps = {
    tree: RoadmapTimelineTree;
    variant?: 'admin' | 'public';
    showPreviewBanner?: boolean;
    onEditItem?: (itemId: string) => void;
    onDeleteItem?: (itemId: string) => void;
    className?: string;
};

function RoadmapVerticalTimeline({
    tree,
    variant = 'admin',
    showPreviewBanner = variant === 'admin',
    onEditItem,
    onDeleteItem,
    className,
}: RoadmapVerticalTimelineProps) {
    const { t } = useTranslation();
    const quarters = [...tree.quarters].sort((left, right) => sortQuarterLabels(left.label, right.label));

    if (quarters.length === 0) {
        return (
            <div className={cn('bo-surface p-12 text-center text-sm text-muted-foreground', className)}>
                {t(variant === 'public' ? 'landing_v2.roadmap.empty' : 'roadmap.timelineEmpty')}
            </div>
        );
    }

    return (
        <div className={cn('bo-surface overflow-hidden', className)}>
            {showPreviewBanner && (
                <div className="border-b border-border/60 px-5 py-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                        {t('roadmap.verticalPreview')}
                    </p>
                </div>
            )}

            <div className="relative px-5 py-6">
                <div
                    className="pointer-events-none absolute left-[2.65rem] top-8 bottom-8 w-1 rounded-full"
                    style={{
                        background: 'linear-gradient(180deg, hsl(var(--muted-foreground) / 0.25) 0%, hsl(var(--primary) / 0.45) 50%, hsl(142 76% 36% / 0.45) 100%)',
                    }}
                />
                <div
                    className="pointer-events-none absolute left-[2.58rem] top-8 bottom-8 w-1 rounded-full opacity-60 blur-[2px]"
                    style={{
                        background: 'linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.35) 50%, transparent 100%)',
                    }}
                />

                <div className="relative space-y-10">
                    {quarters.map((quarter) => {
                        const doneCount = quarter.items.filter((item) => item.status === 'done').length;
                        const progress = quarter.items.length > 0 ? Math.round((doneCount / quarter.items.length) * 100) : 0;

                        return (
                            <div key={quarter.id} className="relative flex gap-5">
                                <div className="relative z-10 shrink-0 flex flex-col items-center w-9">
                                    <div
                                        className={cn(
                                            'flex h-9 w-9 items-center justify-center rounded-full border-2 bg-card shadow-lg ring-4 ring-background',
                                            quarter.isCurrentQuarter
                                                ? 'border-primary shadow-primary/30 ring-primary/30 scale-110'
                                                : 'border-border shadow-black/5',
                                        )}
                                    >
                                        <span className="text-[10px] font-bold tabular-nums">{progress}%</span>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 space-y-4 pb-2">
                                    <div className="space-y-1">
                                        <h2 className="font-semibold text-sm tracking-tight">
                                            {formatRoadmapQuarterLabel(t, quarter.year, quarter.quarter)}
                                        </h2>
                                        <div className="flex flex-wrap gap-1.5">
                                            {quarter.isCurrentQuarter && quarter.currentPhaseName && (
                                                <Badge className="text-[10px]">
                                                    {t('roadmap.timelineCurrentPhase', { name: formatRoadmapPhaseDisplayName(quarter.currentPhaseName, t) })}
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="text-[10px] tabular-nums">
                                                {t('roadmap.timelineItemCount', { count: quarter.items.length })}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {quarter.phases.map((phase) => (
                                            <RoadmapVerticalPhaseBlock
                                                key={phase.id}
                                                phase={phase}
                                                variant={variant}
                                                onEditItem={onEditItem}
                                                onDeleteItem={onDeleteItem}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export { RoadmapVerticalTimeline };
