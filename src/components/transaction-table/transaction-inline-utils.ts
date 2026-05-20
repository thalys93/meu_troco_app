import { Transaction } from '@/utils/services/api/transation';
import { NO_WALLET_ID } from '@/constants/wallets';
import { parseLocalDateInput } from '@/subdomains/dashboard/utils/month-range';

export type InlineTransactionDraft = {
  description: string;
  category: string;
  walletId: string;
  date: string;
  type: 'receita' | 'despesa';
  valueDisplay: string;
};

export type InlineFieldErrors = {
  value: boolean;
  category: boolean;
  wallet: boolean;
  description: boolean;
};

const todayYmd = () => new Date().toISOString().split('T')[0];

export function createEmptyDraft(
  type: 'receita' | 'despesa',
  defaultDate?: string
): InlineTransactionDraft {
  return {
    description: '',
    category: '',
    walletId: NO_WALLET_ID,
    date: defaultDate?.trim() || todayYmd(),
    type,
    valueDisplay: '',
  };
}

export function draftFromTransaction(transaction: Transaction): InlineTransactionDraft {
  const walletId =
    transaction.walletId?.trim() ||
    transaction.cardId?.trim() ||
    NO_WALLET_ID;
  const value = transaction.value;
  const valueDisplay =
    value === 0 ? '' : value.toFixed(2).replace('.', ',');

  return {
    description: transaction.description ?? '',
    category: transaction.category ?? '',
    walletId,
    date: transaction.date ?? todayYmd(),
    type: transaction.type === 'receita' ? 'receita' : 'despesa',
    valueDisplay,
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

export function validateInlineDraft(draft: InlineTransactionDraft): InlineFieldErrors {
  const valueNum = parseInlineValue(draft.valueDisplay);
  return {
    value: !draft.valueDisplay.trim() || valueNum <= 0,
    category: !draft.category.trim(),
    wallet: !draft.walletId?.trim(),
    description: !draft.description.trim(),
  };
}

export function isInlineDraftValid(draft: InlineTransactionDraft): boolean {
  const errors = validateInlineDraft(draft);
  return !errors.value && !errors.category && !errors.wallet && !errors.description;
}

export function buildTransactionPayload(draft: InlineTransactionDraft): Transaction {
  return {
    description: draft.description.trim(),
    category: draft.category,
    walletId: draft.walletId?.trim() || NO_WALLET_ID,
    date: draft.date,
    type: draft.type,
    value: parseInlineValue(draft.valueDisplay),
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
