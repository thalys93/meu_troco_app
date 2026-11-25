import React from 'react';
import { resolveCategoryIcon } from '@/utils/category-icons';
import { cn } from '@/lib/utils';

const DEFAULT_COLOR = '#6366f1';
const DEFAULT_ICON = 'Shield';

type RankBadgeProps = {
    title: string;
    icon: string;
    color: string;
    levelLabel: string;
    variant?: 'preview' | 'compact';
    className?: string;
};

export function RankBadge({
    title,
    icon,
    color,
    levelLabel,
    variant = 'preview',
    className,
}: RankBadgeProps) {
    const Icon = resolveCategoryIcon(icon) ?? resolveCategoryIcon(DEFAULT_ICON);
    const PreviewIcon = Icon!;

    if (variant === 'compact') {
        return (
            <div
                className={cn(
                    'inline-flex items-center gap-1.5 max-w-full',
                    className,
                )}
                style={{ color }}
            >
                <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${color}22`, color }}
                >
                    <PreviewIcon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate text-sm font-semibold text-foreground/90">{title}</span>
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {levelLabel}
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3',
                className,
            )}
            style={{ borderLeftWidth: 4, borderLeftColor: color || DEFAULT_COLOR }}
        >
            <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color || DEFAULT_COLOR}22`, color: color || DEFAULT_COLOR }}
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
