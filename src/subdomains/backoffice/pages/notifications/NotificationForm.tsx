import React, { useEffect } from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import {
    useGetNotificationById,
    useCreateNotification,
    useUpdateNotification,
    usePublishNotification
} from '@/utils/services/api/notifications-service';
import { toast } from '@/hooks/use-toast';
import type { NotificationCreateInput, NotificationType } from '@/types/Notification';

const defaultValues: NotificationCreateInput = {
    title: '',
    type: 'changelog',
    content: ''
};

function NotificationFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data: notification, refetch } = useGetNotificationById(id ?? null);

    const form = useForm<NotificationCreateInput>({
        defaultValues
    });

    const createMutation = useCreateNotification();
    const updateMutation = useUpdateNotification();
    const publishMutation = usePublishNotification();

    useEffect(() => {
        if (id && notification) {
            form.reset({
                title: notification.title,
                type: notification.type,
                content: notification.content
            });
        }
    }, [id, notification, form]);

    const onSubmit = (data: NotificationCreateInput) => {
        if (id) {
            updateMutation.mutate(
                { id, data },
                {
                    onSuccess: () => {
                        toast({ title: t('toast.success'), description: t('notifications.backoffice.saved') });
                        refetch();
                    },
                    onError: () => {
                        toast({
                            title: t('toast.error'),
                            description: t('notifications.backoffice.saveError'),
                            variant: 'destructive'
                        });
                    }
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: (newId) => {
                    toast({ title: t('toast.success'), description: t('notifications.backoffice.created') });
                    navigate(`/backoffice/notification/${newId}`);
                },
                onError: () => {
                    toast({
                        title: t('toast.error'),
                        description: t('notifications.backoffice.createError'),
                        variant: 'destructive'
                    });
                }
            });
        }
    };

    const handlePublish = () => {
        if (!id) return;
        publishMutation.mutate(id, {
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

    const isDraft = id && notification && !notification.publishedAt;

    return (
        <PrivateLayout>
            <section className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/backoffice/notifications')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {id ? t('notifications.backoffice.editTitle') : t('notifications.backoffice.newTitle')}
                        </h1>
                        <span className="text-muted-foreground">{t('notifications.backoffice.formDescription')}</span>
                    </div>
                </div>

                <Form form={form} onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('notifications.backoffice.fieldTitle')} *</Label>
                        <Input
                            name="title"
                            control={form.control}
                            placeholder={t('notifications.backoffice.fieldTitlePlaceholder')}
                            className="bg-background/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('notifications.backoffice.fieldType')} *</Label>
                        <Select
                            value={form.watch('type')}
                            onValueChange={(value: NotificationType) => form.setValue('type', value)}
                        >
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder={t('notifications.backoffice.fieldTypePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="changelog">{t('notifications.typeChangelog')}</SelectItem>
                                <SelectItem value="terms">{t('notifications.typeTerms')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('notifications.backoffice.fieldContent')} *</Label>
                        <TextArea
                            name="content"
                            control={form.control}
                            placeholder={t('notifications.backoffice.fieldContentPlaceholder')}
                            className="min-h-[200px] bg-background/50"
                            required
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                            <Save className="w-4 h-4 mr-2" />
                            {t('default.save')}
                        </Button>
                        {isDraft && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handlePublish}
                                disabled={publishMutation.isPending}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {t('notifications.backoffice.publish')}
                            </Button>
                        )}
                    </div>
                </Form>
            </section>
        </PrivateLayout>
    );
}

export default NotificationFormPage;
