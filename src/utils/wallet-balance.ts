import { NO_WALLET_ID, isPocketWalletId } from "@/constants/wallets";
import { parseLocalDateInput, parseMonthKey } from "@/subdomains/dashboard/utils/month-range";
import type { FirebaseTimestamp } from "@/types/Firebase";
import type { Wallet } from "@/types/Wallet";
import type { Transaction } from "@/utils/services/api/transation";
import { resolveAllocations, roundMoney } from "@/utils/transaction-allocations";

const DEFAULT_BILLING_CLOSING_DAY = 1;
const DEFAULT_RELOAD_DAY = 1;

const clampCycleDay = (value?: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value ?? 1), 1), 28);
};

const getWalletInitialBalance = (wallet: Wallet) =>
  Number(wallet.initialBalance ?? wallet.balance ?? 0);

const getWalletCreditLimit = (wallet: Wallet) =>
  Number(wallet.creditLimit ?? wallet.balance ?? 0);

const timestampToDate = (value?: FirebaseTimestamp | Date) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const transactionDateMs = (transaction: Transaction) => {
  const date = parseLocalDateInput(transaction.date);
  const time = date.getTime();
  return Number.isNaN(time) ? null : time;
};

const isInRange = (transaction: Transaction, start: Date, end: Date) => {
  const time = transactionDateMs(transaction);
  if (time === null) return false;
  return time >= start.getTime() && time <= end.getTime();
};

const signedAmount = (type: Transaction["type"], amount: number) =>
  type === "receita" ? amount : -amount;

export function getBillingCycleRange(monthKey: string, closingDay = DEFAULT_BILLING_CLOSING_DAY) {
  const reference = parseMonthKey(monthKey);
  const day = clampCycleDay(closingDay);
  const start = new Date(reference.getFullYear(), reference.getMonth() - 1, day + 1, 0, 0, 0, 0);
  const end = new Date(reference.getFullYear(), reference.getMonth(), day, 23, 59, 59, 999);
  return { start, end };
}

export function filterTransactionsByMonth(transactions: Transaction[], monthKey: string) {
  return transactions.filter((transaction) => transaction.date?.startsWith(monthKey));
}

export function computeWalletNet(walletId: string, transactions: Transaction[]) {
  return roundMoney(
    transactions.reduce((total, transaction) => {
      const allocations = resolveAllocations(transaction);
      return total + allocations.reduce((allocationTotal, allocation) => {
        if ((allocation.walletId || NO_WALLET_ID) !== walletId) return allocationTotal;
        return allocationTotal + signedAmount(transaction.type, allocation.amount);
      }, 0);
    }, 0)
  );
}

export function computeWalletOutflow(walletId: string, transactions: Transaction[], monthKey: string) {
  const monthTransactions = filterTransactionsByMonth(transactions, monthKey);
  return roundMoney(
    monthTransactions.reduce((total, transaction) => {
      if (transaction.type !== "despesa") return total;
      const allocations = resolveAllocations(transaction);
      return total + allocations.reduce((allocationTotal, allocation) => {
        if ((allocation.walletId || NO_WALLET_ID) !== walletId) return allocationTotal;
        return allocationTotal + allocation.amount;
      }, 0);
    }, 0)
  );
}

export function computeWalletIncome(walletId: string, transactions: Transaction[], monthKey: string) {
  const monthTransactions = filterTransactionsByMonth(transactions, monthKey);
  return roundMoney(
    monthTransactions.reduce((total, transaction) => {
      if (transaction.type !== "receita") return total;
      const allocations = resolveAllocations(transaction);
      return total + allocations.reduce((allocationTotal, allocation) => {
        if ((allocation.walletId || NO_WALLET_ID) !== walletId) return allocationTotal;
        return allocationTotal + allocation.amount;
      }, 0);
    }, 0)
  );
}

export function computePocketBalance(transactions: Transaction[], extraPocketWalletIds: string[] = []) {
  const extraIds = new Set(extraPocketWalletIds.filter(Boolean));
  return roundMoney(
    transactions.reduce((total, transaction) => {
      const allocations = resolveAllocations(transaction);
      return total + allocations.reduce((allocationTotal, allocation) => {
        const walletId = allocation.walletId || NO_WALLET_ID;
        if (!isPocketWalletId(walletId) && !extraIds.has(walletId)) return allocationTotal;
        return allocationTotal + signedAmount(transaction.type, allocation.amount);
      }, 0);
    }, 0)
  );
}

export function computeDebitBalance(wallet: Wallet, transactions: Transaction[]) {
  return roundMoney(getWalletInitialBalance(wallet) + computeWalletNet(wallet.id, transactions));
}

export function computeCreditAvailableLimit(wallet: Wallet, transactions: Transaction[], monthKey: string) {
  const { start, end } = getBillingCycleRange(monthKey, wallet.billingClosingDay);
  const cycleTransactions = transactions.filter((transaction) => isInRange(transaction, start, end));
  const cycleNet = computeWalletNet(wallet.id, cycleTransactions);
  return roundMoney(getWalletCreditLimit(wallet) + cycleNet);
}

export function countVoucherReloads(wallet: Wallet, referenceDate = new Date()) {
  const reloadAmount = Number(wallet.reloadAmount ?? 0);
  if (reloadAmount <= 0) return 0;

  const startDate = timestampToDate(wallet.createdAt) ?? new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const reloadDay = clampCycleDay(wallet.reloadDay ?? DEFAULT_RELOAD_DAY);
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), reloadDay);
  if (cursor.getTime() < startDate.getTime()) {
    cursor = new Date(startDate.getFullYear(), startDate.getMonth() + 1, reloadDay);
  }

  let count = 0;
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 23, 59, 59, 999);
  while (cursor.getTime() <= end.getTime()) {
    count += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, reloadDay);
  }
  return count;
}

export function computeVoucherBalance(wallet: Wallet, transactions: Transaction[], referenceDate = new Date()) {
  const reloadTotal = countVoucherReloads(wallet, referenceDate) * Number(wallet.reloadAmount ?? 0);
  return roundMoney(getWalletInitialBalance(wallet) + reloadTotal + computeWalletNet(wallet.id, transactions));
}

export function computeWalletDisplayBalance(wallet: Wallet, transactions: Transaction[], monthKey: string) {
  if (wallet.type === "credit") {
    return computeCreditAvailableLimit(wallet, transactions, monthKey);
  }
  if (wallet.type === "voucher") {
    const referenceMonth = parseMonthKey(monthKey);
    const monthEnd = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth() + 1, 0);
    return computeVoucherBalance(wallet, transactions, monthEnd);
  }
  return computeDebitBalance(wallet, transactions);
}

export function computeWalletFlowRow(wallet: Wallet, transactions: Transaction[], monthKey: string) {
  const income = computeWalletIncome(wallet.id, transactions, monthKey);
  const expense = computeWalletOutflow(wallet.id, transactions, monthKey);
  return {
    walletId: wallet.id,
    walletName: wallet.name,
    walletColor: wallet.color || "#6366f1",
    income,
    expense,
    net: roundMoney(income - expense),
  };
}
