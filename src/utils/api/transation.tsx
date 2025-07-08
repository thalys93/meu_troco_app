import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { FireStore } from "./firebase";
import useUserStore from "@/store/UserStore";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Transaction {
    id?: string;
    value: number;
    date: string;
    description: string;
    category: string;
    type: 'receita' | 'despesa';
}

const createTransaction = async (data: Transaction, uid: string) => {
    const ref = collection(FireStore, 'transactions');
    const docRef = await addDoc(ref, {
        ...data,
        createdAt: new Date(),
        userId: uid,
    });
    return docRef.id;
}

const deleteTransaction = async (id: string) => {
    const ref = doc(FireStore, 'transactions', id);
    await deleteDoc(ref);
}

const editTransaction = async (id: string, data: Transaction) => {
    const ref = doc(FireStore, 'transactions', id);
    await updateDoc(ref, {
        ...data
    });
}

export const useDeleteTransaction = () => {
    return useMutation({
        mutationFn: (id: string) => deleteTransaction(id),
    });
}

export const useEditTransaction = (id: string) => {
    return useMutation({
        mutationFn: (data: Transaction) => editTransaction(id, data),
    });
}

export const getUserTransaction = async (uid: string, id: string): Promise<Transaction | null> => {
    const ref = doc(FireStore, 'transactions', id);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId !== uid) {
            throw new Error("Você não tem permissão para acessar essa transação.");
        }
        return {
            ...(data as Transaction),
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
    });
};

export const getUserTransactions = async (uid: string): Promise<Transaction[]> => {
    const ref = collection(FireStore, "transactions");
    const q = query(ref, where("userId", "==", uid));

    const snapshot = await getDocs(q);

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
    })
}

export const useCreateTransaction = () => {
    const { uid } = useUserStore();

    return useMutation({
        mutationFn: (data: Transaction) => createTransaction(data, uid),
    });
};