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
                'flex w-full items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 py-9 text-left transition-all hover:bg-muted/50 hover:border-primary/20 active:scale-[0.99]',
                className
            )}
            disabled={isDisabled}
        >
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", iconClassName)}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Button>
    );
}