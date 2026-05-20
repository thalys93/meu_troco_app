import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Check,
  X,
  Loader2,
  Tag,
} from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Transaction } from '@/utils/services/api/transation';
import { useCategories } from '@/hooks/use-categories';
import { useWalletsStore } from '@/store/useWalletsStore';
import useUserStore from '@/store/UserStore';
import {
  LEGACY_POCKET_CARD_NAME,
  NO_WALLET_ID,
} from '@/constants/wallets';
import DescriptionAutocomplete from './DescriptionAutocomplete';
import {
  InlineFieldErrors,
  InlineTransactionDraft,
  dateToYmd,
  formatDraftDateLabel,
  parseDraftLocalDate,
  sanitizeValueInput,
  validateInlineDraft,
} from './transaction-inline-utils';
import { useTransactionInlineSubmit } from './useTransactionInlineSubmit';
import { DescriptionSuggestion } from '@/hooks/use-transaction-description-suggestions';

type TransactionTableInlineRowProps = {
  draft: InlineTransactionDraft;
  onDraftChange: (draft: InlineTransactionDraft) => void;
  onCancel: () => void;
  onSaved: () => void;
  mode: 'create' | 'edit';
  editTransactionId?: string;
  allTransactions: Transaction[];
  rowIndex?: number;
  zebra?: boolean;
};

const TransactionTableInlineRow = ({
  draft,
  onDraftChange,
  onCancel,
  onSaved,
  mode,
  editTransactionId,
  allTransactions,
  rowIndex = 0,
  zebra = false,
}: TransactionTableInlineRowProps) => {
  const { t, i18n } = useTranslation();
  const { uid } = useUserStore();
  const { expenseCategories, incomeCategories, getCategoryIcon, getCategoryLabel } = useCategories();
  const { wallets, fetchWallets } = useWalletsStore();
  const [fieldErrors, setFieldErrors] = React.useState<InlineFieldErrors>({
    value: false,
    category: false,
    wallet: false,
    description: false,
  });

  const { submitDraft, isSaving } = useTransactionInlineSubmit({
    editTransactionId: mode === 'edit' ? editTransactionId : undefined,
    onSuccess: onSaved,
  });

  React.useEffect(() => {
    if (uid && wallets.length === 0) fetchWallets(uid);
  }, [uid, wallets.length, fetchWallets]);

  const categories = draft.type === 'receita' ? incomeCategories : expenseCategories;
  const realWallets = React.useMemo(
    () => wallets.filter((w) => w.name !== LEGACY_POCKET_CARD_NAME),
    [wallets]
  );

  const updateDraft = (patch: Partial<InlineTransactionDraft>) => {
    onDraftChange({ ...draft, ...patch });
  };

  const handleSave = () => {
    const errors = validateInlineDraft(draft);
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
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('.rdp') ||
      target.closest('[cmdk-list]')
    ) {
      return;
    }
    e.preventDefault();
    handleSave();
  };

  const handleSuggestionSelect = (suggestion: DescriptionSuggestion) => {
    updateDraft({
      description: suggestion.description,
      category: suggestion.category || draft.category,
      walletId: suggestion.walletId || draft.walletId,
      type: suggestion.type,
    });
    setFieldErrors((prev) => ({ ...prev, description: false, category: false }));
  };

  const toggleTransactionType = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextType = draft.type === 'receita' ? 'despesa' : 'receita';
    const nextCategories = nextType === 'receita' ? incomeCategories : expenseCategories;
    const categoryStillValid = nextCategories.some((cat) => cat.id === draft.category);
    updateDraft({
      type: nextType,
      category: categoryStillValid ? draft.category : '',
    });
  };

  const CategoryIcon = draft.category ? (getCategoryIcon(draft.category) ?? Tag) : Tag;
  const dateLabel = formatDraftDateLabel(draft.date, i18n.language);

  return (
    <TableRow
      data-transaction-inline-row
      className={cn(
        'border-0 transition-colors bg-primary/5 ring-1 ring-primary/25 ring-inset',
        zebra && 'dark:bg-primary/10',
        isSaving && 'pointer-events-none opacity-70'
      )}
      onKeyDown={handleRowKeyDown}
    >
      <TableCell className="border-b border-border/30 py-1.5 pl-4 pr-2 align-middle">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTransactionType}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-offset-background',
              draft.type === 'receita'
                ? 'bg-emerald-500/12 text-emerald-600 hover:ring-emerald-500/40 dark:text-emerald-400'
                : 'bg-red-500/12 text-red-600 hover:ring-red-500/40 dark:text-red-400'
            )}
            aria-label={
              draft.type === 'receita'
                ? t('landing_v2.transactions.income')
                : t('landing_v2.transactions.expense')
            }
            title={t('transactionList.inline.toggleType')}
          >
            {draft.type === 'receita' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </button>
          <DescriptionAutocomplete
            value={draft.description}
            onChange={(description) => {
              updateDraft({ description });
              setFieldErrors((prev) => ({ ...prev, description: false }));
            }}
            onSelectSuggestion={handleSuggestionSelect}
            transactions={allTransactions}
            hasError={fieldErrors.description}
            autoFocus={mode === 'create'}
            placeholder={t('transactionForm.form.descriptionPlaceholder')}
            className="min-w-[120px] flex-1"
          />
        </div>
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <Select
          value={draft.walletId}
          onValueChange={(walletId) => {
            updateDraft({ walletId });
            setFieldErrors((prev) => ({ ...prev, wallet: false }));
          }}
        >
          <SelectTrigger
            className={cn(
              'h-8 text-xs border-border/60 bg-background/80',
              fieldErrors.wallet && 'border-red-500'
            )}
          >
            <SelectValue placeholder={t('transactionForm.form.selectWallet')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_WALLET_ID}>
              <span className="text-xs">{t('wallets.noWallet', 'Sem Carteira')}</span>
            </SelectItem>
            {realWallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id!}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: wallet.color }}
                  />
                  <span className="text-xs truncate">{wallet.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-full min-w-[100px] items-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-2 text-xs text-left hover:bg-muted/50"
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{dateLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={parseDraftLocalDate(draft.date)}
              onSelect={(date) => {
                if (!date) return;
                updateDraft({ date: dateToYmd(date) });
              }}
            />
          </PopoverContent>
        </Popover>
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
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    {/* <Icon className="h-3.5 w-3.5 shrink-0" /> */}
                    <span className="text-xs">{getCategoryLabel(cat.id)}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="border-b border-border/30 py-1.5 px-2 align-middle">
        <Badge
          variant="secondary"
          className={cn(
            'h-6 w-full justify-center border-0 px-2 py-0 text-xs font-medium pointer-events-none',
            draft.type === 'receita'
              ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-500/12 text-red-700 dark:text-red-400'
          )}
        >
          {draft.type === 'receita'
            ? t('landing_v2.transactions.income')
            : t('landing_v2.transactions.expense')}
        </Badge>
      </TableCell>
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
            'h-8 text-right font-mono text-sm tabular-nums border-border/60 bg-background/80',
            fieldErrors.value && 'border-red-500',
            draft.type === 'receita'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
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
            className={cn(
              'h-8 w-8',
              draft.type === 'receita'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            )}
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

export default TransactionTableInlineRow;
