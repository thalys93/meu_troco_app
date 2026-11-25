import React, { useEffect } from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import {
    useGetCategoryById,
    useGetAllCategoriesAdmin,
    useCreateCategory,
    useUpdateCategory,
    getNextCategoryOrder
} from '@/utils/services/api/categories-service';
import { toast } from '@/hooks/use-toast';
import type { CategoryCreateInput, CategoryLocalized } from '@/types/Category';
import CategoryFormFields from './CategoryFormFields';
import {
    CATEGORY_FORM_LOCALES,
    categoryFormDefaultValues,
    emptyCategoryLocalized
} from './category-form-shared';

function CategoryFormPage() {
    const { id: idParam } = useParams();
    const categoryId = idParam ? decodeURIComponent(idParam) : undefined;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data: category, refetch } = useGetCategoryById(categoryId ?? null);
    const { data: allCategories } = useGetAllCategoriesAdmin();

    const form = useForm<CategoryCreateInput>({ defaultValues: categoryFormDefaultValues });

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    useEffect(() => {
        if (categoryId && category) {
            const localized: CategoryLocalized = { ...emptyCategoryLocalized };
            const from = category.localized ?? emptyCategoryLocalized;
            for (const lang of CATEGORY_FORM_LOCALES) {
                localized[lang] = from[lang] ?? { label: '' };
            }
            form.reset({
                type: category.type,
                icon: category.icon,
                localized,
                order: category.order,
                active: category.active,
                showInBothTypes: category.showInBothTypes
            });
        }
    }, [categoryId, category, form]);

    const onSubmit = (data: CategoryCreateInput) => {
        if (categoryId) {
            updateMutation.mutate(
                {
                    id: categoryId,
                    data: {
                        type: data.type,
                        icon: data.icon,
                        localized: data.localized,
                        active: data.active,
                        showInBothTypes: data.showInBothTypes
                    }
                },
                {
                    onSuccess: () => {
                        toast({
                            title: t('toast.success'),
                            description: t('categories.backoffice.saved')
                        });
                        refetch();
                    },
                    onError: () => {
                        toast({
                            title: t('toast.error'),
                            description: t('categories.backoffice.saveError'),
                            variant: 'destructive'
                        });
                    }
                }
            );
        } else {
            createMutation.mutate(
                {
                    ...data,
                    order: getNextCategoryOrder(allCategories ?? [], data.type)
                },
                {
                    onSuccess: (newId) => {
                        toast({
                            title: t('toast.success'),
                            description: t('categories.backoffice.created')
                        });
                        navigate(`/backoffice/category/${encodeURIComponent(newId)}`);
                    },
                    onError: () => {
                        toast({
                            title: t('toast.error'),
                            description: t('categories.backoffice.createError'),
                            variant: 'destructive'
                        });
                    }
                }
            );
        }
    };

    return (
        <PrivateLayout>
            <PageShell
                title={
                    categoryId
                        ? t('categories.backoffice.editTitle')
                        : t('categories.backoffice.newTitle')
                }
                description={t('categories.backoffice.formDescription')}
                actions={
                    <Button variant="outline" size="sm" onClick={() => navigate('/backoffice/categories')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('default.back')}
                    </Button>
                }
            >
                <Form form={form} onSubmit={onSubmit} className="space-y-4 max-w-2xl">
                    <CategoryFormFields form={form} categoryId={categoryId} />
                    <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {t('default.save')}
                    </Button>
                </Form>
            </PageShell>
        </PrivateLayout>
    );
}

export default CategoryFormPage;
