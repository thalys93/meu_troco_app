import { useEffect, useRef } from 'react';
import { useCardsStore } from '../store/useCardsStore';
import useUserStore from '@/store/UserStore';
import { POCKET_CARD_NAME } from '@/constants/cards';

/**
 * Garante o carregamento inicial dos cartões do usuário.
 * O "Bolso" (Sem Cartão) é agora opção fixa na UI e não é mais criado no Firebase.
 */
export const useDefaultCard = () => {
    const { user } = useUserStore();
    const { cards, fetchCards } = useCardsStore();
    const hasCheckedRef = useRef(false);

    useEffect(() => {
        if (!user?.uid || hasCheckedRef.current) return;
        hasCheckedRef.current = true;
        fetchCards(user.uid);
    }, [user?.uid, fetchCards]);

    return {
        defaultCardName: POCKET_CARD_NAME,
        hasDefaultCard: true,
    };
};
