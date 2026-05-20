import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { FireStore } from './firebase';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type {
    Category,
    CategoryCreateInput,
    CategoryLocalized,
    CategoryUpdateInput
} from '@/types/Category';
import { DEFAULT_CATEGORIES_SEED } from '@/constants/default-categories-seed';

const COLLECTION = 'categories';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;
export const CATEGORIES_ADMIN_QUERY_KEY = ['categories', 'admin'] as const;

export async function refreshCategoriesCache(queryClient: QueryClient): Promise<void> {
    await Promise.all([
        queryClient.refetchQueries({ queryKey: CATEGORIES_QUERY_KEY, type: 'all' }),
        queryClient.refetchQueries({ queryKey: CATEGORIES_ADMIN_QUERY_KEY, type: 'all' })
    ]);
}

const SUPPORTED_LOCALES = ['pt', 'en', 'es'] as const;

function parseLocalized(data: Record<string, unknown>): Category['localized'] {
    const raw = data.localized as Record<string, { label?: string }> | undefined;
    if (raw && typeof raw === 'object') {
        const out: CategoryLocalized = {};
        for (const lang of SUPPORTED_LOCALES) {
            const entry = raw[lang];
            if (entry && typeof entry === 'object')
                out[lang] = { label: typeof entry.label === 'string' ? entry.label : '' };
        }
        if (Object.keys(out).length > 0) return out;
    }
    return undefined;
}

function isFirestoreAutoId(id: string): boolean {
    return /^[a-zA-Z0-9]{20}$/.test(id);
}

const mapDoc = (id: string, data: Record<string, unknown>): Category => {
    const legacyFromData =
        typeof data.legacyKey === 'string'
            ? data.legacyKey
            : typeof data.slug === 'string'
              ? data.slug
              : undefined;

    return {
        id,
        legacyKey: legacyFromData ?? (isFirestoreAutoId(id) ? undefined : id),
        type: (data.type as Category['type']) ?? 'despesa',
        icon: (data.icon as string) ?? 'Tag',
        localized: parseLocalized(data),
        order: typeof data.order === 'number' ? data.order : 0,
        active: data.active !== false,
        showInBothTypes: data.showInBothTypes === true,
        createdAt: (data.createdAt as Timestamp)!,
        updatedAt: data.updatedAt as Timestamp | undefined
    };
};

export const getCategories = async (): Promise<Category[]> => {
    const ref = collection(FireStore, COLLECTION);
    const snapshot = await getDocs(ref);
    return snapshot.docs
        .map((d) => mapDoc(d.id, d.data()))
        .filter((c) => c.active)
        .sort((a, b) => a.order - b.order);
};

export const getAllCategoriesAdmin = async (): Promise<Category[]> => {
    const ref = collection(FireStore, COLLECTION);
    const q = query(ref, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDoc(d.id, d.data()));
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
    const ref = doc(FireStore, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return mapDoc(snap.id, snap.data());
};

export const createCategory = async (data: CategoryCreateInput): Promise<string> => {
    const ref = collection(FireStore, COLLECTION);
    const docRef = await addDoc(ref, {
        type: data.type,
        icon: data.icon,
        localized: data.localized,
        order: data.order,
        active: data.active !== false,
        showInBothTypes: data.showInBothTypes === true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
};

export const updateCategory = async (id: string, data: CategoryUpdateInput): Promise<void> => {
    const ref = doc(FireStore, COLLECTION, id);
    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    payload.updatedAt = serverTimestamp();
    await updateDoc(ref, payload);
};

export const deleteCategory = async (id: string): Promise<void> => {
    const ref = doc(FireStore, COLLECTION, id);
    await deleteDoc(ref);
};

export type CategoryOrderUpdate = { id: string; order: number };

export const reorderCategories = async (updates: CategoryOrderUpdate[]): Promise<void> => {
    await Promise.all(
        updates.map(({ id, order }) => updateCategory(id, { order }))
    );
};

export const getNextCategoryOrder = (
    categories: Category[],
    type: Category['type']
): number => categories.filter((c) => c.type === type).length;

export const seedDefaultCategories = async (): Promise<number> => {
    const existing = await getAllCategoriesAdmin();
    const existingLegacyKeys = new Set(
        existing.map((c) => c.legacyKey).filter((k): k is string => !!k)
    );
    const existingIds = new Set(existing.map((c) => c.id));

    let count = 0;
    for (const item of DEFAULT_CATEGORIES_SEED) {
        if (existingLegacyKeys.has(item.legacyKey) || existingIds.has(item.legacyKey)) continue;

        const localized: CategoryLocalized = {
            pt: { label: item.labels.pt },
            en: { label: item.labels.en },
            es: { label: item.labels.es }
        };

        await addDoc(collection(FireStore, COLLECTION), {
            legacyKey: item.legacyKey,
            type: item.type,
            icon: item.icon,
            localized,
            order: item.order,
            active: true,
            showInBothTypes: item.showInBothTypes === true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        count += 1;
    }
    return count;
};

export const useGetCategories = () =>
    useQuery({
        queryKey: CATEGORIES_QUERY_KEY,
        queryFn: getCategories,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        retry: 1
    });

export const useGetAllCategoriesAdmin = () =>
    useQuery({
        queryKey: CATEGORIES_ADMIN_QUERY_KEY,
        queryFn: getAllCategoriesAdmin,
        staleTime: 0,
        refetchOnMount: 'always',
        retry: false
    });

export const useGetCategoryById = (id: string | null) =>
    useQuery({
        queryKey: ['category', id],
        queryFn: () => (id ? getCategoryById(id) : Promise.resolve(null)),
        enabled: !!id,
        retry: false
    });

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CategoryCreateInput) => createCategory(data),
        onSuccess: async () => {
            await refreshCategoriesCache(queryClient);
        },
        retry: false
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CategoryUpdateInput }) =>
            updateCategory(id, data),
        onSuccess: async (_data, variables) => {
            await refreshCategoriesCache(queryClient);
            queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
        },
        retry: false
    });
};

export const useReorderCategories = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: CategoryOrderUpdate[]) => reorderCategories(updates),
        onSuccess: async () => {
            await refreshCategoriesCache(queryClient);
        },
        retry: false
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: async () => {
            await refreshCategoriesCache(queryClient);
        },
        retry: false
    });
};

export const useSeedDefaultCategories = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: seedDefaultCategories,
        onSuccess: async () => {
            await refreshCategoriesCache(queryClient);
        },
        retry: false
    });
};
