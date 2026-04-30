import { useWalletsStore } from "@/store/useWalletsStore";

export const useCardsStore = () => {
    const {
        wallets,
        isLoading,
        error,
        fetchWallets,
        addWallet,
        updateWallet,
        deleteWallet,
        reorderWallets,
        selectTotalBalance,
    } = useWalletsStore();

    return {
        cards: wallets,
        isLoading,
        error,
        fetchCards: fetchWallets,
        addCard: addWallet,
        updateCard: updateWallet,
        deleteCard: deleteWallet,
        reorderCards: reorderWallets,
        selectTotalBalance,
    };
};
