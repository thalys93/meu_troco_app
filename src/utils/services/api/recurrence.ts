import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { FireStore } from './firebase';
import useUserStore from '@/store/UserStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Recurrence } from '@/types/Recurrence';
import { NO_WALLET_ID } from '@/constants/wallets';
import {
  MIN_WALLET_ALLOCATIONS,
  resolveWalletIdFromTransaction,
  validateAllocationsForSave,
} from '@/utils/transaction-allocations';

const normalizeEstimatedValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeRecurrenceAllocations = (
  raw: Recurrence & { allocations?: unknown }
): Recurrence['allocations'] => {
  if (!Array.isArray(raw.allocations)) return undefined;
  const allocations = raw.allocations
    .filter(
      (item): item is { walletId: string; amount: number } =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as { walletId?: unknown }).walletId === 'string' &&
        typeof (item as { amount?: unknown }).amount === 'number' &&
        (item as { amount: number }).amount > 0
    )
    .map((item) => ({
      walletId: item.walletId.trim(),
      amount: item.amount,
    }));

  return allocations.length >= MIN_WALLET_ALLOCATIONS ? allocations : undefined;
};

const mapFirestoreRecurrence = (
  id: string,
  raw: Recurrence & { estimatedValue?: unknown; dueDay?: unknown; allocations?: unknown }
): Recurrence => {
  const walletId = raw.walletId?.trim() || NO_WALLET_ID;
  const estimatedValue = normalizeEstimatedValue(raw.estimatedValue);
  const allocations = normalizeRecurrenceAllocations(raw);

  return {
    ...raw,
    id,
    estimatedValue,
    walletId: allocations?.[0]?.walletId ?? walletId,
    allocations,
    dueDay:
      typeof raw.dueDay === 'number' && raw.dueDay >= 1 && raw.dueDay <= 31
        ? raw.dueDay
        : undefined,
  };
};

const normalizeRecurrencePayload = (data: Recurrence): Recurrence => {
  const walletId = resolveWalletIdFromTransaction({
    walletId: data.walletId,
    value: data.estimatedValue,
  });
  const base: Recurrence = {
    ...data,
    description: data.description.trim(),
    walletId,
    estimatedValue: Math.round(data.estimatedValue * 100) / 100,
  };

  if (!data.allocations || data.allocations.length < MIN_WALLET_ALLOCATIONS) {
    const { allocations: _removed, ...withoutAllocations } = base;
    return withoutAllocations;
  }

  const validation = validateAllocationsForSave(
    data.estimatedValue,
    data.allocations
  );
  if (!validation.ok) {
    throw new Error(`Invalid allocations: ${validation.reason}`);
  }

  return {
    ...base,
    walletId: validation.walletId,
    allocations: validation.allocations,
  };
};

const toRecurrenceFirestoreWritePayload = (data: Recurrence) => {
  const payload = normalizeRecurrencePayload(data);
  const base = {
    description: payload.description,
    category: payload.category,
    type: payload.type,
    estimatedValue: payload.estimatedValue,
    walletId: payload.walletId?.trim() || NO_WALLET_ID,
    ...(payload.dueDay ? { dueDay: payload.dueDay } : {}),
  };

  if (payload.allocations && payload.allocations.length >= MIN_WALLET_ALLOCATIONS) {
    return { ...base, allocations: payload.allocations };
  }

  return base;
};

const toRecurrenceFirestoreUpdatePayload = (data: Recurrence) => {
  const payload = normalizeRecurrencePayload(data);
  const base = {
    description: payload.description,
    category: payload.category,
    type: payload.type,
    estimatedValue: payload.estimatedValue,
    walletId: payload.walletId?.trim() || NO_WALLET_ID,
    ...(payload.dueDay ? { dueDay: payload.dueDay } : { dueDay: null }),
  };

  if (payload.allocations && payload.allocations.length >= MIN_WALLET_ALLOCATIONS) {
    return { ...base, allocations: payload.allocations };
  }

  return { ...base, allocations: deleteField() };
};

const createRecurrence = async (data: Recurrence, uid: string) => {
  const ref = collection(FireStore, 'recurrences', uid, 'userRecurrences');
  const docRef = await addDoc(ref, {
    ...toRecurrenceFirestoreWritePayload(data),
    createdAt: new Date(),
  });
  return docRef.id;
};

const editRecurrence = async (uid: string, id: string, data: Recurrence) => {
  const ref = doc(FireStore, 'recurrences', uid, 'userRecurrences', id);
  await updateDoc(ref, toRecurrenceFirestoreUpdatePayload(data));
};

const deleteRecurrence = async (uid: string, id: string) => {
  const ref = doc(FireStore, 'recurrences', uid, 'userRecurrences', id);
  await deleteDoc(ref);
};

const markRecurrenceGenerated = async (
  uid: string,
  id: string,
  monthKey: string
) => {
  const ref = doc(FireStore, 'recurrences', uid, 'userRecurrences', id);
  await updateDoc(ref, { lastGeneratedMonth: monthKey });
};

export const getUserRecurrences = async (uid: string): Promise<Recurrence[]> => {
  const ref = collection(FireStore, 'recurrences', uid, 'userRecurrences');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((docSnap) => {
    const raw = docSnap.data() as Recurrence & { estimatedValue?: unknown };
    return mapFirestoreRecurrence(docSnap.id, raw);
  });
};

export const getUserRecurrence = async (
  uid: string,
  id: string
): Promise<Recurrence | null> => {
  const ref = doc(FireStore, 'recurrences', uid, 'userRecurrences', id);
  const docSnap = await getDoc(ref);
  if (!docSnap.exists()) return null;
  const raw = docSnap.data() as Recurrence & { estimatedValue?: unknown };
  return mapFirestoreRecurrence(docSnap.id, raw);
};

export const useUserRecurrences = () => {
  const { uid } = useUserStore();
  return useQuery({
    queryKey: ['recurrences', uid],
    queryFn: () => getUserRecurrences(uid),
    enabled: !!uid,
    retry: false,
  });
};

export const useUserRecurrence = (id: string) => {
  const { uid } = useUserStore();
  return useQuery({
    queryKey: ['recurrence', uid, id],
    queryFn: () => getUserRecurrence(uid, id),
    enabled: !!uid && !!id,
    retry: false,
  });
};

export const useCreateRecurrence = () => {
  const { uid } = useUserStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Recurrence) => createRecurrence(data, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences', uid] });
    },
    retry: false,
  });
};

export const useEditRecurrence = (id: string) => {
  const { uid } = useUserStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Recurrence) => editRecurrence(uid, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences', uid] });
      queryClient.invalidateQueries({ queryKey: ['recurrence', uid, id] });
    },
    retry: false,
  });
};

export const useDeleteRecurrence = () => {
  const { uid } = useUserStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurrence(uid, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences', uid] });
    },
    retry: false,
  });
};

export const useMarkRecurrenceGenerated = () => {
  const { uid } = useUserStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, monthKey }: { id: string; monthKey: string }) =>
      markRecurrenceGenerated(uid, id, monthKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurrences', uid] });
    },
    retry: false,
  });
};
