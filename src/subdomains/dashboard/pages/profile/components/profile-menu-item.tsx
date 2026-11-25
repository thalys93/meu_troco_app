import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import React from 'react'


interface ProfileMenuItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    className?: string;
    iconClassName?: string;
    isDisabled?: boolean;
}

export default function ProfileMenuItem({
    icon,
    title,
    description,
    onClick,
    className,
    iconClassName,
    isDisabled = false,
}: ProfileMenuItemProps) {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            size='lg'
            className={cn(
                'group flex h-auto w-full items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-3.5 text-left shadow-sm transition-all hover:border-primary/35 hover:from-primary/5 hover:to-primary/10 hover:shadow-md active:scale-[0.99]',
                className
            )}
            disabled={isDisabled}
        >
            <div
                className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-border/40',
                    iconClassName,
                )}
            >
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">{title}</p>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Button>
    );
}