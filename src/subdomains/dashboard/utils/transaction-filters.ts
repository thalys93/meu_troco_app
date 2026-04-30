import { NO_WALLET_ID } from "@/constants/wallets";
import { Transaction } from "@/utils/services/api/transation";
import { TransactionListFiltersPreference } from "@/subdomains/dashboard/context/dashboard-preferences";
import {
  parseLocalDateInput,
  parseLocalDateInputAtEndOfDay,
  parseLocalDateInputAtStartOfDay,
} from "@/subdomains/dashboard/utils/month-range";

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());
const LEGACY_NO_CARD_ID = "no_card";

export type IncomeExpenseSummary = {
  incomeTotal: number;
  expenseTotal: number;
  incomeCount: number;
  expenseCount: number;
};

export const filterTransactionsByPreferences = (
  transactions: Transaction[],
  filters: TransactionListFiltersPreference
): Transaction[] => {
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
      const trWallet = tr.walletId || tr.cardId || NO_WALLET_ID;

      const isPocketFilter = filters.card === NO_WALLET_ID || filters.card === LEGACY_NO_CARD_ID;
      const isPocketTransaction = trWallet === NO_WALLET_ID || trWallet === LEGACY_NO_CARD_ID;
      const matchCard = filters.card === "Todos"
        ? true
        : isPocketFilter
          ? isPocketTransaction
          : trWallet === filters.card;
      const matchCategory = filters.categories.includes("Todos")
        ? true
        : filters.categories.includes(tr.category);
      const matchType = filters.type === "Todos" ? true : tr.type === filters.type;
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
    .sort((a, b) => {
      const bTime = parseLocalDateInput(b.date).getTime();
      const aTime = parseLocalDateInput(a.date).getTime();
      const safeB = Number.isNaN(bTime) ? Number.NEGATIVE_INFINITY : bTime;
      const safeA = Number.isNaN(aTime) ? Number.NEGATIVE_INFINITY : aTime;
      return safeB - safeA;
    });
};

export const summarizeIncomeExpense = (
  transactions: Transaction[]
): IncomeExpenseSummary => {
  const income = transactions.filter((tr) => tr.type === "receita");
  const expense = transactions.filter((tr) => tr.type === "despesa");

  return {
    incomeTotal: income.reduce((acc, tr) => acc + tr.value, 0),
    expenseTotal: expense.reduce((acc, tr) => acc + tr.value, 0),
    incomeCount: income.length,
    expenseCount: expense.length,
  };
};
