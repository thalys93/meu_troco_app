import { parseLocalDateInput, parseMonthKey } from "@/subdomains/dashboard/utils/month-range";
import type { Wallet } from "@/types/Wallet";
import type { Transaction } from "@/types/entities/Transaction";
import { resolveAllocations, roundMoney } from "@/utils/transaction-allocations";
import { getBillingCycleRange } from "@/utils/wallet-balance";

const DEFAULT_BILLING_CLOSING_DAY = 1;
const DEFAULT_DUE_DAY_OFFSET = 10;

const clampCycleDay = (value?: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value ?? 1), 1), 28);
};

/**
 * Determina o mês da fatura baseado na data da transação e dia de fechamento.
 * Exemplo: fechamento dia 25, compra dia 20/11 → fatura de novembro
 * Exemplo: fechamento dia 25, compra dia 26/11 → fatura de dezembro
 */
export function getBillingMonth(transactionDate: string, closingDay: number): string {
  const date = parseLocalDateInput(transactionDate);
  const day = clampCycleDay(closingDay);
  const transactionDay = date.getDate();

  if (transactionDay <= day) {
    // A transação está dentro do ciclo de fechamento do mês atual
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  } else {
    // A transação está no próximo ciclo (próximo mês)
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
  }
}

/**
 * Filtra transações que pertencem a uma fatura específica de um cartão.
 */
export function filterTransactionsByStatement(
  transactions: Transaction[],
  walletId: string,
  monthKey: string,
  closingDay: number
): Transaction[] {
  const { start, end } = getBillingCycleRange(monthKey, closingDay);
  return transactions.filter((transaction) => {
    const transactionDate = parseLocalDateInput(transaction.date);
    const time = transactionDate.getTime();
    if (time < start.getTime() || time > end.getTime()) return false;

    // Verifica se a transação está associada a este wallet
    const allocations = resolveAllocations(transaction);
    return allocations.some((allocation) => allocation.walletId === walletId);
  });
}

/**
 * Calcula o valor total da fatura do mês para um cartão de crédito.
 */
export function calculateStatementAmount(
  wallet: Wallet,
  transactions: Transaction[],
  monthKey: string
): number {
  if (wallet.type !== "credit") return 0;

  const closingDay = clampCycleDay(wallet.billingClosingDay ?? DEFAULT_BILLING_CLOSING_DAY);
  const statementTransactions = filterTransactionsByStatement(
    transactions,
    wallet.id,
    monthKey,
    closingDay
  );

  return roundMoney(
    statementTransactions.reduce((total, transaction) => {
      if (transaction.type !== "despesa") return total;
      const allocations = resolveAllocations(transaction);
      const walletAllocation = allocations.find((a) => a.walletId === wallet.id);
      return total + (walletAllocation?.amount ?? 0);
    }, 0)
  );
}

/**
 * Calcula a previsão da fatura do próximo mês.
 */
export function calculateNextMonthStatement(
  wallet: Wallet,
  transactions: Transaction[],
  currentMonthKey: string
): number {
  if (wallet.type !== "credit") return 0;

  const currentDate = parseMonthKey(currentMonthKey);
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const nextMonthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  return calculateStatementAmount(wallet, transactions, nextMonthKey);
}

/**
 * Calcula o limite disponível do cartão considerando a fatura atual.
 */
export function calculateAvailableLimit(
  wallet: Wallet,
  transactions: Transaction[],
  monthKey: string
): number {
  if (wallet.type !== "credit") return 0;

  const creditLimit = wallet.creditLimit ?? 0;
  const currentStatement = calculateStatementAmount(wallet, transactions, monthKey);
  return roundMoney(creditLimit - currentStatement);
}

/**
 * Calcula a data de vencimento da fatura baseada no mês e dia de vencimento do cartão.
 */
export function getStatementDueDate(wallet: Wallet, monthKey: string): Date {
  const dueDay = clampCycleDay(wallet.dueDay ?? 1);
  const monthDate = parseMonthKey(monthKey);
  return new Date(monthDate.getFullYear(), monthDate.getMonth(), dueDay);
}

/**
 * Retorna um resumo da fatura para exibição na UI.
 */
export interface StatementSummary {
  monthKey: string;
  amount: number;
  dueDate: Date;
  transactionCount: number;
}

/**
 * Gera um histórico de faturas para os últimos N meses.
 */
export function getStatementHistory(
  wallet: Wallet,
  transactions: Transaction[],
  currentMonthKey: string,
  months: number = 6
): StatementSummary[] {
  if (wallet.type !== "credit") return [];

  const history: StatementSummary[] = [];
  const currentDate = parseMonthKey(currentMonthKey);

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

    const closingDay = clampCycleDay(wallet.billingClosingDay ?? DEFAULT_BILLING_CLOSING_DAY);
    const statementTransactions = filterTransactionsByStatement(
      transactions,
      wallet.id,
      monthKey,
      closingDay
    );

    history.push({
      monthKey,
      amount: calculateStatementAmount(wallet, transactions, monthKey),
      dueDate: getStatementDueDate(wallet, monthKey),
      transactionCount: statementTransactions.length,
    });
  }

  return history;
}
