import { LEGACY_POCKET_CARD_NAME } from '@/constants/wallets';
import type { RankCriterionMetric } from '@/types/backoffice';
import type { Recurrence } from '@/types/Recurrence';
import type { Wallet } from '@/types/Wallet';
import {
    computePocketBalance,
    computeWalletDisplayBalance,
} from '@/utils/wallet-balance';
import type { Transaction } from '@/types/entities/Transaction';
import { sumEstimatedMonthly } from '@/subdomains/dashboard/utils/recurrence';
import { getMonthRangeByKey, parseLocalDateInput } from '@/subdomains/dashboard/utils/month-range';
import { countRankableWallets } from '@/subdomains/dashboard/utils/rank-wallet-utils';

const countableTransactions = (transactions: Transaction[]): Transaction[] =>
    transactions.filter((tr) => tr.skipped !== true);

export type RankMetricsInput = {
    transactions: Transaction[];
    wallets: Wallet[];
    recurrences: Recurrence[];
    todayYmd: string;
    currentMonthKey: string;
};

export type RankMetricsSnapshot = Record<RankCriterionMetric, number>;

const monthKeyFromDate = (date: string): string | null => {
    if (!date || date.length < 7) return null;
    const key = date.slice(0, 7);
    return /^\d{4}-\d{2}$/.test(key) ? key : null;
};

const ymdFromDate = (date: string): string | null => {
    if (!date) return null;
    const normalized = date.length >= 10 ? date.slice(0, 10) : date;
    return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
};

const daysInMonthKey = (monthKey: string): number => {
    const { endDate } = getMonthRangeByKey(monthKey);
    const end = parseLocalDateInput(endDate);
  return end.getDate();
};

const addDaysToYmd = (ymd: string, delta: number): string => {
    const date = parseLocalDateInput(ymd);
    date.setDate(date.getDate() + delta);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const signedTransactionValue = (transaction: Transaction): number => {
    if (transaction.type === 'receita') return transaction.value;
    return -transaction.value;
};

function computeTransactionsCount(transactions: Transaction[]): number {
    return countableTransactions(transactions).length;
}

function computeIncomeMonths(transactions: Transaction[]): number {
    const months = new Set<string>();
    for (const tr of countableTransactions(transactions)) {
        if (tr.type !== 'receita') continue;
        const key = monthKeyFromDate(tr.date);
        if (key) months.add(key);
    }
    return months.size;
}

function computeSavingsTotal(input: RankMetricsInput): number {
    const { transactions, wallets, currentMonthKey } = input;
    const legacyPocketId = wallets.find((w) => w.name === LEGACY_POCKET_CARD_NAME)?.id;
    const pocketBalance = computePocketBalance(
        transactions,
        legacyPocketId ? [legacyPocketId] : [],
    );
    const walletsTotal = wallets.reduce(
        (acc, wallet) => acc + computeWalletDisplayBalance(wallet, transactions, currentMonthKey),
        0,
    );
    return Math.max(0, Math.round((pocketBalance + walletsTotal) * 100) / 100);
}

function buildDailyNetMap(transactions: Transaction[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const tr of countableTransactions(transactions)) {
        const ymd = ymdFromDate(tr.date);
        if (!ymd) continue;
        const prev = map.get(ymd) ?? 0;
        map.set(ymd, prev + signedTransactionValue(tr));
    }
    return map;
}

function computeSavingsStreakDays(transactions: Transaction[], todayYmd: string): number {
    const dailyNet = buildDailyNetMap(transactions);
    let streak = 0;
    let cursor = todayYmd;

    for (let guard = 0; guard < 4000; guard += 1) {
        const net = dailyNet.get(cursor) ?? 0;
        if (net < 0) break;
        streak += 1;
        cursor = addDaysToYmd(cursor, -1);
    }

    return streak;
}

function monthExpenseTotal(transactions: Transaction[], monthKey: string): number {
    return countableTransactions(transactions)
        .filter((tr) => tr.type === 'despesa' || tr.type === 'conta')
        .filter((tr) => monthKeyFromDate(tr.date) === monthKey)
        .reduce((acc, tr) => acc + tr.value, 0);
}

function monthIncomeTotal(transactions: Transaction[], monthKey: string): number {
    return countableTransactions(transactions)
        .filter((tr) => tr.type === 'receita')
        .filter((tr) => monthKeyFromDate(tr.date) === monthKey)
        .reduce((acc, tr) => acc + tr.value, 0);
}

function collectTransactionMonthKeys(transactions: Transaction[]): Set<string> {
    const keys = new Set<string>();
    for (const tr of countableTransactions(transactions)) {
        const key = monthKeyFromDate(tr.date);
        if (key) keys.add(key);
    }
    return keys;
}

function computeBudgetAdherenceDays(
    transactions: Transaction[],
    recurrences: Recurrence[],
): number {
    const monthlyBudget = sumEstimatedMonthly(recurrences);
    if (monthlyBudget <= 0) return 0;

    const monthKeys = collectTransactionMonthKeys(transactions);
    let totalDays = 0;

    for (const monthKey of monthKeys) {
        const spent = monthExpenseTotal(transactions, monthKey);
        if (spent <= monthlyBudget) {
            totalDays += daysInMonthKey(monthKey);
        }
    }

    return totalDays;
}

function computeGoalsCompleted(transactions: Transaction[]): number {
    const monthKeys = collectTransactionMonthKeys(transactions);
    let count = 0;

    for (const monthKey of monthKeys) {
        const income = monthIncomeTotal(transactions, monthKey);
        const outflow = monthExpenseTotal(transactions, monthKey);
        if (income > outflow) count += 1;
    }

    return count;
}

export function computeRankMetrics(input: RankMetricsInput): RankMetricsSnapshot {
    const walletCount = countRankableWallets(input.wallets);

    return {
        transactions_count: computeTransactionsCount(input.transactions),
        savings_total: computeSavingsTotal(input),
        savings_streak_days: computeSavingsStreakDays(input.transactions, input.todayYmd),
        budget_adherence_days: computeBudgetAdherenceDays(input.transactions, input.recurrences),
        wallets_count: walletCount,
        cards_count: walletCount,
        income_months: computeIncomeMonths(input.transactions),
        goals_completed: computeGoalsCompleted(input.transactions),
    };
}
