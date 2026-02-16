import type { Timestamp } from 'firebase/firestore';

export type NotificationType = 'changelog' | 'terms' | 'novidades' | 'avisos';

/** Conteúdo da notificação por idioma (pt, en, es). */
export type NotificationLocalized = Record<string, { title: string; content: string }>;

export interface Notification {
    id: string;
    /** @deprecated Use localized[lang] - mantido para compatibilidade com documentos antigos */
    title: string;
    type: NotificationType;
    /** @deprecated Use localized[lang] - mantido para compatibilidade */
    content: string;
    /** Título e conteúdo por idioma. Chaves: pt, en, es */
    localized?: NotificationLocalized;
    createdAt: Timestamp;
    publishedAt: Timestamp | null;
    readBy: string[];
}

export interface NotificationCreateInput {
    type: NotificationType;
    /** Conteúdo por idioma (pt, en, es). */
    localized: NotificationLocalized;
}

export interface NotificationUpdateInput extends Partial<NotificationCreateInput> {
    publishedAt?: Timestamp | null;
}

/** Normaliza código de idioma (ex: pt-BR -> pt). */
export function normalizeNotificationLang(lang: string): string {
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('es')) return 'es';
    return 'pt';
}

/** Retorna título e conteúdo da notificação para o idioma (para exibição no app). */
export function getNotificationLocalized(
    notification: Notification,
    lang: string
): { title: string; content: string } {
    const key = normalizeNotificationLang(lang);
    const entry = notification.localized?.[key];
    if (entry?.title || entry?.content)
        return { title: entry.title ?? '', content: entry.content ?? '' };
    return { title: notification.title, content: notification.content };
}
