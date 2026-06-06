import { create } from "zustand";
import { Wallet } from "@/types/Wallet";
import { WalletsService } from "@/utils/services/api/wallets-service";

interface WalletsState {
    wallets: Wallet[];
    isLoading: boolean;
    error: string | null;
    fetchWallets: (userId: string) => Promise<void>;
    addWallet: (wallet: Omit<Wallet, "id">) => Promise<void>;
    updateWallet: (id: string, wallet: Partial<Wallet>) => Promise<void>;
    deleteWallet: (id: string) => Promise<void>;
    reorderWallets: (orderedIds: string[]) => Promise<void>;
    selectTotalBalance: () => number;
}

export const useWalletsStore = create<WalletsState>((set, get) => ({
    wallets: [],
    isLoading: false,
    error: null,

    fetchWallets: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const list = await WalletsService.getAll(userId);
            const wallets = [...list].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            set({ wallets, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addWallet: async (wallet) => {
        set({ isLoading: true, error: null });
        try {
            const newWallet = await WalletsService.create(wallet);
            set((state) => ({
                wallets: [...state.wallets, newWallet],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    updateWallet: async (id, updatedWallet) => {
        set({ isLoading: true, error: null });
        try {
            await WalletsService.update(id, updatedWallet);
            set((state) => ({
                wallets: state.wallets.map((wallet) => (wallet.id === id ? { ...wallet, ...updatedWallet } : wallet)),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    deleteWallet: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await WalletsService.delete(id);
            set((state) => ({
                wallets: state.wallets.filter((wallet) => wallet.id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    reorderWallets: async (orderedIds) => {
        const { wallets } = get();
        const byId = new Map(wallets.map((wallet) => [wallet.id, wallet]));
        const reordered = orderedIds
            .map((id, index) => {
                const wallet = byId.get(id);
                return wallet ? { ...wallet, order: index } : null;
            })
            .filter(Boolean) as Wallet[];
        if (reordered.length === 0) return;
        set({ wallets: reordered });
        try {
            await Promise.all(reordered.map((wallet) => WalletsService.update(wallet.id, { order: wallet.order })));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    selectTotalBalance: () => {
        const { wallets } = get();
        return wallets.reduce((acc, wallet) => {
            if (wallet.type === "credit") {
                return acc + Number(wallet.creditLimit ?? wallet.balance ?? 0);
            }
            return acc + Number(wallet.initialBalance ?? wallet.balance ?? 0);
        }, 0);
    },
}));
