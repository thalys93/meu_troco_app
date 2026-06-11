import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash, Send, Undo2 } from 'lucide-react';
import {
    useGetAllNotificationsAdmin,
    useDeleteNotification,
    usePublishNotification,
    useUnpublishNotification
} from '@/utils/services/api/notifications-service';
import { EmptyIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import type { Notification } from '@/types/Notification';
import { getNotificationLocalized } from '@/types/Notification';

const TYPE_LABEL_KEYS: Record<Notification['type'], string> = {
    changelog: 'notifications.typeChangelog',
    terms: 'notifications.typeTerms',
    novidades: 'notifications.typeNovidades',
    avisos: 'notifications.typeAvisos'
};

function formatDate(notification: Notification): string {
    const date = notification.publishedAt?.toDate?.() ?? notification.createdAt?.toDate?.();
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '';
}

function NotificationsPage() {
    const { t, i18n } = useTranslation();
    const { data: notifications, isLoading, refetch } = useGetAllNotificationsAdmin();
    const navigate = useNavigate();
    const deleteNotification = useDeleteNotification();
    const publishNotification = usePublishNotification();
    const unpublishNotification = useUnpublishNotification();

    const handleDelete = (id: string) => {
        if (!id) return;
        deleteNotification.mutate(id, {
            onSuccess: () => {
                toast({
                    title: t('notifications.backoffice.deleted'),
                    description: t('notifications.backoffice.deletedDescription'),
                    variant: 'destructive'
                });
                refetch();
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('notifications.backoffice.deleteError'),
                    variant: 'destructive'
                });
            }
        });
    };

    const handlePublish = (id: string) => {
        publishNotification.mutate(id, {
            onSuccess: () => {
                toast({ title: t('toast.success'), description: t('notifications.backoffice.published') });
                refetch();
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('notifications.backoffice.publishError'),
                    variant: 'destructive'
                });
            }
        });
    };

    const handleUnpublish = (id: string) => {
        unpublishNotification.mutate(id, {
            onSuccess: () => {
                toast({ title: t('toast.success'), description: t('notifications.backoffice.unpublished') });
                refetch();
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('notifications.backoffice.unpublishError'),
                    variant: 'destructive'
                });
            }
        });
    };

    return (
        <PrivateLayout>
            <PageShell
                title={t('notifications.backoffice.title')}
                description={t('notifications.backoffice.description')}
                eyebrow={t('sidebar.backoffice')}
                actions={
                    <Button onClick={() => navigate('/backoffice/notification/')}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('notifications.backoffice.new')}
                    </Button>
                }
            >
                <div className={cn('space-y-3', isLoading && 'animate-pulse')}>
                    {isLoading && [1, 2, 3].map((item) => (
                        <div key={item} className="bo-surface h-24" />
                    ))}

                    {notifications?.map((notification) => {
                        const displayTitle = getNotificationLocalized(notification, i18n.language).title || notification.title;
                        return (
                        <div
                            key={notification.id}
                            className="bo-surface flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{displayTitle}</span>
                                    <Badge
                                        variant={notification.type === 'changelog' ? 'default' : 'secondary'}
                                        className="rounded-md font-normal"
                                    >
                                        {t(TYPE_LABEL_KEYS[notification.type])}
                                    </Badge>
                                    {!notification.publishedAt ? (
                                        <Badge variant="outline" className="rounded-md font-normal bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                                            {t('notifications.backoffice.draft')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="rounded-md font-normal bg-primary/10 text-primary border-primary/30">
                                            {t('notifications.backoffice.publishedLabel')}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{formatDate(notification)}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/backoffice/notification/${notification.id}`)}
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    {t('default.edit')}
                                </Button>
                                {notification.publishedAt ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnpublish(notification.id)}
                                    >
                                        <Undo2 className="w-4 h-4 mr-1" />
                                        {t('notifications.backoffice.unpublish')}
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handlePublish(notification.id)}
                                    >
                                        <Send className="w-4 h-4 mr-1" />
                                        {t('notifications.backoffice.publish')}
                                    </Button>
                                )}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash className="w-4 h-4 mr-1" />
                                            {t('transactionList.delete')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('notifications.backoffice.deleteConfirmTitle')}</DialogTitle>
                                            <DialogDescription>
                                                {t('notifications.backoffice.deleteConfirmDescription', {
                                                    title: displayTitle
                                                })}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{t('default.cancel')}</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleDelete(notification.id)}
                                                >
                                                    {t('transactionList.delete')}
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    );})}

                    {!notifications?.length && !isLoading && (
                        <div className="bo-surface flex flex-col items-center justify-center gap-3 text-muted-foreground py-8">
                            <EmptyIcon className="w-6 h-6" />
                            <span>{t('notifications.backoffice.empty')}</span>
                            <Button type="button" onClick={() => navigate('/backoffice/notification/')}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t('notifications.backoffice.new')}
                            </Button>
                        </div>
                    )}
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default NotificationsPage;
