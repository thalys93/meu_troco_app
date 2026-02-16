import { useEffect, useRef } from 'react';
import { useCardsStore } from '../store/useCardsStore';
import { useUserTransactions } from '@/utils/services/api/transation';
import useUserStore from '@/store/UserStore';

const DEFAULT_CARD_NAME = 'Sem Cartão (Bolso)';
const DEFAULT_CARD_TYPE = 'debit' as const;
const DEFAULT_CARD_COLOR = '#6b7280'; // gray-500
const DEFAULT_CARD_FLAG = 'Other';

export const useDefaultCard = () => {
    const { user } = useUserStore();
    const { cards, addCard, deleteCard, fetchCards } = useCardsStore();
    const { data: transactions = [] } = useUserTransactions();

    // Refs para evitar loops e condições de corrida
    const isProcessingRef = useRef(false);
    const hasCheckedRef = useRef(false);

    useEffect(() => {
        const manageDefaultCard = async () => {
            if (!user?.uid || isProcessingRef.current) return;

            // 1. Carregamento Inicial: Se não temos cartões e ainda não checamos, buscamos do servidor
            if (cards.length === 0 && !hasCheckedRef.current) {
                isProcessingRef.current = true;
                try {
                    await fetchCards(user.uid);
                } finally {
                    isProcessingRef.current = false;
                    hasCheckedRef.current = true;
                }
                return;
            }

            isProcessingRef.current = true;

            try {
                // 2. Identificar cartões padrão existentes
                const defaultCards = cards.filter(c => c.name === DEFAULT_CARD_NAME);

                // 3. LIMPEZA: Se houver duplicatas (causadas pelo bug anterior), remover extras
                if (defaultCards.length > 1) {
                    console.log(`[useDefaultCard] Encontradas duplicatas (${defaultCards.length}). Iniciando limpeza...`);
                    // Mantém o primeiro, remove o restante
                    const [_keep, ...remove] = defaultCards;

                    // Removemos um por vez. O store vai atualizar, o efeito vai rodar de novo
                    // e continuar removendo até sobrar 1.
                    const cardToRemove = remove[0];
                    if (cardToRemove && cardToRemove.id) {
                        await deleteCard(cardToRemove.id);
                    }
                    return;
                }

                // 4. CRIAÇÃO: Se não houver nenhum, criar
                if (defaultCards.length === 0) {
                    console.log('[useDefaultCard] Criando cartão padrão...');

                    const transactionsWithoutCard = transactions.filter(t => !(t as any).cardId);
                    const initialBalance = transactionsWithoutCard.reduce((acc, t) => {
                        return t.type === 'receita' ? acc + t.value : acc - t.value;
                    }, 0);

                    await addCard({
                        userId: user.uid,
                        name: DEFAULT_CARD_NAME,
                        balance: initialBalance,
                        type: DEFAULT_CARD_TYPE,
                        color: DEFAULT_CARD_COLOR,
                        flag: DEFAULT_CARD_FLAG,
                    });
                }

            } catch (error) {
                console.error('[useDefaultCard] Erro:', error);
            } finally {
                isProcessingRef.current = false;
            }
        };

        manageDefaultCard();
    }, [user?.uid, cards, transactions, addCard, deleteCard, fetchCards]);

    return {
        defaultCardName: DEFAULT_CARD_NAME,
        hasDefaultCard: cards.some(c => c.name === DEFAULT_CARD_NAME),
    };
};
