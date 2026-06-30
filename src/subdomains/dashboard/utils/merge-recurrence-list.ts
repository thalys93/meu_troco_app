import type { Recurrence } from '@/types/Recurrence';
import type { Transaction } from '@/utils/services/api/transation';
import type { TransactionListFiltersPreference, TransactionSortOrder, TransactionTableSortColumn } from '@/subdomains/dashboard/context/dashboard-preferences';
import { isRecurrenceGeneratedForMonth } from './recurrence';
import { compareTransactionsByColumn, transactionMatchesTypeFilter, type TransactionFilterOptions } from './transaction-filters';
import { transactionSignedAmount } from './transaction-month-nets';

export type TransactionListItem =
  | { kind: 'transaction'; data: Transaction }
  | { kind: 'recurrence-template'; data: Recurrence; status: 'pending' };

export function getItemSignedAmount(item: TransactionListItem): number {
  if (item.kind === 'recurrence-template') {
    const type = item.data.type;
    const value = item.data.estimatedValue;
    if (type === 'receita') return value;
    return -value;
  }
  return transactionSignedAmount(item.data);
}

export function recurrenceMatchesTypeFilter(
  recurrence: Recurrence,
  types: string[]
): boolean {
  return transactionMatchesTypeFilter(recurrence.type, types);
}

export function mergeRecurrenceListItems(
  transactions: Transaction[],
  recurrences: Recurrence[],
  monthKey: string,
  types: string[]
): TransactionListItem[] {
  const transactionItems: TransactionListItem[] = transactions.map((data) => ({
    kind: 'transaction',
    data,
  }));

  const pendingTemplates: TransactionListItem[] = recurrences
    .filter((rec) => rec.type !== 'receita')
    .filter((rec) => !isRecurrenceGeneratedForMonth(rec, monthKey))
    .filter((rec) => recurrenceMatchesTypeFilter(rec, types))
    .map((data) => ({
      kind: 'recurrence-template' as const,
      data,
      status: 'pending' as const,
    }));

  return [...transactionItems, ...pendingTemplates];
}

export function compareListItemsByColumn(
  a: TransactionListItem,
  b: TransactionListItem,
  column: TransactionTableSortColumn,
  order: TransactionSortOrder,
  options?: TransactionFilterOptions
): number {
  const direction = order === 'asc' ? 1 : -1;

  if (a.kind === 'recurrence-template' && b.kind === 'recurrence-template') {
    switch (column) {
      case 'description':
        return (
          a.data.description.localeCompare(b.data.description, undefined, {
            sensitivity: 'base',
          }) * direction
        );
      case 'category': {
        const resolveCategoryLabel = options?.resolveCategoryLabel ?? ((v) => v);
        return (
          resolveCategoryLabel(a.data.category).localeCompare(
            resolveCategoryLabel(b.data.category),
            undefined,
            { sensitivity: 'base' }
          ) * direction
        );
      }
      case 'type':
        return a.data.type.localeCompare(b.data.type) * direction;
      case 'value':
        return (a.data.estimatedValue - b.data.estimatedValue) * direction;
      case 'date':
        return (
          ((a.data.dueDay ?? 0) - (b.data.dueDay ?? 0)) * direction
        );
      case 'wallet': {
        const resolveWalletName = options?.resolveWalletName ?? (() => '');
        return (
          resolveWalletName(a.data.walletId).localeCompare(
            resolveWalletName(b.data.walletId),
            undefined,
            { sensitivity: 'base' }
          ) * direction
        );
      }
      default:
        return 0;
    }
  }

  if (a.kind === 'transaction' && b.kind === 'transaction') {
    return compareTransactionsByColumn(a.data, b.data, column, order, options);
  }

  if (a.kind === 'recurrence-template') return direction;
  return -direction;
}

export function sortListItems(
  items: TransactionListItem[],
  filters: TransactionListFiltersPreference,
  options?: TransactionFilterOptions
): TransactionListItem[] {
  return [...items].sort((a, b) =>
    compareListItemsByColumn(
      a,
      b,
      filters.tableSortColumn,
      filters.tableSortOrder,
      options
    )
  );
}

export function sumRealizado(transactions: Transaction[]): number {
  return transactions.reduce((acc, tr) => acc + transactionSignedAmount(tr), 0);
}

export function sumPendingRecurrences(
  recurrences: Recurrence[],
  monthKey: string,
  types: string[]
): number {
  return recurrences
    .filter((rec) => rec.type !== 'receita')
    .filter((rec) => !isRecurrenceGeneratedForMonth(rec, monthKey))
    .filter((rec) => recurrenceMatchesTypeFilter(rec, types))
    .reduce((acc, rec) => {
      const signed = rec.type === 'receita' ? rec.estimatedValue : -rec.estimatedValue;
      return acc + signed;
    }, 0);
}

export function sumPrevisto(
  transactions: Transaction[],
  recurrences: Recurrence[],
  monthKey: string,
  types: string[]
): number {
  return (
    sumRealizado(transactions) +
    sumPendingRecurrences(recurrences, monthKey, types)
  );
}

export function getRecurrenceById(
  recurrences: Recurrence[],
  id?: string
): Recurrence | undefined {
  if (!id) return undefined;
  return recurrences.find((rec) => rec.id === id);
}
