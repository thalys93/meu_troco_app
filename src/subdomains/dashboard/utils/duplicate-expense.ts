import type { Transaction } from "@/utils/services/api/transation";
import { NO_WALLET_ID } from "@/constants/wallets";
import {
  type FinancialPeriodPreference,
  defaultFinancialPeriodPreference,
  getFinancialMonthKeyForDate,
  getFinancialPeriodRange,
  getLocalTodayYmd,
  isYmdWithinRange,
} from "./month-range";

/** Copia descrição, valor, tipo, carteira e categoria para a data de hoje no período financeiro corrente. */
export const duplicateTransactionToCurrentPeriod = (
  source: Transaction,
  prefs: FinancialPeriodPreference = defaultFinancialPeriodPreference,
  addedAt: Date = new Date()
): Omit<Transaction, "id"> => {
  const monthKey = getFinancialMonthKeyForDate(addedAt, prefs);
  const { startDate, endDate } = getFinancialPeriodRange(monthKey, prefs);

  let date = getLocalTodayYmd(addedAt);
  if (!isYmdWithinRange(date, startDate, endDate)) {
    if (date < startDate) date = startDate;
    else if (date > endDate) date = endDate;
  }

  const payload: Omit<Transaction, "id"> = {
    description: source.description,
    value: source.value,
    type: source.type,
    date,
    category: source.category,
    walletId: source.walletId || NO_WALLET_ID,
  };

  if (source.cardId) payload.cardId = source.cardId;
  if (source.allocations && source.allocations.length >= 2) {
    payload.allocations = source.allocations.map((a) => ({ ...a }));
  }

  if (source.type === "conta" || source.type === "despesa") {
    payload.paid = false;
    payload.skipped = false;
  }

  return payload;
};
