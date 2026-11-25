import assert from 'node:assert/strict';
import type { Recurrence } from '@/types/Recurrence';
import type { Wallet } from '@/types/Wallet';
import type { Transaction } from '@/types/entities/Transaction';
import { computeRankMetrics } from './rank-metrics';
import { resolveAchievedRank } from './rank-resolution';
import type { RankTier } from '@/types/backoffice';

const tx = (
    partial: Partial<Transaction> & Pick<Transaction, 'type' | 'value' | 'date'>,
): Transaction => ({
    description: '',
    category: '',
    walletId: 'w1',
    ...partial,
});

const baseInput = {
    wallets: [] as Wallet[],
    recurrences: [] as Recurrence[],
    todayYmd: '2026-08-05',
    currentMonthKey: '2026-08',
};

assert.equal(
    computeRankMetrics({
        ...baseInput,
        transactions: [
            tx({ type: 'receita', value: 100, date: '2026-08-05' }),
            tx({ type: 'despesa', value: 30, date: '2026-08-05', skipped: true }),
            tx({ type: 'despesa', value: 20, date: '2026-08-04' }),
        ],
    }).transactions_count,
    2,
);

assert.equal(
    computeRankMetrics({
        ...baseInput,
        transactions: [
            tx({ type: 'receita', value: 50, date: '2026-06-10' }),
            tx({ type: 'receita', value: 50, date: '2026-07-10' }),
        ],
    }).income_months,
    2,
);

assert.equal(
    computeRankMetrics({
        ...baseInput,
        todayYmd: '2026-08-05',
        transactions: [
            tx({ type: 'receita', value: 10, date: '2026-08-05' }),
            tx({ type: 'receita', value: 10, date: '2026-08-04' }),
            tx({ type: 'despesa', value: 50, date: '2026-08-03' }),
        ],
    }).savings_streak_days,
    2,
);

const recurrences: Recurrence[] = [
    {
        description: 'Aluguel',
        category: 'casa',
        type: 'despesa',
        estimatedValue: 1000,
        walletId: 'w1',
    },
];

assert.equal(
    computeRankMetrics({
        ...baseInput,
        recurrences,
        transactions: [
            tx({ type: 'despesa', value: 400, date: '2026-08-01' }),
            tx({ type: 'conta', value: 200, date: '2026-08-15' }),
        ],
    }).budget_adherence_days,
    31,
);

assert.equal(
    computeRankMetrics({
        ...baseInput,
        recurrences,
        transactions: [
            tx({ type: 'despesa', value: 800, date: '2026-08-01' }),
            tx({ type: 'conta', value: 300, date: '2026-08-15' }),
        ],
    }).budget_adherence_days,
    0,
);

assert.equal(
    computeRankMetrics({
        ...baseInput,
        transactions: [
            tx({ type: 'receita', value: 2000, date: '2026-08-01' }),
            tx({ type: 'despesa', value: 500, date: '2026-08-10' }),
            tx({ type: 'receita', value: 100, date: '2026-07-01' }),
            tx({ type: 'despesa', value: 200, date: '2026-07-10' }),
        ],
    }).goals_completed,
    1,
);

const tierL1: RankTier = {
    slug: 't1',
    localized: { pt: { title: 'T1', description: '' } },
    level: 1,
    icon: 'Shield',
    color: '#000',
    minPoints: 0,
    status: 'active',
    criteria: [{ id: 'c1', metric: 'transactions_count', targetValue: 2 }],
};

const tierL2: RankTier = {
    slug: 't2',
    localized: { pt: { title: 'T2', description: '' } },
    level: 2,
    icon: 'Shield',
    color: '#111',
    minPoints: 0,
    status: 'active',
    criteria: [{ id: 'c2', metric: 'transactions_count', targetValue: 10 }],
};

const metrics = computeRankMetrics({
    ...baseInput,
    transactions: [
        tx({ type: 'receita', value: 1, date: '2026-08-01' }),
        tx({ type: 'receita', value: 1, date: '2026-08-02' }),
        tx({ type: 'receita', value: 1, date: '2026-08-03' }),
    ],
});

assert.equal(resolveAchievedRank([tierL1, tierL2], metrics)?.level, 1);

console.log('rank-metrics.check.ts: ok');
