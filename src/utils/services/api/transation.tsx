import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { FireStore } from "./firebase";
import useUserStore from "@/store/UserStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CardsService } from "./cards-service";

export interface Transaction {
    id?: string;
    value: number;
    date: string;
    description: string;
    category: string;
    type: 'receita' | 'despesa';
    cardId: string;
}

const createTransaction = async (data: Transaction, uid: string) => {
    if (!data.cardId) throw new Error("Card ID is required");

    const card = await CardsService.getById(data.cardId);
    if (!card) throw new Error("Card not found");

    // 3. Calcular novo saldo
    const newBalance = data.type === 'receita'
        ? card.balance + data.value
        : card.balance - data.value;

    // 4. Atualizar saldo do cartão
    await CardsService.update(data.cardId, { balance: newBalance });

    // 5. Criar transação
    const ref = collection(FireStore, 'transactions', uid, 'userTransactions');
    const docRef = await addDoc(ref, {
        ...data,
        createdAt: new Date(),
    });
    return docRef.id;
}

const deleteTransaction = async (uid: string, id: string) => {
    const ref = doc(FireStore, 'transactions', uid, 'userTransactions', id);
    await deleteDoc(ref);
}

const editTransaction = async (uid: string, id: string, data: Transaction) => {
    // 1. Buscar transação antiga
    const oldTransaction = await getUserTransaction(uid, id);
    if (!oldTransaction) throw new Error("Transaction not found");

    if (oldTransaction.cardId) {
        const oldCard = await CardsService.getById(oldTransaction.cardId);
        if (oldCard) {
            const revertedBalance = oldTransaction.type === 'receita'
                ? oldCard.balance - oldTransaction.value
                : oldCard.balance + oldTransaction.value;
            await CardsService.update(oldTransaction.cardId, { balance: revertedBalance });
        }
    }

    const newCard = await CardsService.getById(data.cardId);
    if (!newCard) throw new Error("Card not found");

    const newBalance = data.type === 'receita'
        ? newCard.balance + data.value
        : newCard.balance - data.value;

    await CardsService.update(data.cardId, { balance: newBalance });

    // 4. Atualizar transação
    const ref = doc(FireStore, 'transactions', uid, 'userTransactions', id);
    await updateDoc(ref, { ...data });
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
        return {
            ...(docSnap.data() as Transaction),
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

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Transaction[];
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