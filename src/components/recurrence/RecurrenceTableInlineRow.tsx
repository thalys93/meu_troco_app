import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, Check, X, Loader2, Tag } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/use-categories';
import { useWalletsStore } from '@/store/useWalletsStore';
import useUserStore from '@/store/UserStore';
import { LEGACY_POCKET_CARD_NAME } from '@/constants/wallets';
import InlineWalletSplitControl from '@/components/transaction-table/InlineWalletSplitControl';
import {
  parseInlineValue,
  RecurrenceInlineDraft,
  RecurrenceInlineFieldErrors,
  sanitizeValueInput,
  validateRecurrenceDraft,
} from '@/components/recurrence/recurrence-inline-utils';
import { useRecurrenceInlineSubmit } from '@/components/recurrence/useRecurrenceInlineSubmit';

type RecurrenceTableInlineRowProps = {
  draft: RecurrenceInlineDraft;
  onDraftChange: (draft: RecurrenceInlineDraft) => void;
  onCancel: () => void;
  onSaved: () => void;
  recurrenceId: string;
  rowIndex?: number;
  zebra?: boolean;
  showStatusColumn?: boolean;
};

const RecurrenceTableInlineRow = ({
  draft,
  onDraftChange,
  onCancel,
  onSaved,
  recurrenceId,
  zebra = false,
  showStatusColumn = false,
}: RecurrenceTableInlineRowProps) => {
  const { t } = useTranslation();
  const { uid } = useUserStore();
  const { expenseCategories, getCategoryIcon, getCategoryLabel } = useCategories();
  const { wallets, fetchWallets } = useWalletsStore();
  const [fieldErrors, setFieldErrors] = React.useState<RecurrenceInlineFieldErrors>({
    value: false,
    category: false,
    wallet: false,
    description: false,
    allocations: false,
  });

  const { submitDraft, isSaving } = useRecurrenceInlineSubmit({
    recurrenceId,
    onSuccess: onSaved,
  });

  React.useEffect(() => {
    if (uid && wallets.length === 0) fetchWallets(uid);
  }, [uid, wallets.length, fetchWallets]);

  const realWallets = React.useMemo(
    () => wallets.filter((w) => w.name !== LEGACY_POCKET_CARD_NAME),
    [wallets]
  );

  const updateDraft = (patch: Partial<RecurrenceInlineDraft>) => {
    onDraftChange({ ...draft, ...patch });
  };

  const handleSave = () => {
    const errors = validateRecurrenceDraft(draft);
    setFieldErrors(errors);
    const result = submitDraft(draft);
    if (!result.ok) {
      setFieldErrors(result.errors);
    }
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key !== 'Enter' || e.shiftKey) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('[role="combobox"]') ||
      target.closest('[data-radix-popper-content-wrapper]')
    ) {
      return;
    }
    e.preventDefault();
    handleSave();
  };

  const CategoryIcon = draft.category ? (getCategoryIcon(draft.category) ?? Tag) : Tag;

  return (
    <TableRow
      data-recurrence-inline-row
      className={cn(
        'border-0 transition-colors bg-primary/5 ring-1 ring-primary/25 ring-inset',
        zebra && 'dark:bg-primary/10',
        isSaving && 'pointer-events-none opacity-70'
      )}
      onKeyDown={handleRowKeyDown}
    >
      <TableCell className="border-b border-border/30 py-1.5 pl-4 pr-2 align-middle">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-500/12 text-red-600 dark:text-red-400"
            aria-hidden
          >
            <TrendingDown className="h-4 w-4" />
          </span>
          <Input
            autoFocus
            value={draft.description}
            onChange={(e) => {
              updateDraft({ description: e.target.value });
              setFieldErrors((prev) => ({ ...prev, description: false }));
            }}
            placeholder={t('recurrence.wizard.descriptionPlaceholder')}
            className={cn(
              'h-8 min-w-[120px] flex-1 text-sm border-border/60 bg-background/80',
              fieldErrors.description && 'border-red-500'
            )}
          />
        </div>
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <InlineWalletSplitControl
          splitAcrossWallets={draft.splitAcrossWallets}
          onSplitAcrossWalletsChange={(splitAcrossWallets) => {
            updateDraft({ splitAcrossWallets });
            setFieldErrors((prev) => ({
              ...prev,
              wallet: false,
              allocations: false,
            }));
          }}
          allocationRows={draft.allocationRows}
          onAllocationRowsChange={(allocationRows) => {
            updateDraft({ allocationRows });
            setFieldErrors((prev) => ({ ...prev, allocations: false }));
          }}
          walletId={draft.walletId}
          onWalletIdChange={(walletId) => {
            updateDraft({ walletId });
            setFieldErrors((prev) => ({ ...prev, wallet: false }));
          }}
          totalValue={parseInlineValue(draft.valueDisplay)}
          realWallets={realWallets}
          walletFieldError={fieldErrors.wallet}
          allocationsFieldError={fieldErrors.allocations}
        />
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {t('transactionList.recurrence.perMonth')}
        </span>
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <Select
          value={draft.category}
          onValueChange={(category) => {
            updateDraft({ category });
            setFieldErrors((prev) => ({ ...prev, category: false }));
          }}
        >
          <SelectTrigger
            className={cn(
              'h-8 text-xs border-border/60 bg-background/80',
              fieldErrors.category && 'border-red-500'
            )}
          >
            <div className="flex items-center gap-1.5">
              <CategoryIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <SelectValue placeholder={t('transactionForm.form.selectCategory')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="text-xs">{getCategoryLabel(cat.id)}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <Badge
          variant="secondary"
          className="h-6 w-full justify-center border-0 bg-red-500/12 px-2 py-0 text-xs font-medium text-red-700 dark:text-red-400 pointer-events-none"
        >
          {t('landing_v2.transactions.expense')}
        </Badge>
      </TableCell>
      {showStatusColumn && (
        <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle" />
      )}
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <Input
          name="value"
          type="text"
          inputMode="decimal"
          value={draft.valueDisplay}
          onChange={(e) => {
            updateDraft({ valueDisplay: sanitizeValueInput(e.target.value) });
            setFieldErrors((prev) => ({ ...prev, value: false }));
          }}
          placeholder="0,00"
          className={cn(
            'h-8 text-right font-mono text-sm tabular-nums border-border/60 bg-background/80 text-red-600 dark:text-red-400',
            fieldErrors.value && 'border-red-500'
          )}
        />
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 pr-4 pl-2 text-right align-middle">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onCancel}
            disabled={isSaving}
            aria-label={t('transactionList.inline.cancel')}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleSave}
            disabled={isSaving}
            aria-label={t('transactionList.inline.save')}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RecurrenceTableInlineRow;
