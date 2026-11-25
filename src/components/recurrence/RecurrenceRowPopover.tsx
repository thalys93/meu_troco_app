import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Recurrence } from '@/types/Recurrence';
import { Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type RecurrenceRowPopoverProps = {
  recurrence: Recurrence;
  isPending?: boolean;
  onGenerate?: () => void;
  className?: string;
};

const RecurrenceRowPopover = ({
  recurrence,
  isPending = false,
  onGenerate,
  className,
}: RecurrenceRowPopoverProps) => {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 shrink-0 text-violet-600 hover:bg-violet-500/10 hover:text-violet-600 dark:text-violet-400',
            className
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label={t('transactionList.recurrence.column')}
        >
          <Repeat className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-4"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium">{recurrence.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('transactionList.recurrence.perMonth')}
        </p>
        {isPending && onGenerate && (
          <Button
            type="button"
            size="sm"
            className="mt-3 w-full"
            onClick={(e) => {
              e.stopPropagation();
              onGenerate();
            }}
          >
            {t('transactionList.recurrence.generate')}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default RecurrenceRowPopover;
