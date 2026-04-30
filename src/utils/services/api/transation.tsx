import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { FireStore } from "./firebase";
import useUserStore from "@/store/UserStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { WalletsService } from "./wallets-service";
import { NO_WALLET_ID, isPocketWalletId } from "@/constants/wallets";
import { normalizeLocalDateString } from "@/subdomains/dashboard/utils/month-range";

export interface Transaction {
    id?: string;
    value: number;
    date: string;
    description: string;
    category: string;
    type: 'receita' | 'despesa';
    walletId: string;
    cardId?: string;
}

const formatDateToYmd = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
        value.getDate()
    ).padStart(2, "0")}`;

const normalizeTransactionDate = (rawDate: unknown): string => {
    if (typeof rawDate === "string") {
        return normalizeLocalDateString(rawDate) ?? rawDate;
    }

    if (rawDate instanceof Date) {
        return Number.isNaN(rawDate.getTime()) ? "" : formatDateToYmd(rawDate);
    }

    if (
        rawDate &&
        typeof rawDate === "object" &&
        "toDate" in rawDate &&
        typeof rawDate.toDate === "function"
    ) {
        const parsed = rawDate.toDate() as Date;
        return Number.isNaN(parsed.getTime()) ? "" : formatDateToYmd(parsed);
    }

    return "";
};

const resolveWalletId = (data: Partial<Transaction>): string => {
    const walletId = data.walletId?.trim();
    if (walletId) {
        return walletId;
    }
    const legacyCardId = data.cardId?.trim();
    if (legacyCardId) {
        return legacyCardId;
    }
    return NO_WALLET_ID;
};

const createTransaction = async (data: Transaction, uid: string) => {
    const walletId = resolveWalletId(data);
    const payload = { ...data, walletId };

    if (isPocketWalletId(walletId)) {
        const ref = collection(FireStore, 'transactions', uid, 'userTransactions');
        const docRef = await addDoc(ref, { ...payload, createdAt: new Date() });
        return docRef.id;
    }

    const wallet = await WalletsService.getById(walletId);
    if (!wallet) throw new Error("Wallet not found");

    const newBalance = data.type === 'receita'
        ? wallet.balance + data.value
        : wallet.balance - data.value;

    await WalletsService.update(walletId, { balance: newBalance });

    const ref = collection(FireStore, 'transactions', uid, 'userTransactions');
    const docRef = await addDoc(ref, { ...payload, createdAt: new Date() });
    return docRef.id;
}

const deleteTransaction = async (uid: string, id: string) => {
    const ref = doc(FireStore, 'transactions', uid, 'userTransactions', id);
    await deleteDoc(ref);
}

const editTransaction = async (uid: string, id: string, data: Transaction) => {
    const oldTransaction = await getUserTransaction(uid, id);
    if (!oldTransaction) throw new Error("Transaction not found");

    const oldWalletId = resolveWalletId(oldTransaction);
    const newWalletId = resolveWalletId(data);
    const payload = { ...data, walletId: newWalletId };

    if (!isPocketWalletId(oldWalletId)) {
        const oldWallet = await WalletsService.getById(oldWalletId);
        if (oldWallet) {
            const revertedBalance = oldTransaction.type === 'receita'
                ? oldWallet.balance - oldTransaction.value
                : oldWallet.balance + oldTransaction.value;
            await WalletsService.update(oldWalletId, { balance: revertedBalance });
        }
    }

    if (!isPocketWalletId(newWalletId)) {
        const newWallet = await WalletsService.getById(newWalletId);
        if (!newWallet) throw new Error("Wallet not found");
        const newBalance = data.type === 'receita'
            ? newWallet.balance + data.value
            : newWallet.balance - data.value;
        await WalletsService.update(newWalletId, { balance: newBalance });
    }

    const ref = doc(FireStore, 'transactions', uid, 'userTransactions', id);
    await updateDoc(ref, payload);
}

export const useDeleteTransaction = () => {
    return useMutation({
        mutationFn: ({ uid, id }: { uid: string; id: string }) => deleteTransaction(uid, id),
        retry: false
    });
}

export const useEditTransaction = (uid: string, id: string) => {
    return useMutation({
        mutationFn: (data: Transaction) => editTransaction(uid, id, data),
        retry: false
    });
}

export const getUserTransaction = async (uid: string, id: string): Promise<Transaction | null> => {
    const ref = doc(FireStore, 'transactions', uid, 'userTransactions', id);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
        const raw = docSnap.data() as Transaction & { date?: unknown };
        return {
            ...raw,
            walletId: resolveWalletId(raw),
            date: normalizeTransactionDate(raw.date),
            id: docSnap.id,
        };
    }
    return null;
};

export const useUserTransaction = (uid: string, id: string) => {
    return useQuery({
        queryKey: ['transaction', uid, id],
        queryFn: () => getUserTransaction(uid, id),
        enabled: !!uid && !!id,
        retry: false,
    });
};

export const getUserTransactions = async (uid: string): Promise<Transaction[]> => {
    const ref = collection(FireStore, 'transactions', uid, 'userTransactions');
    const snapshot = await getDocs(ref);

    return snapshot.docs.map((doc) => {
        const raw = doc.data() as Transaction & { date?: unknown };
        return {
            ...raw,
            walletId: resolveWalletId(raw),
            date: normalizeTransactionDate(raw.date),
            id: doc.id,
        };
    }) as Transaction[];
};
export const useUserTransactions = () => {
    const { uid } = useUserStore();

    return useQuery({
        queryKey: ["transactions", uid],
        queryFn: () => getUserTransactions(uid),
        enabled: !!uid,
        retry: false,
    });
};

export const useCreateTransaction = () => {
    const { uid } = useUserStore();

    return useMutation({
        mutationFn: (data: Transaction) => createTransaction(data, uid),
        retry: false
    });
};