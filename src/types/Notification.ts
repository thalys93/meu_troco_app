import type { Timestamp } from 'firebase/firestore';

export type NotificationType = 'changelog' | 'terms';

export interface Notification {
    id: string;
    title: string;
    type: NotificationType;
    content: string;
    createdAt: Timestamp;
    publishedAt: Timestamp | null;
    readBy: string[];
}

export interface NotificationCreateInput {
    title: string;
    type: NotificationType;
    content: string;
}

export interface NotificationUpdateInput extends Partial<NotificationCreateInput> {
    publishedAt?: Timestamp | null;
}
