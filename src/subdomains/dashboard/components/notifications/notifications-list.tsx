import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Bell, FileText, Sparkles, Megaphone, Newspaper, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import useUserStore from '@/store/UserStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/Notification';
import { getNotificationLocalized } from '@/types/Notification';

function formatNotificationDate(notification: Notification): string {
    const date = notification.publishedAt?.toDate?.() ?? notification.createdAt?.toDate?.();
    return date ? dayjs(date).format('DD/MM/YYYY') : '';
}

const TYPE_LABELS: Record<Notification['type'], string> = {
    changelog: 'notifications.typeChangelog',
    terms: 'notifications.typeTerms',
    novidades: 'notifications.typeNovidades',
    avisos: 'notifications.typeAvisos'
};

const TYPE_ICONS = {
    changelog: Sparkles,
    terms: FileText,
    novidades: Newspaper,
    avisos: Megaphone
} as const;

function NotificationItem({
    notification,
    isRead,
    onOpen,
    lang
}: {
    notification: Notification;
    isRead: boolean;
    onOpen: () => void;
    lang: string;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { title, content } = getNotificationLocalized(notification, lang);
    const typeLabel = t(TYPE_LABELS[notification.type]);
    const TypeIcon = TYPE_ICONS[notification.type];

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (next) onOpen();
    };

    return (
        <Collapsible open={open} onOpenChange={handleOpenChange}>
            <div
                className={cn(
                    'rounded-lg border border-border/50 transition-colors',
                    !isRead && 'bg-primary/5 border-primary/20'
                )}
            >
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="flex w-full items-start gap-2 p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                    >
                        <span className={cn('mt-0.5 shrink-0', !isRead && 'text-primary')}>
                            <TypeIcon className="h-4 w-4" />
                        </span>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" aria-hidden />}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{title}</p>
                            <p className="text-xs text-muted-foreground">{typeLabel} · {formatNotificationDate(notification)}</p>
                        </div>
                        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 pt-2 mt-2 text-sm text-muted-foreground border-t border-border/50 max-h-[200px] min-h-0 overflow-y-auto">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

function NotificationList() {
    const { t, i18n } = useTranslation();
    const uid = useUserStore((s) => s.uid);
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead
    } = useNotifications();

    if (isLoading) {
        return (
            <div className="p-4 space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-12 bg-muted rounded animate-pulse" />
                <div className="h-12 bg-muted rounded animate-pulse" />
                <div className="h-12 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-w-[320px] max-w-[90vw] max-h-[400px]">
            <div className="flex items-center justify-between gap-2 p-3 border-b border-border/50 shrink-0">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {t('notifications.title')}
                </h3>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => markAllAsRead()}
                    >
                        {t('notifications.markAllAsRead')}
                    </Button>
                )}
            </div>
            <ScrollArea className="flex-1 p-2" style={{ maxHeight: 340 }}>
                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        {t('notifications.empty')}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                isRead={!!uid && notification.readBy.includes(uid)}
                                onOpen={() => markAsRead(notification.id)}
                                lang={i18n.language}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

export default NotificationList;
