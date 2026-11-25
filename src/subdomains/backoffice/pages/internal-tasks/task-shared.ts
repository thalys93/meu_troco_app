import type { Priority, WorkStatus } from '@/types/backoffice';

export type BoardColumnStatus = Exclude<WorkStatus, 'archived'>;

export const boardColumns: BoardColumnStatus[] = ['todo', 'in_progress', 'done'];

export const columnAccent: Record<BoardColumnStatus, string> = {
    todo: 'border-t-slate-400',
    in_progress: 'border-t-blue-500',
    done: 'border-t-emerald-500',
};

export const priorityAccent: Record<Priority, string> = {
    high: 'border-l-destructive bg-destructive/[0.03]',
    medium: 'border-l-amber-500 bg-amber-500/[0.03]',
    low: 'border-l-muted-foreground/30',
};

export function isOverdue(dueDate?: string) {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${dueDate}T00:00:00`) < today;
}

export function stripMarkdownPreview(text: string, maxLength = 120) {
    const plain = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/^>\s+/gm, '')
        .replace(/^[-*+]\s+/gm, '')
        .replace(/\n+/g, ' ')
        .trim();

    if (plain.length <= maxLength) return plain;
    return `${plain.slice(0, maxLength).trimEnd()}…`;
}
