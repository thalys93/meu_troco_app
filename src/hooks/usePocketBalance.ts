import { useMemo } from 'react';
import { useUserTransactions } from '@/utils/services/api/transation';
import { LEGACY_POCKET_CARD_NAME } from '@/constants/wallets';
import { useWalletsStore } from '@/store/useWalletsStore';
import { computePocketBalance } from '@/utils/wallet-balance';

/**
 * Saldo do "Bolso" (Sem Cartão): soma de receitas menos despesas
 * para transações com cardId vazio, 'no_card' ou id do cartão legado "Sem Cartão (Bolso)".
 * Não depende do Firebase para o conceito de Bolso; só das transações.
 */
export function usePocketBalance(): number {
    const { data: transactions = [] } = useUserTransactions();
    const { wallets } = useWalletsStore();

    const legacyPocketId = useMemo(
        () => wallets.find((wallet) => wallet.name === LEGACY_POCKET_CARD_NAME)?.id,
        [wallets]
    );

    return useMemo(() => computePocketBalance(transactions, legacyPocketId ? [legacyPocketId] : []), [transactions, legacyPocketId]);
}
