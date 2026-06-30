import { NO_WALLET_ID, isPocketWalletId } from "@/constants/wallets";
import { resolveAllocations } from "@/utils/transaction-allocations";
import { transactionCategoryMatchesFilter } from "@/hooks/use-categories";
import type { Category } from "@/types/Category";
import { Transaction, type TransactionType } from "@/utils/services/api/transation";
import { TransactionListFiltersPreference, type TransactionSortOrder, type TransactionTableSortColumn } from "@/subdomains/dashboard/context/dashboard-preferences";
import {
  parseLocalDateInput,
  parseLocalDateInputAtEndOfDay,
  parseLocalDateInputAtStartOfDay,
} from "@/subdomains/dashboard/utils/month-range";

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());
const LEGACY_NO_CARD_ID = "no_card";
const TRANSACTION_TYPE_FILTER_ALL = "Todos";

export function toggleTransactionTypes(
  current: string[],
  clicked: string
): string[] {
  if (clicked === TRANSACTION_TYPE_FILTER_ALL) {
    return [TRANSACTION_TYPE_FILTER_ALL];
  }
  const withoutAll = current.filter((t) => t !== TRANSACTION_TYPE_FILTER_ALL);
  if (withoutAll.includes(clicked)) {
    const next = withoutAll.filter((t) => t !== clicked);
    return next.length === 0 ? [TRANSACTION_TYPE_FILTER_ALL] : next;
  }
  return [...withoutAll, clicked];
}

export function transactionMatchesTypeFilter(
  transactionType: string,
  types: string[]
): boolean {
  return (
    types.includes(TRANSACTION_TYPE_FILTER_ALL) ||
    types.includes(transactionType)
  );
}

export function isExclusiveContaTypeFilter(types: string[]): boolean {
  return types.length === 1 && types[0] === "conta";
}

export function shouldShowPaidColumn(types: string[]): boolean {
  return (
    types.includes(TRANSACTION_TYPE_FILTER_ALL) || types.includes("conta")
  );
}

export function resolveDefaultCreateType(types: string[]): TransactionType {
  const specific = types.filter((t) => t !== TRANSACTION_TYPE_FILTER_ALL);
  if (
    specific.length === 1 &&
    (specific[0] === "receita" ||
      specific[0] === "despesa" ||
      specific[0] === "conta")
  ) {
    return specific[0];
  }
  return "despesa";
}

export type IncomeExpenseSummary = {
  incomeTotal: number;
  expenseTotal: number;
  incomeCount: number;
  expenseCount: number;
};

export type TransactionTypesSummary = IncomeExpenseSummary & {
  billsTotal: number;
  billsCount: number;
  billsPaidCount: number;
  billsPendingCount: number;
  billsPaidTotal: number;
  billsPendingTotal: number;
};

export type TransactionFilterOptions = {
  categoryLookup?: Map<string, Category>;
  resolveWalletName?: (walletId?: string) => string;
  resolveCategoryLabel?: (categoryId: string) => string;
};

const DESC_DEFAULT_COLUMNS: TransactionTableSortColumn[] = ["date", "value"];

export function getDefaultSortOrderForColumn(
  column: TransactionTableSortColumn
): TransactionSortOrder {
  return DESC_DEFAULT_COLUMNS.includes(column) ? "desc" : "asc";
}

export function compareTransactionsByColumn(
  a: Transaction,
  b: Transaction,
  column: TransactionTableSortColumn,
  order: TransactionSortOrder,
  options?: TransactionFilterOptions
): number {
  const direction = order === "asc" ? 1 : -1;

  switch (column) {
    case "date": {
      const aTime = parseLocalDateInput(a.date).getTime();
      const bTime = parseLocalDateInput(b.date).getTime();
      const safeA = Number.isNaN(aTime) ? Number.NEGATIVE_INFINITY : aTime;
      const safeB = Number.isNaN(bTime) ? Number.NEGATIVE_INFINITY : bTime;
      return (safeA - safeB) * direction;
    }
    case "description":
      return (
        a.description.localeCompare(b.description, undefined, { sensitivity: "base" }) *
        direction
      );
    case "wallet": {
      const resolveWalletName = options?.resolveWalletName ?? (() => "");
      return (
        resolveWalletName(a.walletId).localeCompare(
          resolveWalletName(b.walletId),
          undefined,
          { sensitivity: "base" }
        ) * direction
      );
    }
    case "category": {
      const resolveCategoryLabel = options?.resolveCategoryLabel ?? ((value) => value);
      return (
        resolveCategoryLabel(a.category).localeCompare(
          resolveCategoryLabel(b.category),
          undefined,
          { sensitivity: "base" }
        ) * direction
      );
    }
    case "type":
      return a.type.localeCompare(b.type) * direction;
    case "paid": {
      const aPaid = isBillPaid(a) ? 1 : 0;
      const bPaid = isBillPaid(b) ? 1 : 0;
      return (aPaid - bPaid) * direction;
    }
    case "value":
      return (a.value - b.value) * direction;
    default:
      return 0;
  }
}

export const filterTransactionsByPreferences = (
  transactions: Transaction[],
  filters: TransactionListFiltersPreference,
  options?: TransactionFilterOptions
): Transaction[] => {
  const categoryLookup = options?.categoryLookup;
  const min = filters.minValue ? parseFloat(filters.minValue) : undefined;
  const max = filters.maxValue ? parseFloat(filters.maxValue) : undefined;
  const start = filters.startDate
    ? parseLocalDateInputAtStartOfDay(filters.startDate)
    : undefined;
  const end = filters.endDate
    ? parseLocalDateInputAtEndOfDay(filters.endDate)
    : undefined;
  const startMs = start && isValidDate(start) ? start.getTime() : undefined;
  const endMs = end && isValidDate(end) ? end.getTime() : undefined;

  return transactions
    .filter((tr) => {
      const trDate = parseLocalDateInput(tr.date);
      if (!isValidDate(trDate)) return false;
      const trDateMs = trDate.getTime();
      const isPocketFilter = filters.card === NO_WALLET_ID || filters.card === LEGACY_NO_CARD_ID;
      const matchCard =
        filters.card === "Todos"
          ? true
          : resolveAllocations(tr).some((allocation) => {
              const walletId = allocation.walletId || NO_WALLET_ID;
              return isPocketFilter
                ? isPocketWalletId(walletId) || walletId === LEGACY_NO_CARD_ID
                : walletId === filters.card;
            });
      const matchCategory = transactionCategoryMatchesFilter(
        tr.category,
        filters.categories,
        categoryLookup
      );
      const matchType = transactionMatchesTypeFilter(tr.type, filters.types);
      const matchMin = min !== undefined ? tr.value >= min : true;
      const matchMax = max !== undefined ? tr.value <= max : true;
      const matchStart = startMs !== undefined ? trDateMs >= startMs : true;
      const matchEnd = endMs !== undefined ? trDateMs <= endMs : true;

      return (
        matchCard &&
        matchCategory &&
        matchType &&
        matchMin &&
        matchMax &&
        matchStart &&
        matchEnd
      );
    })
    .sort((a, b) =>
      compareTransactionsByColumn(
        a,
        b,
        filters.tableSortColumn,
        filters.tableSortOrder,
        options
      )
    );
};

export const isBillPaid = (transaction: Transaction): boolean =>
  transaction.type === "conta" && transaction.paid === true;

export const isBillPending = (transaction: Transaction): boolean =>
  transaction.type === "conta" && !isBillPaid(transaction);

export const summarizeTransactionTypes = (
  transactions: Transaction[]
): TransactionTypesSummary => {
  const income = transactions.filter((tr) => tr.type === "receita");
  const expense = transactions.filter((tr) => tr.type === "despesa");
  const bills = transactions.filter((tr) => tr.type === "conta");
  const paidBills = bills.filter(isBillPaid);
  const pendingBills = bills.filter(isBillPending);

  return {
    incomeTotal: income.reduce((acc, tr) => acc + tr.value, 0),
    expenseTotal: expense.reduce((acc, tr) => acc + tr.value, 0),
    incomeCount: income.length,
    expenseCount: expense.length,
    billsTotal: bills.reduce((acc, tr) => acc + tr.value, 0),
    billsCount: bills.length,
    billsPaidCount: paidBills.length,
    billsPendingCount: pendingBills.length,
    billsPaidTotal: paidBills.reduce((acc, tr) => acc + tr.value, 0),
    billsPendingTotal: pendingBills.reduce((acc, tr) => acc + tr.value, 0),
  };
};

export const summarizeIncomeExpense = (
  transactions: Transaction[]
): IncomeExpenseSummary => {
  const summary = summarizeTransactionTypes(transactions);
  return {
    incomeTotal: summary.incomeTotal,
    expenseTotal: summary.expenseTotal,
    incomeCount: summary.incomeCount,
    expenseCount: summary.expenseCount,
  };
};

if (import.meta.env.DEV) {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`transaction-filters self-check: ${msg}`);
  };
  assert(
    JSON.stringify(toggleTransactionTypes(["Todos"], "despesa")) ===
      JSON.stringify(["despesa"]),
    "Todos -> despesa"
  );
  assert(
    JSON.stringify(toggleTransactionTypes(["despesa"], "conta")) ===
      JSON.stringify(["despesa", "conta"]),
    "add conta"
  );
  assert(
    JSON.stringify(toggleTransactionTypes(["despesa", "conta"], "despesa")) ===
      JSON.stringify(["conta"]),
    "remove despesa"
  );
  assert(
    JSON.stringify(toggleTransactionTypes(["conta"], "conta")) ===
      JSON.stringify(["Todos"]),
    "empty -> Todos"
  );
  assert(transactionMatchesTypeFilter("despesa", ["Todos"]), "Todos matches");
  assert(
    transactionMatchesTypeFilter("despesa", ["despesa", "conta"]),
    "multi matches despesa"
  );
  assert(
    !transactionMatchesTypeFilter("receita", ["despesa", "conta"]),
    "multi excludes receita"
  );
}
