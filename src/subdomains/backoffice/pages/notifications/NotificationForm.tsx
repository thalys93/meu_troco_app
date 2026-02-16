import React, { useEffect } from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import {
    useGetNotificationById,
    useCreateNotification,
    useUpdateNotification,
    usePublishNotification
} from '@/utils/services/api/notifications-service';
import { toast } from '@/hooks/use-toast';
import type { NotificationCreateInput, NotificationLocalized, NotificationType } from '@/types/Notification';

const LOCALES = ['pt', 'en', 'es'] as const;

const emptyLocalized: NotificationLocalized = {
    pt: { title: '', content: '' },
    en: { title: '', content: '' },
    es: { title: '', content: '' }
};

const defaultValues: NotificationCreateInput = {
    type: 'changelog',
    localized: { ...emptyLocalized }
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
            const localized: NotificationLocalized = { ...emptyLocalized };
            const from = notification.localized ?? { pt: { title: notification.title, content: notification.content } };
            for (const lang of LOCALES) {
                localized[lang] = from[lang] ?? { title: '', content: '' };
            }
            form.reset({
                type: notification.type,
                localized
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
            <PageShell
                title={id ? t('notifications.backoffice.editTitle') : t('notifications.backoffice.newTitle')}
                description={t('notifications.backoffice.formDescription')}
                actions={
                    <Button variant="outline" size="sm" onClick={() => navigate('/backoffice/notifications')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('default.back')}
                    </Button>
                }
            >
                <Form form={form} onSubmit={onSubmit} className="space-y-4">
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
                                <SelectItem value="novidades">{t('notifications.typeNovidades')}</SelectItem>
                                <SelectItem value="avisos">{t('notifications.typeAvisos')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>{t('notifications.backoffice.contentByLanguage')}</Label>
                        <Tabs defaultValue="pt" className="w-full">
                            <TabsList className="bg-muted/50">
                                {LOCALES.map((lang) => (
                                    <TabsTrigger key={lang} value={lang}>
                                        {t(`notifications.backoffice.language.${lang}`)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {LOCALES.map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label>{t('notifications.backoffice.fieldTitle')} *</Label>
                                        <Input
                                            name={`localized.${lang}.title`}
                                            control={form.control}
                                            placeholder={t('notifications.backoffice.fieldTitlePlaceholder')}
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('notifications.backoffice.fieldContent')} *</Label>
                                        <TextArea
                                            name={`localized.${lang}.content`}
                                            control={form.control}
                                            placeholder={t('notifications.backoffice.fieldContentPlaceholder')}
                                            className="min-h-[200px] bg-background/50"
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
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
            </PageShell>
        </PrivateLayout>
    );
}

export default NotificationFormPage;
