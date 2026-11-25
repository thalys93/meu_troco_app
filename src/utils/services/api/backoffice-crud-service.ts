import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    type DocumentData,
    type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FireStore } from './firebase';

type WithId = { id?: string };

type CrudConfig<T extends WithId> = {
    collectionName: string;
    queryKey: readonly string[];
    orderField?: string;
    mapDoc: (doc: QueryDocumentSnapshot<DocumentData>) => T;
};

export function createBackofficeCrud<T extends WithId>(config: CrudConfig<T>) {
    const list = async (): Promise<T[]> => {
        const ref = collection(FireStore, config.collectionName);
        const snapshot = await getDocs(query(ref));
        const items = snapshot.docs.map(config.mapDoc);
        if (!config.orderField) return items;
        return [...items].sort((left, right) => {
            const leftValue = (left as Record<string, unknown>)[config.orderField!];
            const rightValue = (right as Record<string, unknown>)[config.orderField!];
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue - rightValue;
            }
            return String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
        });
    };

    const getById = async (id: string): Promise<T | null> => {
        const ref = doc(FireStore, config.collectionName, id);
        const snapshot = await getDoc(ref);
        return snapshot.exists() ? config.mapDoc(snapshot) : null;
    };

    const create = async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        const ref = collection(FireStore, config.collectionName);
        const docRef = await addDoc(ref, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    };

    const update = async (data: T): Promise<void> => {
        if (!data.id) throw new Error('MISSING_DOCUMENT_ID');
        const ref = doc(FireStore, config.collectionName, data.id);
        const { id, createdAt, updatedAt, ...rest } = data as T & {
            createdAt?: unknown;
            updatedAt?: unknown;
        };
        await updateDoc(ref, {
            ...rest,
            updatedAt: serverTimestamp(),
        });
    };

    const remove = async (id: string): Promise<void> => {
        const ref = doc(FireStore, config.collectionName, id);
        await deleteDoc(ref);
    };

    const useList = () => useQuery({
        queryKey: config.queryKey,
        queryFn: list,
        retry: false,
        staleTime: 60_000,
    });

    const useItem = (id?: string) => useQuery({
        queryKey: [...config.queryKey, id],
        queryFn: () => getById(id!),
        enabled: !!id,
        retry: false,
    });

    const useCreate = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: create,
            onSuccess: () => queryClient.invalidateQueries({ queryKey: config.queryKey }),
            retry: false,
        });
    };

    const useUpdate = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: update,
            onSuccess: () => queryClient.invalidateQueries({ queryKey: config.queryKey }),
            retry: false,
        });
    };

    const useDelete = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: remove,
            onSuccess: () => queryClient.invalidateQueries({ queryKey: config.queryKey }),
            retry: false,
        });
    };

    return {
        list,
        getById,
        create,
        update,
        remove,
        useList,
        useItem,
        useCreate,
        useUpdate,
        useDelete,
    };
}
