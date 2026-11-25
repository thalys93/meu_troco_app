import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type BackofficeSectionCardProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: string;
  headerBg?: string;
  isEmpty?: boolean;
  emptyContent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  scrollMaxHeight?: string;
};

function BackofficeSectionCard({
  title,
  subtitle,
  icon: Icon,
  accent = 'border-primary/40',
  headerBg = 'bg-gradient-to-r from-primary/8 via-primary/4 to-transparent',
  isEmpty = false,
  emptyContent,
  children,
  className,
  scrollMaxHeight = 'max-h-[420px]',
}: BackofficeSectionCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col min-h-0 bo-surface border-l-4',
        accent,
        isEmpty && 'border-dashed',
        className
      )}
    >
      <div className={cn('bo-section-header', headerBg)}>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 border border-border/50 shadow-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
        )}
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      {isEmpty ? (
        <div className="px-4 py-6 text-sm text-muted-foreground text-center">{emptyContent}</div>
      ) : (
        <ScrollArea className={cn(scrollMaxHeight)}>
          <div className="divide-y divide-border/60">{children}</div>
        </ScrollArea>
      )}
    </section>
  );
}

export default BackofficeSectionCard;
