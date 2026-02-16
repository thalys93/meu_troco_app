import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
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

function formatDate(notification: Notification): string {
    const date = notification.publishedAt?.toDate?.() ?? notification.createdAt?.toDate?.();
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '';
}

function NotificationsPage() {
    const { t } = useTranslation();
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
            <section className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">{t('notifications.backoffice.title')}</h1>
                        <span className="text-muted-foreground">{t('notifications.backoffice.description')}</span>
                    </div>
                    <Button onClick={() => navigate('/backoffice/notification/')}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('notifications.backoffice.new')}
                    </Button>
                </div>

                <div className={cn('space-y-3', isLoading && 'animate-pulse')}>
                    {notifications?.map((notification) => (
                        <div
                            key={notification.id}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">{notification.title}</span>
                                    <Badge variant={notification.type === 'changelog' ? 'default' : 'secondary'}>
                                        {notification.type === 'changelog'
                                            ? t('notifications.typeChangelog')
                                            : t('notifications.typeTerms')}
                                    </Badge>
                                    {!notification.publishedAt && (
                                        <Badge variant="outline">{t('notifications.backoffice.draft')}</Badge>
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
                                        variant="secondary"
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
                                                    title: notification.title
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
                    ))}

                    {!notifications?.length && !isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground py-8">
                            <EmptyIcon className="w-6 h-6" />
                            {t('notifications.backoffice.empty')}
                        </div>
                    )}
                </div>
            </section>
        </PrivateLayout>
    );
}

export default NotificationsPage;
