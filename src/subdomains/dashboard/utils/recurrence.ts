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

export const buildRecurrenceDateForMonth = (
  monthKey: string,
  dueDay?: number
): string => {
  const monthDate = parseMonthKey(monthKey);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = dueDay ? Math.min(dueDay, lastDay) : 1;
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const buildTransactionPrefillFromRecurrence = (
  recurrence: Recurrence,
  monthKey: string
): Partial<Transaction> => ({
  description: recurrence.description,
  category: recurrence.category,
  value: recurrence.estimatedValue,
  date: buildRecurrenceDateForMonth(monthKey, recurrence.dueDay),
  walletId: recurrence.walletId,
  type: recurrence.type,
  ...(recurrence.type === 'conta' ? { paid: false } : {}),
});

export const buildTransactionFromRecurrence = (
  recurrence: Recurrence,
  monthKey: string,
  options?: { paid?: boolean }
): Transaction => ({
  description: recurrence.description,
  category: recurrence.category,
  value: recurrence.estimatedValue,
  date: buildRecurrenceDateForMonth(monthKey, recurrence.dueDay),
  walletId: recurrence.walletId,
  type: recurrence.type,
  recurrenceId: recurrence.id,
  ...(recurrence.type === 'conta' ? { paid: options?.paid ?? false } : {}),
});

export const formatMonthLabel = (monthKey: string, locale: string): string => {
  const date = parseMonthKey(monthKey);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
};

export const getMonthRangeLabel = (monthKey: string): string => {
  const { startDate, endDate } = getMonthRangeByKey(monthKey);
  return `${startDate} — ${endDate}`;
};
