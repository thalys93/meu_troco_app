import { Transaction, type TransactionType } from '@/utils/services/api/transation';
import { NO_WALLET_ID } from '@/constants/wallets';
import { parseLocalDateInput } from '@/subdomains/dashboard/utils/month-range';
import {
  allocationRowsFromTransaction,
  createAllocationDraftRows,
  type AllocationDraftRow,
} from '@/components/TransactionAllocationsEditor';
import {
  hasMultipleAllocations,
  parseAllocationDraftInputs,
  resolveAllocations,
  validateAllocationsForSave,
} from '@/utils/transaction-allocations';

export type { AllocationDraftRow };

export type InlineTransactionDraft = {
  description: string;
  category: string;
  walletId: string;
  date: string;
  type: TransactionType;
  valueDisplay: string;
  splitAcrossWallets: boolean;
  allocationRows: AllocationDraftRow[];
};

export type InlineFieldErrors = {
  value: boolean;
  category: boolean;
  wallet: boolean;
  description: boolean;
  allocations: boolean;
};

const todayYmd = () => new Date().toISOString().split('T')[0];

export function createEmptyDraft(
  type: TransactionType,
  defaultDate?: string
): InlineTransactionDraft {
  return {
    description: '',
    category: '',
    walletId: NO_WALLET_ID,
    date: defaultDate?.trim() || todayYmd(),
    type,
    valueDisplay: '',
    splitAcrossWallets: false,
    allocationRows: createAllocationDraftRows(),
  };
}

export function draftFromTransaction(
  transaction: Transaction,
  locale = 'pt-BR'
): InlineTransactionDraft {
  const walletId =
    transaction.walletId?.trim() ||
    transaction.cardId?.trim() ||
    NO_WALLET_ID;
  const value = transaction.value;
  const valueDisplay =
    value === 0 ? '' : value.toFixed(2).replace('.', ',');

  const split = hasMultipleAllocations(transaction);

  return {
    description: transaction.description ?? '',
    category: transaction.category ?? '',
    walletId,
    date: transaction.date ?? todayYmd(),
    type: transaction.type,
    valueDisplay,
    splitAcrossWallets: split,
    allocationRows: split
      ? allocationRowsFromTransaction(resolveAllocations(transaction), locale)
      : createAllocationDraftRows(),
  };
}

export function parseInlineValue(valueDisplay: string): number {
  return parseFloat((valueDisplay || '0').replace(',', '.')) || 0;
}

export function formatValueForDisplay(value: number, locale: string): string {
  if (value === 0) return '';
  const sep = locale === 'pt-BR' ? ',' : '.';
  return value.toFixed(2).replace('.', sep);
}

export function sanitizeValueInput(raw: string): string {
  let s = raw.replace(/[^0-9,.]/g, '');
  const firstComma = s.indexOf(',');
  const firstDot = s.indexOf('.');
  if (firstComma >= 0 && firstDot >= 0) {
    const sepIdx = Math.min(firstComma, firstDot);
    const sep = s[sepIdx];
    s = s.slice(0, sepIdx + 1) + s.slice(sepIdx + 1).replace(sep === ',' ? /\./g : /,/g, '');
  }
  const sepIdx = s.includes(',') ? s.indexOf(',') : s.indexOf('.');
  if (sepIdx >= 0 && s.length > sepIdx + 3) {
    s = s.slice(0, sepIdx + 3);
  }
  return s;
}

const parseAllocationRows = (draft: InlineTransactionDraft) =>
  parseAllocationDraftInputs(draft.allocationRows, parseInlineValue);

export function validateInlineDraft(draft: InlineTransactionDraft): InlineFieldErrors {
  const valueNum = parseInlineValue(draft.valueDisplay);
  const base: InlineFieldErrors = {
    value: !draft.valueDisplay.trim() || valueNum <= 0,
    category: !draft.category.trim(),
    wallet: false,
    description: !draft.description.trim(),
    allocations: false,
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

export function isInlineDraftValid(draft: InlineTransactionDraft): boolean {
  const errors = validateInlineDraft(draft);
  return (
    !errors.value &&
    !errors.category &&
    !errors.wallet &&
    !errors.description &&
    !errors.allocations
  );
}

export function buildTransactionPayload(draft: InlineTransactionDraft): Transaction {
  const value = parseInlineValue(draft.valueDisplay);
  const base: Transaction = {
    description: draft.description.trim(),
    category: draft.category,
    walletId: draft.walletId?.trim() || NO_WALLET_ID,
    date: draft.date,
    type: draft.type,
    value,
    ...(draft.type === 'conta' ? { paid: false } : {}),
  };

  if (!draft.splitAcrossWallets) {
    const { allocations: _removed, ...withoutAllocations } = base;
    return withoutAllocations;
  }

  const validation = validateAllocationsForSave(value, parseAllocationRows(draft));
  if (!validation.ok) return base;

  return {
    ...base,
    walletId: validation.walletId,
    allocations: validation.allocations,
  };
}

export function parseDraftLocalDate(raw?: string): Date {
  if (!raw) return new Date();
  return parseLocalDateInput(raw);
}

export function formatDraftDateLabel(raw: string | undefined, locale: string): string {
  try {
    const d = parseDraftLocalDate(raw);
    return d.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return raw ?? '';
  }
}

export function dateToYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
