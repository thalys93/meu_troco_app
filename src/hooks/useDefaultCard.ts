import { useEffect, useRef } from 'react';
import { useWalletsStore } from '@/store/useWalletsStore';
import useUserStore from '@/store/UserStore';
import { POCKET_WALLET_NAME } from '@/constants/wallets';

/**
 * Garante o carregamento inicial dos cartões do usuário.
 * O "Bolso" (Sem Cartão) é agora opção fixa na UI e não é mais criado no Firebase.
 */
export const useDefaultCard = () => {
    const { user } = useUserStore();
    const { wallets, fetchWallets } = useWalletsStore();
    const hasCheckedRef = useRef(false);

    useEffect(() => {
        if (!user?.uid || hasCheckedRef.current) return;
        hasCheckedRef.current = true;
        fetchWallets(user.uid);
    }, [user?.uid, fetchWallets]);

    return {
        defaultCardName: POCKET_WALLET_NAME,
        hasDefaultCard: true,
    };
};
