import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import useUserStore from '@/store/UserStore';
import {
  Transaction,
  useCreateTransaction,
  useEditTransaction,
  useUserTransactions,
} from '@/utils/services/api/transation';
import { useWalletsStore } from '@/store/useWalletsStore';
import {
  buildTransactionPayload,
  InlineFieldErrors,
  InlineTransactionDraft,
  validateInlineDraft,
} from './transaction-inline-utils';

type UseTransactionInlineSubmitOptions = {
  editTransactionId?: string;
  onSuccess?: () => void;
};

export function useTransactionInlineSubmit({
  editTransactionId,
  onSuccess,
}: UseTransactionInlineSubmitOptions) {
  const { uid } = useUserStore();
  const { t } = useTranslation();
  const { refetch } = useUserTransactions();
  const { fetchWallets } = useWalletsStore();
  const { mutate: create, isPending: isCreating } = useCreateTransaction();
  const { mutate: edit, isPending: isEditing } = useEditTransaction(
    uid,
    editTransactionId ?? ''
  );

  const isSaving = isCreating || isEditing;

  const getMissingFieldsMessage = useCallback(
    (errors: InlineFieldErrors) => {
      const missing = [
        errors.value && t('transactionForm.form.value'),
        errors.category && t('transactionForm.form.category'),
        errors.wallet && t('transactionForm.form.wallet'),
        errors.description && t('transactionForm.form.description'),
      ].filter(Boolean).join(', ');
      return t('transactionForm.toast.missingFields', { fields: missing });
    },
    [t]
  );

  const submitDraft = useCallback(
    (draft: InlineTransactionDraft) => {
      const errors = validateInlineDraft(draft);
      if (errors.value || errors.category || errors.wallet || errors.description) {
        toast({
          title: t('transactionForm.toast.title'),
          description: getMissingFieldsMessage(errors),
          variant: 'destructive',
        });
        return { ok: false as const, errors };
      }

      const payload: Transaction = buildTransactionPayload(draft);

      if (editTransactionId) {
        edit(payload, {
          onSuccess: () => {
            toast({
              title: t('transactionForm.toast.success'),
              description: `${draft.type === 'receita' ? t('sidebar.income') : t('sidebar.expenses')} ${t('transactionForm.toast.editDescription')}`,
              variant: 'success',
            });
            refetch();
            if (uid) fetchWallets(uid);
            onSuccess?.();
          },
          onError: () => {
            toast({
              title: 'Erro',
              description: t('transactionForm.toast.errorDescription'),
              variant: 'destructive',
            });
          },
        });
      } else {
        create(payload, {
          onSuccess: () => {
            toast({
              title: t('transactionForm.toast.success'),
              description: `${draft.type === 'receita' ? t('sidebar.income') : t('sidebar.expenses')} ${t('transactionForm.toast.successDescription')}`,
              variant: 'success',
            });
            refetch();
            if (uid) fetchWallets(uid);
            onSuccess?.();
          },
          onError: () => {
            toast({
              title: 'Erro',
              description: t('transactionForm.toast.errorDescription'),
              variant: 'destructive',
            });
          },
        });
      }

      return { ok: true as const, errors };
    },
    [
      create,
      edit,
      editTransactionId,
      fetchWallets,
      getMissingFieldsMessage,
      onSuccess,
      refetch,
      t,
      uid,
    ]
  );

  return { submitDraft, isSaving, validateInlineDraft };
}
