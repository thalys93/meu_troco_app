import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    Timestamp
} from "firebase/firestore";
import { FireStore } from "@/utils/api/firebase";
import { Card } from "../types/Card";

const COLLECTION_NAME = "cards";

export const CardsService = {
    getAll: async (userId: string): Promise<Card[]> => {
        const q = query(
            collection(FireStore, COLLECTION_NAME),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Card));
    },

    getById: async (id: string): Promise<Card | null> => {
        const docRef = doc(FireStore, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Card;
        }
        return null;
    },

    create: async (card: Omit<Card, "id">): Promise<Card> => {
        const docRef = await addDoc(collection(FireStore, COLLECTION_NAME), {
            ...card,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return { id: docRef.id, ...card };
    },

    update: async (id: string, card: Partial<Card>): Promise<void> => {
        const docRef = doc(FireStore, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...card,
            updatedAt: Timestamp.now()
        });
    },

    delete: async (id: string): Promise<void> => {
        const docRef = doc(FireStore, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    }
};
