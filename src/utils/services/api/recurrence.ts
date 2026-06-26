import {
  addDoc,
  collection,
  deleteDoc,
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

const normalizeEstimatedValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const mapFirestoreRecurrence = (
  id: string,
  raw: Recurrence & { estimatedValue?: unknown; dueDay?: unknown }
): Recurrence => ({
  ...raw,
  id,
  estimatedValue: normalizeEstimatedValue(raw.estimatedValue),
  walletId: raw.walletId?.trim() || NO_WALLET_ID,
  dueDay:
    typeof raw.dueDay === 'number' && raw.dueDay >= 1 && raw.dueDay <= 31
      ? raw.dueDay
      : undefined,
});

const createRecurrence = async (data: Recurrence, uid: string) => {
  const ref = collection(FireStore, 'recurrences', uid, 'userRecurrences');
  const docRef = await addDoc(ref, {
    description: data.description.trim(),
    category: data.category,
    type: data.type,
    estimatedValue: data.estimatedValue,
    walletId: data.walletId?.trim() || NO_WALLET_ID,
    ...(data.dueDay ? { dueDay: data.dueDay } : {}),
    createdAt: new Date(),
  });
  return docRef.id;
};

const editRecurrence = async (uid: string, id: string, data: Recurrence) => {
  const ref = doc(FireStore, 'recurrences', uid, 'userRecurrences', id);
  await updateDoc(ref, {
    description: data.description.trim(),
    category: data.category,
    type: data.type,
    estimatedValue: data.estimatedValue,
    walletId: data.walletId?.trim() || NO_WALLET_ID,
    ...(data.dueDay ? { dueDay: data.dueDay } : { dueDay: null }),
  });
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
