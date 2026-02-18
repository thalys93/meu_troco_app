import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { FireStore } from "./firebase";
import useUserStore from "@/store/UserStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CardsService } from "./cards-service";
import { NO_CARD_ID, isPocketCardId } from "@/constants/cards";

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
    const cardId = data.cardId?.trim() || NO_CARD_ID;
    const payload = { ...data, cardId };

    if (isPocketCardId(cardId)) {
        const ref = collection(FireStore, 'transactions', uid, 'userTransactions');
        const docRef = await addDoc(ref, { ...payload, createdAt: new Date() });
        return docRef.id;
    }

    const card = await CardsService.getById(cardId);
    if (!card) throw new Error("Card not found");

    const newBalance = data.type === 'receita'
        ? card.balance + data.value
        : card.balance - data.value;

    await CardsService.update(cardId, { balance: newBalance });

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

    const newCardId = data.cardId?.trim() || NO_CARD_ID;
    const payload = { ...data, cardId: newCardId };

    if (!isPocketCardId(oldTransaction.cardId)) {
        const oldCard = await CardsService.getById(oldTransaction.cardId);
        if (oldCard) {
            const revertedBalance = oldTransaction.type === 'receita'
                ? oldCard.balance - oldTransaction.value
                : oldCard.balance + oldTransaction.value;
            await CardsService.update(oldTransaction.cardId, { balance: revertedBalance });
        }
    }

    if (!isPocketCardId(newCardId)) {
        const newCard = await CardsService.getById(newCardId);
        if (!newCard) throw new Error("Card not found");
        const newBalance = data.type === 'receita'
            ? newCard.balance + data.value
            : newCard.balance - data.value;
        await CardsService.update(newCardId, { balance: newBalance });
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