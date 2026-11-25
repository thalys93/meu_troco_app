import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { FireStore } from './firebase';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
    Notification,
    NotificationCreateInput,
    NotificationLocalized,
    NotificationUpdateInput
} from '@/types/Notification';

const COLLECTION = 'notifications';

const SUPPORTED_LOCALES = ['pt', 'en', 'es'] as const;

function parseLocalized(data: Record<string, unknown>): Notification['localized'] {
    const raw = data.localized as Record<string, { title?: string; content?: string }> | undefined;
    if (raw && typeof raw === 'object') {
        const out: NotificationLocalized = {};
        for (const lang of SUPPORTED_LOCALES) {
            const entry = raw[lang];
            if (entry && typeof entry === 'object')
                out[lang] = {
                    title: typeof entry.title === 'string' ? entry.title : '',
                    content: typeof entry.content === 'string' ? entry.content : ''
                };
        }
        if (Object.keys(out).length > 0) return out;
    }
    const title = (data.title as string) ?? '';
    const content = (data.content as string) ?? '';
    return { pt: { title, content } };
}

const mapDoc = (id: string, data: Record<string, unknown>): Notification => {
    const localized = parseLocalized(data);
    const pt = localized.pt ?? { title: '', content: '' };
    return {
        id,
        title: (data.title as string) ?? pt.title,
        type: ((data.type as Notification['type']) ?? 'changelog'),
        content: (data.content as string) ?? pt.content,
        localized,
        createdAt: (data.createdAt as Timestamp)!,
        publishedAt: (data.publishedAt as Timestamp | null) ?? null,
        readBy: Array.isArray(data.readBy) ? (data.readBy as string[]) : []
    };
};

/** Dashboard: list only published notifications, newest first */
export const getNotifications = async (): Promise<Notification[]> => {
    const ref = collection(FireStore, COLLECTION);
    const q = query(
        ref,
        where('publishedAt', '!=', null),
        orderBy('publishedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDoc(d.id, d.data()));
};

/** Dashboard: count notifications not read by this user */
export const getUnreadCount = async (uid: string): Promise<number> => {
    const list = await getNotifications();
    return list.filter((n) => !n.readBy.includes(uid)).length;
};

/** Dashboard: mark one notification as read for this user */
export const markAsRead = async (notificationId: string, uid: string): Promise<void> => {
    const ref = doc(FireStore, COLLECTION, notificationId);
    await updateDoc(ref, { readBy: arrayUnion(uid) });
};

/** Dashboard: mark all as read for this user */
export const markAllAsRead = async (uid: string): Promise<void> => {
    const list = await getNotifications();
    await Promise.all(
        list.filter((n) => !n.readBy.includes(uid)).map((n) => markAsRead(n.id, uid))
    );
};

// --- Backoffice ---

/** Backoffice: list all notifications (including drafts) */
export const getAllNotificationsAdmin = async (): Promise<Notification[]> => {
    const ref = collection(FireStore, COLLECTION);
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapDoc(d.id, d.data()));
};

/** Backoffice: get one by id */
export const getNotificationById = async (id: string): Promise<Notification | null> => {
    const ref = doc(FireStore, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return mapDoc(snap.id, snap.data());
};

/** Backoffice: create (draft) */
export const createNotification = async (data: NotificationCreateInput): Promise<string> => {
    const ref = collection(FireStore, COLLECTION);
    const pt = data.localized?.pt ?? { title: '', content: '' };
    const docRef = await addDoc(ref, {
        type: data.type,
        localized: data.localized,
        title: pt.title,
        content: pt.content,
        readBy: [],
        publishedAt: null,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

/** Backoffice: update */
export const updateNotification = async (id: string, data: NotificationUpdateInput): Promise<void> => {
    const ref = doc(FireStore, COLLECTION, id);
    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    if (payload.localized && typeof payload.localized === 'object') {
        const pt = (payload.localized as NotificationLocalized).pt;
        if (pt) {
            payload.title = pt.title;
            payload.content = pt.content;
        }
    }
    await updateDoc(ref, payload);
};

/** Backoffice: publish (set publishedAt to now) */
export const publishNotification = async (id: string): Promise<void> => {
    const ref = doc(FireStore, COLLECTION, id);
    await updateDoc(ref, { publishedAt: serverTimestamp() });
};

/** Backoffice: unpublish (set publishedAt to null) */
export const unpublishNotification = async (id: string): Promise<void> => {
    const ref = doc(FireStore, COLLECTION, id);
    await updateDoc(ref, { publishedAt: null });
};

/** Backoffice: delete */
export const deleteNotification = async (id: string): Promise<void> => {
    const ref = doc(FireStore, COLLECTION, id);
    await deleteDoc(ref);
};

// --- React Query hooks (dashboard) ---

export const useGetNotifications = () =>
    useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        retry: false
    });

export const useGetUnreadCount = (uid: string | null) =>
    useQuery({
        queryKey: ['notifications', 'unread', uid],
        queryFn: () => (uid ? getUnreadCount(uid) : Promise.resolve(0)),
        enabled: !!uid,
        retry: false
    });

export const useMarkAsRead = () => {
    return useMutation({
        mutationFn: ({ notificationId, uid }: { notificationId: string; uid: string }) =>
            markAsRead(notificationId, uid),
        retry: false
    });
};

export const useMarkAllAsRead = () =>
    useMutation({
        mutationFn: (uid: string) => markAllAsRead(uid),
        retry: false
    });

// --- React Query hooks (backoffice) ---

export const useGetAllNotificationsAdmin = () =>
    useQuery({
        queryKey: ['notifications', 'admin'],
        queryFn: getAllNotificationsAdmin,
        retry: false
    });

export const useGetNotificationById = (id: string | null) =>
    useQuery({
        queryKey: ['notification', id],
        queryFn: () => (id ? getNotificationById(id) : Promise.resolve(null)),
        enabled: !!id,
        retry: false
    });

export const useCreateNotification = () =>
    useMutation({
        mutationFn: (data: NotificationCreateInput) => createNotification(data),
        retry: false
    });

export const useUpdateNotification = () =>
    useMutation({
        mutationFn: ({ id, data }: { id: string; data: NotificationUpdateInput }) =>
            updateNotification(id, data),
        retry: false
    });

export const usePublishNotification = () =>
    useMutation({
        mutationFn: (id: string) => publishNotification(id),
        retry: false
    });

export const useUnpublishNotification = () =>
    useMutation({
        mutationFn: (id: string) => unpublishNotification(id),
        retry: false
    });

export const useDeleteNotification = () =>
    useMutation({
        mutationFn: (id: string) => deleteNotification(id),
        retry: false
    });
