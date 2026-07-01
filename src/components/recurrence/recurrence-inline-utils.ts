import type { Recurrence, RecurrenceType } from '@/types/Recurrence';
import { NO_WALLET_ID } from '@/constants/wallets';
import {
  allocationRowsFromTransaction,
  createAllocationDraftRows,
  type AllocationDraftRow,
} from '@/components/TransactionAllocationsEditor';
import {
  MIN_WALLET_ALLOCATIONS,
  parseAllocationDraftInputs,
  resolveAllocations,
  validateAllocationsForSave,
} from '@/utils/transaction-allocations';
import {
  parseInlineValue,
  sanitizeValueInput,
} from '@/components/transaction-table/transaction-inline-utils';

export type { AllocationDraftRow };

export type RecurrenceInlineDraft = {
  description: string;
  category: string;
  type: RecurrenceType;
  valueDisplay: string;
  dueDayDisplay: string;
  walletId: string;
  splitAcrossWallets: boolean;
  allocationRows: AllocationDraftRow[];
};

export type RecurrenceInlineFieldErrors = {
  value: boolean;
  category: boolean;
  wallet: boolean;
  description: boolean;
  allocations: boolean;
  dueDay: boolean;
};

export function hasRecurrenceMultipleAllocations(
  recurrence: Partial<Recurrence>
): boolean {
  const allocations = resolveRecurrenceAllocations(recurrence);
  return allocations.length >= MIN_WALLET_ALLOCATIONS;
}

export function resolveRecurrenceAllocations(recurrence: Partial<Recurrence>) {
  return resolveAllocations({
    walletId: recurrence.walletId,
    value: recurrence.estimatedValue,
    allocations: recurrence.allocations,
  });
}

export function draftFromRecurrence(
  recurrence: Recurrence,
  locale = 'pt-BR'
): RecurrenceInlineDraft {
  const walletId = recurrence.walletId?.trim() || NO_WALLET_ID;
  const value = recurrence.estimatedValue;
  const valueDisplay =
    value === 0 ? '' : value.toFixed(2).replace('.', locale === 'pt-BR' ? ',' : '.');
  const split = hasRecurrenceMultipleAllocations(recurrence);

  return {
    description: recurrence.description ?? '',
    category: recurrence.category ?? '',
    type: recurrence.type,
    valueDisplay,
    dueDayDisplay: recurrence.dueDay ? String(recurrence.dueDay) : '',
    walletId,
    splitAcrossWallets: split,
    allocationRows: split
      ? allocationRowsFromTransaction(resolveRecurrenceAllocations(recurrence), locale)
      : createAllocationDraftRows(),
  };
}

const parseAllocationRows = (draft: RecurrenceInlineDraft) =>
  parseAllocationDraftInputs(draft.allocationRows, parseInlineValue);

export function validateRecurrenceDraft(
  draft: RecurrenceInlineDraft
): RecurrenceInlineFieldErrors {
  const valueNum = parseInlineValue(draft.valueDisplay);
  const dueDayNumber = Number(draft.dueDayDisplay);
  const hasValidDueDay =
    !draft.dueDayDisplay.trim() ||
    (Number.isInteger(dueDayNumber) && dueDayNumber >= 1 && dueDayNumber <= 31);

  const base: RecurrenceInlineFieldErrors = {
    value: !draft.valueDisplay.trim() || valueNum <= 0,
    category: !draft.category.trim(),
    wallet: false,
    description: !draft.description.trim(),
    allocations: false,
    dueDay: draft.type === 'conta' && !hasValidDueDay,
  };

  if (draft.splitAcrossWallets) {
    const validation = validateAllocationsForSave(valueNum, parseAllocationRows(draft));
    base.allocations = !validation.ok;
    return base;
  }

  return {
    ...base,
    wallet: !draft.walletId?.trim(),
  };
}

export function buildRecurrencePayload(draft: RecurrenceInlineDraft): Recurrence {
  const estimatedValue = Math.round(parseInlineValue(draft.valueDisplay) * 100) / 100;
  const dueDayNumber = Number(draft.dueDayDisplay);
  const hasValidDueDay =
    Number.isInteger(dueDayNumber) && dueDayNumber >= 1 && dueDayNumber <= 31;

  const base: Recurrence = {
    description: draft.description.trim(),
    category: draft.category,
    type: draft.type,
    estimatedValue,
    walletId: draft.walletId?.trim() || NO_WALLET_ID,
    ...(draft.type === 'conta' && hasValidDueDay ? { dueDay: dueDayNumber } : {}),
  };

  if (!draft.splitAcrossWallets) {
    const { allocations: _removed, ...withoutAllocations } = base;
    return withoutAllocations;
  }

  const validation = validateAllocationsForSave(estimatedValue, parseAllocationRows(draft));
  if (!validation.ok) return base;

  return {
    ...base,
    walletId: validation.walletId,
    allocations: validation.allocations,
  };
}

export { parseInlineValue, sanitizeValueInput };
