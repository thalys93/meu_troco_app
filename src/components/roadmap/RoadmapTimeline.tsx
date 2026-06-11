import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RoadmapTimelineItem, RoadmapTimelineTree } from '@/types/backoffice';
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

const statusAccent: Record<RoadmapColumnStatus, { card: string; glow: string }> = {
    planned: { card: 'border-t-slate-400', glow: 'shadow-slate-400/20' },
    in_progress: { card: 'border-t-blue-500', glow: 'shadow-blue-500/25' },
    done: { card: 'border-t-emerald-500', glow: 'shadow-emerald-500/20' },
};

function RoadmapTimelineCard({
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
        <article className={cn('rounded-xl border border-border/70 border-t-[3px] bg-card/95 p-4 shadow-sm space-y-2 backdrop-blur-sm', accent.card, accent.glow)}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                    {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{item.description}</p>
                    )}
                </div>
                {variant === 'admin' && onEdit && onDelete && (
                    <div className="flex gap-0.5 shrink-0">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item.id)}>
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{translateRoadmapStatus(t, item.status)}</Badge>
                {item.phaseName && (
                    <Badge variant="secondary" className="text-[10px]">{formatRoadmapPhaseDisplayName(item.phaseName, t)}</Badge>
                )}
                <Badge variant="secondary" className="text-[10px]">{translateRoadmapPriority(t, item.priority)}</Badge>
            </div>
        </article>
    );
}

type RoadmapTimelineProps = {
    tree: RoadmapTimelineTree;
    variant?: 'admin' | 'public';
    showPreviewBanner?: boolean;
    onEditItem?: (itemId: string) => void;
    onDeleteItem?: (itemId: string) => void;
    className?: string;
};

function RoadmapTimeline({
    tree,
    variant = 'admin',
    showPreviewBanner = variant === 'admin',
    onEditItem,
    onDeleteItem,
    className,
}: RoadmapTimelineProps) {
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
                        {t('roadmap.timelinePreview')}
                    </p>
                </div>
            )}

            <div className="overflow-x-auto pb-6 pt-2">
                <div className="relative min-w-max px-10 py-8">
                    <div
                        className="pointer-events-none absolute top-[3.25rem] left-10 right-10 h-1 rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, hsl(var(--muted-foreground) / 0.25) 0%, hsl(var(--primary) / 0.45) 50%, hsl(142 76% 36% / 0.45) 100%)',
                        }}
                    />
                    <div
                        className="pointer-events-none absolute top-[3.1rem] left-10 right-10 h-1 rounded-full opacity-60 blur-[2px]"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.35) 50%, transparent 100%)',
                        }}
                    />

                    <div className="relative flex items-start gap-10 md:gap-14">
                        {quarters.map((quarter) => {
                            const doneCount = quarter.items.filter((item) => item.status === 'done').length;
                            const progress = quarter.items.length > 0 ? Math.round((doneCount / quarter.items.length) * 100) : 0;

                            return (
                                <div key={quarter.id} className="flex w-[min(300px,78vw)] shrink-0 flex-col items-center">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div
                                            className={cn(
                                                'flex h-11 w-11 items-center justify-center rounded-full border-2 bg-card shadow-lg ring-4 ring-background transition-transform',
                                                quarter.isCurrentQuarter
                                                    ? 'border-primary shadow-primary/30 ring-primary/30 scale-110'
                                                    : 'border-border shadow-black/5',
                                            )}
                                        >
                                            <span className="text-[11px] font-bold tabular-nums">{progress}%</span>
                                        </div>
                                        <div className="mt-3 text-center space-y-1">
                                            <h2 className="font-semibold text-sm tracking-tight">
                                                {formatRoadmapQuarterLabel(t, quarter.year, quarter.quarter)}
                                            </h2>
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

                                    <div className="relative mt-6 w-full space-y-3">
                                        <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-border" />
                                        {quarter.items.map((item) => (
                                            <RoadmapTimelineCard
                                                key={item.id}
                                                item={item}
                                                variant={variant}
                                                onEdit={onEditItem}
                                                onDelete={onDeleteItem}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { RoadmapTimeline };
