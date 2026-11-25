import type { WalletAllocation } from '@/utils/transaction-allocations';

export type TransactionType = 'receita' | 'despesa' | 'conta';

export interface Transaction {
    id?: string;
    value: number;
    date: string;
    description: string;
    category: string;
    type: TransactionType;
    paid?: boolean;
    skipped?: boolean;
    walletId: string;
    cardId?: string;
    allocations?: WalletAllocation[];
    recurrenceId?: string;
}
