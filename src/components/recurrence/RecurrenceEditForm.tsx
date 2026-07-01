import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, Receipt, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCategories } from '@/hooks/use-categories';
import { useWalletsStore } from '@/store/useWalletsStore';
import useUserStore from '@/store/UserStore';
import { LEGACY_POCKET_CARD_NAME } from '@/constants/wallets';
import InlineWalletSplitControl from '@/components/transaction-table/InlineWalletSplitControl';
import {
  draftFromRecurrence,
  parseInlineValue,
  RecurrenceInlineDraft,
  RecurrenceInlineFieldErrors,
  sanitizeValueInput,
  validateRecurrenceDraft,
} from '@/components/recurrence/recurrence-inline-utils';
import { useRecurrenceInlineSubmit } from '@/components/recurrence/useRecurrenceInlineSubmit';
import type { Recurrence } from '@/types/Recurrence';

type RecurrenceEditFormProps = {
  recurrence: Recurrence;
  onSuccess: () => void;
  onCancel: () => void;
};

const RecurrenceEditForm = ({
  recurrence,
  onSuccess,
  onCancel,
}: RecurrenceEditFormProps) => {
  const { t, i18n } = useTranslation();
  const { uid } = useUserStore();
  const { expenseCategories, billCategories, getCategoryLabel } = useCategories();
  const { wallets, fetchWallets } = useWalletsStore();
  const [draft, setDraft] = React.useState<RecurrenceInlineDraft>(() =>
    draftFromRecurrence(recurrence, i18n.language)
  );
  const [fieldErrors, setFieldErrors] = React.useState<RecurrenceInlineFieldErrors>({
    value: false,
    category: false,
    wallet: false,
    description: false,
    allocations: false,
    dueDay: false,
  });

  const recurrenceId = recurrence.id ?? '';
  const { submitDraft, isSaving } = useRecurrenceInlineSubmit({
    recurrenceId,
    onSuccess,
  });

  React.useEffect(() => {
    setDraft(draftFromRecurrence(recurrence, i18n.language));
  }, [recurrence, i18n.language]);

  React.useEffect(() => {
    if (uid && wallets.length === 0) fetchWallets(uid);
  }, [uid, wallets.length, fetchWallets]);

  const categories = draft.type === 'conta' ? billCategories : expenseCategories;
  const realWallets = React.useMemo(
    () => wallets.filter((w) => w.name !== LEGACY_POCKET_CARD_NAME),
    [wallets]
  );

  const updateDraft = (patch: Partial<RecurrenceInlineDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    const errors = validateRecurrenceDraft(draft);
    setFieldErrors(errors);
    const result = submitDraft(draft);
    if (!result.ok) {
      setFieldErrors(result.errors);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>{t('recurrence.editForm.type')}</Label>
        <ToggleGroup
          type="single"
          value={draft.type}
          onValueChange={(value) => {
            if (value !== 'conta' && value !== 'despesa') return;
            const nextCategories = value === 'conta' ? billCategories : expenseCategories;
            const categoryStillValid = nextCategories.some((cat) => cat.id === draft.category);
            updateDraft({
              type: value,
              category: categoryStillValid ? draft.category : '',
              dueDayDisplay: value === 'conta' ? draft.dueDayDisplay : '',
            });
          }}
          className="grid grid-cols-2 gap-2"
        >
          <ToggleGroupItem
            value="conta"
            className="flex items-center gap-2 data-[state=on]:bg-amber-500/10 data-[state=on]:text-amber-700"
          >
            <Receipt className="h-4 w-4" />
            {t('sidebar.bills')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="despesa"
            className="flex items-center gap-2 data-[state=on]:bg-red-500/10 data-[state=on]:text-red-700"
          >
            <TrendingDown className="h-4 w-4" />
            {t('sidebar.expenses')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recurrence-description">{t('transactionForm.form.description')}</Label>
        <Input
          id="recurrence-description"
          autoFocus
          value={draft.description}
          onChange={(e) => {
            updateDraft({ description: e.target.value });
            setFieldErrors((prev) => ({ ...prev, description: false }));
          }}
          placeholder={t('recurrence.wizard.descriptionPlaceholder')}
          className={cn(fieldErrors.description && 'border-red-500')}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('transactionForm.form.category')}</Label>
        <Select
          value={draft.category}
          onValueChange={(category) => {
            updateDraft({ category });
            setFieldErrors((prev) => ({ ...prev, category: false }));
          }}
        >
          <SelectTrigger className={cn(fieldErrors.category && 'border-red-500')}>
            <SelectValue placeholder={t('transactionForm.form.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {getCategoryLabel(cat.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recurrence-value">{t('recurrence.editForm.monthlyValue')}</Label>
        <Input
          id="recurrence-value"
          type="text"
          inputMode="decimal"
          value={draft.valueDisplay}
          onChange={(e) => {
            updateDraft({ valueDisplay: sanitizeValueInput(e.target.value) });
            setFieldErrors((prev) => ({ ...prev, value: false }));
          }}
          placeholder="0,00"
          className={cn(
            'font-mono tabular-nums',
            fieldErrors.value && 'border-red-500'
          )}
        />
      </div>

      {draft.type === 'conta' && (
        <div className="space-y-2">
          <Label htmlFor="recurrence-due-day">{t('recurrence.wizard.dueDay')}</Label>
          <Input
            id="recurrence-due-day"
            type="text"
            inputMode="numeric"
            value={draft.dueDayDisplay}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, '').slice(0, 2);
              updateDraft({ dueDayDisplay: next });
              setFieldErrors((prev) => ({ ...prev, dueDay: false }));
            }}
            placeholder={t('recurrence.wizard.dueDayPlaceholder')}
            className={cn(fieldErrors.dueDay && 'border-red-500')}
          />
          <p className="text-xs text-muted-foreground">{t('recurrence.wizard.dueDayHint')}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('transactionForm.form.wallet')}</Label>
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
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('transactionList.inline.cancel')}
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('recurrence.wizard.finish')
          )}
        </Button>
      </div>
    </div>
  );
};

export default RecurrenceEditForm;
