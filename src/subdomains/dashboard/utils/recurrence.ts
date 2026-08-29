import type { Recurrence } from '@/types/Recurrence';
import type { Transaction } from '@/utils/services/api/transation';
import { getMonthRangeByKey, parseMonthKey } from './month-range';

export type RecurrenceAmountPeriod = 'month' | 'week';

export const WEEKS_PER_MONTH = 52 / 12;

export const toMonthlyEstimatedValue = (
  amount: number,
  period: RecurrenceAmountPeriod
): number => (period === 'week' ? amount * WEEKS_PER_MONTH : amount);

export const sumEstimatedMonthly = (recurrences: Recurrence[]): number =>
  recurrences.reduce((acc, item) => acc + item.estimatedValue, 0);

export const isRecurrenceGeneratedForMonth = (
  recurrence: Recurrence,
  monthKey: string
): boolean => recurrence.lastGeneratedMonth === monthKey;

export const buildRecurrenceDateForMonth = (monthKey: string): string => {
  const monthDate = parseMonthKey(monthKey);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
};

const recurrenceTransactionBase = (
  recurrence: Recurrence,
  monthKey: string
): Partial<Transaction> => ({
  description: recurrence.description,
  category: recurrence.category,
  value: recurrence.estimatedValue,
  date: buildRecurrenceDateForMonth(monthKey),
  walletId: recurrence.walletId,
  type: 'despesa',
  ...(recurrence.allocations && recurrence.allocations.length >= 2
    ? { allocations: recurrence.allocations }
    : {}),
});

export const buildTransactionPrefillFromRecurrence = (
  recurrence: Recurrence,
  monthKey: string
): Partial<Transaction> => recurrenceTransactionBase(recurrence, monthKey);

export const buildTransactionFromRecurrence = (
  recurrence: Recurrence,
  monthKey: string
): Transaction =>
  ({
    ...recurrenceTransactionBase(recurrence, monthKey),
    recurrenceId: recurrence.id,
  }) as Transaction;

export const formatMonthLabel = (monthKey: string, locale: string): string => {
  const date = parseMonthKey(monthKey);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
};

export const getMonthRangeLabel = (monthKey: string): string => {
  const { startDate, endDate } = getMonthRangeByKey(monthKey);
  return `${startDate} — ${endDate}`;
};
