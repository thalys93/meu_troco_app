import { useMemo } from 'react';
import { useUserTransactions } from '@/utils/services/api/transation';
import { isPocketCardId, POCKET_CARD_NAME } from '@/constants/cards';
import { useCardsStore } from '@/store/useCardsStore';

/**
 * Saldo do "Bolso" (Sem Cartão): soma de receitas menos despesas
 * para transações com cardId vazio, 'no_card' ou id do cartão legado "Sem Cartão (Bolso)".
 * Não depende do Firebase para o conceito de Bolso; só das transações.
 */
export function usePocketBalance(): number {
    const { data: transactions = [] } = useUserTransactions();
    const { cards } = useCardsStore();

    const legacyPocketId = useMemo(
        () => cards.find((c) => c.name === POCKET_CARD_NAME)?.id,
        [cards]
    );

    return useMemo(() => {
        const pocketTransactions = transactions.filter((t) => {
            const cardId = (t as { cardId?: string }).cardId;
            return isPocketCardId(cardId) || cardId === legacyPocketId;
        });
        return pocketTransactions.reduce((acc, t) => {
            return t.type === 'receita' ? acc + t.value : acc - t.value;
        }, 0);
    }, [transactions, legacyPocketId]);
}
