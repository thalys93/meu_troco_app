import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Recurrence } from '@/types/Recurrence';
import { buildRecurrenceDateForMonth } from '@/subdomains/dashboard/utils/recurrence';
import { Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { parseLocalDateInput } from '@/subdomains/dashboard/utils/month-range';

type RecurrenceRowPopoverProps = {
  recurrence: Recurrence;
  monthKey?: string;
  isPending?: boolean;
  onGenerate?: () => void;
  onMarkPaid?: () => void;
  className?: string;
};

const RecurrenceRowPopover = ({
  recurrence,
  monthKey,
  isPending = false,
  onGenerate,
  onMarkPaid,
  className,
}: RecurrenceRowPopoverProps) => {
  const { t, i18n } = useTranslation();

  const scheduleLabel = React.useMemo(() => {
    if (recurrence.dueDay && monthKey) {
      const dateStr = buildRecurrenceDateForMonth(monthKey, recurrence.dueDay);
      const date = parseLocalDateInput(dateStr);
      if (!Number.isNaN(date.getTime())) {
        return t('transactionList.recurrence.dueDay', {
          day: date.toLocaleDateString(i18n.language, {
            day: 'numeric',
            month: 'long',
          }),
        });
      }
      return t('transactionList.recurrence.dueDay', { day: recurrence.dueDay });
    }
    return t('transactionList.recurrence.perMonth');
  }, [recurrence.dueDay, monthKey, t, i18n.language]);

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
        <p className="mt-1 text-xs text-muted-foreground">{scheduleLabel}</p>
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
        {isPending && onMarkPaid && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 w-full"
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid();
            }}
          >
            {t('transactionList.recurrence.markPaid')}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default RecurrenceRowPopover;
