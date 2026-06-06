import { addDoc, collection, deleteDoc, deleteField, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { FireStore } from "./firebase";
import useUserStore from "@/store/UserStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NO_WALLET_ID } from "@/constants/wallets";
import { normalizeLocalDateString } from "@/subdomains/dashboard/utils/month-range";
import {
    MIN_WALLET_ALLOCATIONS,
    resolveWalletIdFromTransaction,
    stripAllocationsFromPayload,
    validateAllocationsForSave,
    type WalletAllocation,
} from "@/utils/transaction-allocations";

export type { WalletAllocation };

export interface Transaction {
    id?: string;
    value: number;
    date: string;
    description: string;
    category: string;
    type: 'receita' | 'despesa';
    walletId: string;
    cardId?: string;
    allocations?: WalletAllocation[];
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

const resolveWalletId = resolveWalletIdFromTransaction;

const toFirestoreUpdatePayload = (payload: Transaction) => {
    const stripped = stripAllocationsFromPayload(payload);
    const keepsAllocations =
        payload.allocations && payload.allocations.length >= MIN_WALLET_ALLOCATIONS;

    if (keepsAllocations) {
        return stripped;
    }

    return { ...stripped, allocations: deleteField() };
};

const normalizeTransactionPayload = (data: Transaction): Transaction => {
    const walletId = resolveWalletId(data);
    const base = { ...data, walletId };

    if (!data.allocations || data.allocations.length < 2) {
        const { allocations: _removed, ...withoutAllocations } = base;
        return { ...withoutAllocations, walletId };
    }

    const validation = validateAllocationsForSave(data.value, data.allocations);
    if (!validation.ok) {
        throw new Error(`Invalid allocations: ${validation.reason}`);
    }

    return {
        ...base,
        walletId: validation.walletId,
        allocations: validation.allocations,
    };
};

const createTransaction = async (data: Transaction, uid: string) => {
    const payload = normalizeTransactionPayload(data);

    const ref = collection(FireStore, 'transactions', uid, 'userTransactions');
    const docRef = await addDoc(ref, {
        ...stripAllocationsFromPayload(payload),
        createdAt: new Date(),
    });
    return docRef.id;
}

const deleteTransaction = async (uid: string, id: string) => {
    const ref = doc(FireStore, 'transactions', uid, 'userTransactions', id);
    await deleteDoc(ref);
}

const editTransaction = async (uid: string, id: string, data: Transaction) => {
    const oldTransaction = await getUserTransaction(uid, id);
    if (!oldTransaction) throw new Error("Transaction not found");

    const payload = normalizeTransactionPayload(data);

    const ref = doc(FireStore, 'transactions', uid, 'userTransactions', id);
    await updateDoc(ref, toFirestoreUpdatePayload(payload));
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