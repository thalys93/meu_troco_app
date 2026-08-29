import type { ReactNode } from 'react';
import { Ban, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TransactionPaymentStatusProps = {
  showPaid?: boolean;
  isPaid?: boolean;
  isSkipped?: boolean;
  disabled?: boolean;
  onTogglePaid?: () => void;
  onToggleSkipped?: () => void;
  className?: string;
};

const StatusButton = ({
  active,
  activeClassName,
  label,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  activeClassName: string;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors',
          'text-muted-foreground hover:bg-background hover:text-foreground',
          'disabled:pointer-events-none disabled:opacity-50',
          active && activeClassName
        )}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

const TransactionPaymentStatus = ({
  showPaid = false,
  isPaid = false,
  isSkipped = false,
  disabled = false,
  onTogglePaid,
  onToggleSkipped,
  className,
}: TransactionPaymentStatusProps) => {
  const { t } = useTranslation();

  if (!showPaid && !onToggleSkipped) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {showPaid && (
          <StatusButton
            active={isPaid && !isSkipped}
            activeClassName="bg-emerald-500/15 text-emerald-600 shadow-sm dark:text-emerald-400"
            label={t('transactionList.paid')}
            disabled={disabled || isSkipped}
            onClick={onTogglePaid}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </StatusButton>
        )}
        {onToggleSkipped && (
          <StatusButton
            active={isSkipped}
            activeClassName={cn(
              'bg-red-500/25 text-red-500',
              'shadow-[0_0_10px_rgba(239,68,68,0.85),0_0_22px_rgba(239,68,68,0.45)]',
              'ring-1 ring-red-500/70',
              'dark:text-red-400 dark:shadow-[0_0_12px_rgba(248,113,113,0.95),0_0_28px_rgba(239,68,68,0.55)]'
            )}
            label={isSkipped ? t('transactionList.unskip') : t('transactionList.skip')}
            disabled={disabled}
            onClick={onToggleSkipped}
          >
            <Ban className="h-3.5 w-3.5" strokeWidth={2.5} />
          </StatusButton>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TransactionPaymentStatus;
