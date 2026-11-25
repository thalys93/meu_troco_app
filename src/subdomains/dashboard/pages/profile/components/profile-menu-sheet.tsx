import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ProfileMenuSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    titleIcon?: React.ReactNode;
    children: React.ReactNode;
    side?: 'left' | 'right' | 'top' | 'bottom';
    className?: string;
    contentClassName?: string;
}

export default function ProfileMenuSheet({
    open,
    onOpenChange,
    title,
    titleIcon,
    children,
    side = 'right',
    className,
    contentClassName,
}: ProfileMenuSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={side}
                className={cn(
                    'w-full sm:max-w-md flex flex-col',
                    className
                )}
            >
                <SheetHeader>
                    <SheetTitle
                        className={cn(
                            titleIcon && 'flex items-center gap-2'
                        )}
                    >
                        {titleIcon}
                        {title}
                    </SheetTitle>
                </SheetHeader>
                <div
                    className={cn(
                        'flex-1 overflow-y-auto py-6',
                        contentClassName
                    )}
                >
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}
