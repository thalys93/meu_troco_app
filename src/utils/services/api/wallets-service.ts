import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { FireStore } from "@/utils/services/api/firebase";
import { Wallet } from "@/types/Wallet";
import { LEGACY_POCKET_CARD_NAME, NO_WALLET_ID } from "@/constants/wallets";
import type { Transaction, WalletAllocation } from "@/utils/services/api/transation";

const COLLECTION_NAME = "wallets";
const LEGACY_COLLECTION_NAME = "cards";

type LegacyCard = Omit<Wallet, "accountName"> & { accountName?: string };

const resolveFinancialFields = (data: LegacyCard): Pick<Wallet, "initialBalance" | "creditLimit" | "billingClosingDay" | "reloadAmount" | "reloadDay"> => {
    const balance = data.balance ?? 0;
    if (data.type === "credit") {
        return {
            initialBalance: data.initialBalance,
            creditLimit: data.creditLimit ?? balance,
            billingClosingDay: data.billingClosingDay,
            reloadAmount: data.reloadAmount,
            reloadDay: data.reloadDay,
        };
    }
    return {
        initialBalance: data.initialBalance ?? balance,
        creditLimit: data.creditLimit,
        billingClosingDay: data.billingClosingDay,
        reloadAmount: data.reloadAmount,
        reloadDay: data.reloadDay,
    };
};

const toWallet = (id: string, data: LegacyCard): Wallet => ({
    id,
    userId: data.userId,
    name: data.name,
    accountName: data.accountName ?? data.name,
    balance: data.balance ?? 0,
    ...resolveFinancialFields(data),
    type: data.type,
    color: data.color,
    flag: data.flag,
    order: data.order,
    legacyCardId: data.legacyCardId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
});

const fetchWalletsFromCollection = async (collectionName: string, userId: string): Promise<Wallet[]> => {
    const q = query(collection(FireStore, collectionName), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((item) => toWallet(item.id, item.data() as LegacyCard));
};

const isLegacyPocket = (wallet: Wallet) => wallet.name === LEGACY_POCKET_CARD_NAME;

const getFinancialMigrationPayload = (wallet: Wallet): Partial<Wallet> | null => {
    if (wallet.type === "credit" && wallet.creditLimit === undefined) {
        return { creditLimit: wallet.balance ?? 0 };
    }
    if (wallet.type !== "credit" && wallet.initialBalance === undefined) {
        return { initialBalance: wallet.balance ?? 0 };
    }
    return null;
};

const migrateMissingFinancialFields = async (wallets: Wallet[]) => {
    await Promise.all(
        wallets.map(async (wallet) => {
            const payload = getFinancialMigrationPayload(wallet);
            if (!payload) return;
            await WalletsService.update(wallet.id, payload);
            Object.assign(wallet, payload);
        })
    );
};

const transactionUsesWallet = (data: Partial<Transaction>, walletId: string) => {
    if (data.walletId === walletId || data.cardId === walletId) return true;
    return data.allocations?.some((allocation) => allocation.walletId === walletId) ?? false;
};

const mergeAllocationsByWallet = (allocations: WalletAllocation[]) => {
    const byWalletId = new Map<string, number>();
    for (const allocation of allocations) {
        const walletId = allocation.walletId || NO_WALLET_ID;
        byWalletId.set(walletId, (byWalletId.get(walletId) ?? 0) + allocation.amount);
    }
    return Array.from(byWalletId.entries()).map(([walletId, amount]) => ({ walletId, amount }));
};

const buildReassignedTransactionPayload = (
    data: Partial<Transaction>,
    fromWalletId: string,
    toWalletId: string
) => {
    const payload: Record<string, unknown> = {};
    if (data.walletId === fromWalletId || data.cardId === fromWalletId) {
        payload.walletId = toWalletId;
    }

    if (data.allocations?.some((allocation) => allocation.walletId === fromWalletId)) {
        const allocations = mergeAllocationsByWallet(
            data.allocations.map((allocation) => ({
                ...allocation,
                walletId: allocation.walletId === fromWalletId ? toWalletId : allocation.walletId,
            }))
        );

        if (allocations.length >= 2) {
            payload.allocations = allocations;
            payload.walletId = allocations[0].walletId;
        } else {
            payload.allocations = deleteField();
            payload.walletId = allocations[0]?.walletId ?? toWalletId;
        }
    }

    return payload;
};

const resolveUnmigratedLegacyCards = (legacyCards: Wallet[], wallets: Wallet[]) => {
    const migratedLegacyIds = new Set(
        wallets
            .map((wallet) => wallet.legacyCardId)
            .filter((legacyCardId): legacyCardId is string => Boolean(legacyCardId))
    );
    return legacyCards.filter((legacyCard) => !isLegacyPocket(legacyCard) && !migratedLegacyIds.has(legacyCard.id));
};

export const WalletsService = {
    getAll: async (userId: string): Promise<Wallet[]> => {
        const wallets = await fetchWalletsFromCollection(COLLECTION_NAME, userId);
        await migrateMissingFinancialFields(wallets);
        const legacyCards = await fetchWalletsFromCollection(LEGACY_COLLECTION_NAME, userId);
        const unmigratedLegacyCards = resolveUnmigratedLegacyCards(legacyCards, wallets);
        return [...wallets, ...unmigratedLegacyCards];
    },

    getById: async (id: string): Promise<Wallet | null> => {
        const walletRef = doc(FireStore, COLLECTION_NAME, id);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
            return toWallet(walletSnap.id, walletSnap.data() as LegacyCard);
        }

        const legacyRef = doc(FireStore, LEGACY_COLLECTION_NAME, id);
        const legacySnap = await getDoc(legacyRef);
        if (legacySnap.exists()) {
            return toWallet(legacySnap.id, legacySnap.data() as LegacyCard);
        }

        return null;
    },

    create: async (wallet: Omit<Wallet, "id">): Promise<Wallet> => {
        const docRef = await addDoc(collection(FireStore, COLLECTION_NAME), {
            ...wallet,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return { id: docRef.id, ...wallet };
    },

    update: async (id: string, wallet: Partial<Wallet>): Promise<void> => {
        const payload = {
            ...wallet,
            updatedAt: Timestamp.now(),
        };

        const walletRef = doc(FireStore, COLLECTION_NAME, id);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
            await updateDoc(walletRef, payload);
            return;
        }

        const legacyRef = doc(FireStore, LEGACY_COLLECTION_NAME, id);
        const legacySnap = await getDoc(legacyRef);
        if (legacySnap.exists()) {
            await updateDoc(legacyRef, payload);
        }
    },

    delete: async (id: string): Promise<void> => {
        const walletRef = doc(FireStore, COLLECTION_NAME, id);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
            await deleteDoc(walletRef);
            return;
        }

        const legacyRef = doc(FireStore, LEGACY_COLLECTION_NAME, id);
        const legacySnap = await getDoc(legacyRef);
        if (legacySnap.exists()) {
            await deleteDoc(legacyRef);
        }
    },

    getTransactionsByWallet: async (userId: string, walletId: string): Promise<Transaction[]> => {
        const txRef = collection(FireStore, "transactions", userId, "userTransactions");
        const txSnapshot = await getDocs(txRef);
        return txSnapshot.docs
            .map((transactionDoc) => ({
                ...(transactionDoc.data() as Transaction),
                id: transactionDoc.id,
            }))
            .filter((transaction) => transactionUsesWallet(transaction, walletId));
    },

    reassignTransactions: async (userId: string, fromWalletId: string, toWalletId: string): Promise<number> => {
        const txRef = collection(FireStore, "transactions", userId, "userTransactions");
        const txSnapshot = await getDocs(txRef);
        const batch = writeBatch(FireStore);
        let updated = 0;

        txSnapshot.docs.forEach((transactionDoc) => {
            const data = transactionDoc.data() as Partial<Transaction>;
            if (!transactionUsesWallet(data, fromWalletId)) return;
            batch.update(transactionDoc.ref, buildReassignedTransactionPayload(data, fromWalletId, toWalletId));
            updated += 1;
        });

        if (updated > 0) {
            await batch.commit();
        }

        return updated;
    },

    deleteTransactionsByWallet: async (userId: string, walletId: string): Promise<number> => {
        const txRef = collection(FireStore, "transactions", userId, "userTransactions");
        const txSnapshot = await getDocs(txRef);
        const batch = writeBatch(FireStore);
        let deleted = 0;

        txSnapshot.docs.forEach((transactionDoc) => {
            const data = transactionDoc.data() as Partial<Transaction>;
            if (!transactionUsesWallet(data, walletId)) return;
            batch.delete(transactionDoc.ref);
            deleted += 1;
        });

        if (deleted > 0) {
            await batch.commit();
        }

        return deleted;
    },

    shouldRunLegacyMigration: async (userId: string): Promise<boolean> => {
        const wallets = await fetchWalletsFromCollection(COLLECTION_NAME, userId);
        const legacyCards = await fetchWalletsFromCollection(LEGACY_COLLECTION_NAME, userId);
        const unmigratedLegacyCards = resolveUnmigratedLegacyCards(legacyCards, wallets);
        return unmigratedLegacyCards.length > 0;
    },

    migrateLegacyCardsToWallets: async (userId: string): Promise<{ migratedWallets: number; migratedTransactions: number }> => {
        const legacyCards = await fetchWalletsFromCollection(LEGACY_COLLECTION_NAME, userId);
        const existingWallets = await fetchWalletsFromCollection(COLLECTION_NAME, userId);

        const walletByLegacyCardId = new Map<string, Wallet>();
        for (const wallet of existingWallets) {
            if (wallet.legacyCardId) {
                walletByLegacyCardId.set(wallet.legacyCardId, wallet);
            }
        }

        const cardIdToWalletId = new Map<string, string>();
        let migratedWallets = 0;

        for (const legacyCard of legacyCards) {
            if (legacyCard.name === LEGACY_POCKET_CARD_NAME) {
                continue;
            }
            const existing = walletByLegacyCardId.get(legacyCard.id);
            if (existing) {
                cardIdToWalletId.set(legacyCard.id, existing.id);
                continue;
            }

            const created = await WalletsService.create({
                userId: legacyCard.userId,
                name: legacyCard.name,
                accountName: legacyCard.accountName ?? legacyCard.name,
                balance: legacyCard.balance,
                ...resolveFinancialFields(legacyCard),
                type: legacyCard.type,
                color: legacyCard.color,
                flag: legacyCard.flag,
                order: legacyCard.order,
                legacyCardId: legacyCard.id,
                createdAt: legacyCard.createdAt,
                updatedAt: legacyCard.updatedAt,
            });

            cardIdToWalletId.set(legacyCard.id, created.id);
            migratedWallets += 1;
        }

        const txRef = collection(FireStore, "transactions", userId, "userTransactions");
        const txSnapshot = await getDocs(txRef);
        const batch = writeBatch(FireStore);
        let migratedTransactions = 0;

        txSnapshot.docs.forEach((transactionDoc) => {
            const data = transactionDoc.data() as { cardId?: string; walletId?: string };
            const legacyCardId = data.cardId?.trim();
            const resolvedWalletId = data.walletId?.trim()
                || (legacyCardId ? cardIdToWalletId.get(legacyCardId) : undefined)
                || (legacyCardId === "no_card" ? NO_WALLET_ID : undefined);

            if (!resolvedWalletId) {
                return;
            }

            if (data.walletId === resolvedWalletId) {
                return;
            }

            batch.update(transactionDoc.ref, { walletId: resolvedWalletId });
            migratedTransactions += 1;
        });

        if (migratedTransactions > 0) {
            await batch.commit();
        }

        return { migratedWallets, migratedTransactions };
    },
};
