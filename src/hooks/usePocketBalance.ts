import { useMemo } from 'react';
import { useUserTransactions } from '@/utils/services/api/transation';
import { isPocketWalletId, LEGACY_POCKET_CARD_NAME } from '@/constants/wallets';
import { useWalletsStore } from '@/store/useWalletsStore';

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

    return useMemo(() => {
        const pocketTransactions = transactions.filter((t) => {
            const walletId = (t as { walletId?: string; cardId?: string }).walletId
                || (t as { cardId?: string }).cardId;
            return isPocketWalletId(walletId) || walletId === legacyPocketId;
        });
        return pocketTransactions.reduce((acc, t) => {
            return t.type === 'receita' ? acc + t.value : acc - t.value;
        }, 0);
    }, [transactions, legacyPocketId]);
}
