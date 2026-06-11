import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type SortableCategoryRowProps = {
    id: string;
    disabled?: boolean;
    children: React.ReactNode;
};

function SortableCategoryRow({ id, disabled, children }: SortableCategoryRowProps) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex items-stretch border-b border-border/60 last:border-b-0 bg-card',
                isDragging && 'relative z-10 opacity-90 shadow-md ring-1 ring-primary/20'
            )}
        >
            <button
                type="button"
                ref={setActivatorNodeRef}
                className={cn(
                    'flex w-9 shrink-0 items-center justify-center text-muted-foreground/70',
                    'hover:text-muted-foreground hover:bg-muted/40 transition-colors',
                    'cursor-grab active:cursor-grabbing touch-none',
                    disabled && 'pointer-events-none opacity-30'
                )}
                aria-label={t('categories.backoffice.dragToReorder')}
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

export default SortableCategoryRow;
