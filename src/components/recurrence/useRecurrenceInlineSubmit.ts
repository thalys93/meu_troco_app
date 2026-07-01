import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { useEditRecurrence } from '@/utils/services/api/recurrence';
import {
  buildRecurrencePayload,
  RecurrenceInlineDraft,
  RecurrenceInlineFieldErrors,
  validateRecurrenceDraft,
} from './recurrence-inline-utils';
import {
  describeAllocationValidationFailure,
  parseAllocationDraftInputs,
  validateAllocationsForSave,
} from '@/utils/transaction-allocations';
import { parseInlineValue } from '@/components/transaction-table/transaction-inline-utils';

type UseRecurrenceInlineSubmitOptions = {
  recurrenceId: string;
  onSuccess?: () => void;
};

export function useRecurrenceInlineSubmit({
  recurrenceId,
  onSuccess,
}: UseRecurrenceInlineSubmitOptions) {
  const { t } = useTranslation();
  const { mutate: edit, isPending: isEditing } = useEditRecurrence(recurrenceId);

  const getMissingFieldsMessage = useCallback(
    (errors: RecurrenceInlineFieldErrors) => {
      const missing = [
        errors.value && t('transactionForm.form.value'),
        errors.category && t('transactionForm.form.category'),
        errors.wallet && t('transactionForm.form.wallet'),
        errors.description && t('transactionForm.form.description'),
        errors.dueDay && t('recurrence.wizard.dueDay'),
        errors.allocations &&
          t('transactionList.inline.splitWallets', {
            defaultValue: 'Rateio entre carteiras',
          }),
      ]
        .filter(Boolean)
        .join(', ');
      return t('transactionForm.toast.missingFields', { fields: missing });
    },
    [t]
  );

  const submitDraft = useCallback(
    (draft: RecurrenceInlineDraft) => {
      const errors = validateRecurrenceDraft(draft);
      if (
        errors.value ||
        errors.category ||
        errors.wallet ||
        errors.description ||
        errors.allocations ||
        errors.dueDay
      ) {
        let description = getMissingFieldsMessage(errors);
        if (errors.allocations && draft.splitAcrossWallets) {
          const allocationCheck = validateAllocationsForSave(
            parseInlineValue(draft.valueDisplay),
            parseAllocationDraftInputs(draft.allocationRows, parseInlineValue)
          );
          if (!allocationCheck.ok) {
            description = describeAllocationValidationFailure(allocationCheck.reason);
          }
        }
        toast({
          title: t('transactionForm.toast.title'),
          description,
          variant: 'destructive',
        });
        return { ok: false as const, errors };
      }

      const payload = buildRecurrencePayload(draft);

      edit(payload, {
        onSuccess: () => {
          toast({
            title: t('recurrence.toast.success'),
            variant: 'success',
          });
          onSuccess?.();
        },
        onError: () => {
          toast({
            title: t('toast.error'),
            description: t('recurrence.toast.error'),
            variant: 'destructive',
          });
        },
      });

      return { ok: true as const, errors };
    },
    [edit, getMissingFieldsMessage, onSuccess, t]
  );

  return { submitDraft, isSaving: isEditing, validateRecurrenceDraft };
}
