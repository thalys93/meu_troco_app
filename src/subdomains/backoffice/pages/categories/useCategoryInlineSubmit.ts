import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { useUpdateCategory } from '@/utils/services/api/categories-service';
import type { Category } from '@/types/Category';
import {
    buildCategoryUpdatePayload,
    CategoryInlineDraft,
    CategoryInlineFieldErrors,
    validateCategoryInlineDraft
} from './category-inline-utils';

type UseCategoryInlineSubmitOptions = {
    category: Category;
    onSuccess?: () => void;
};

export function useCategoryInlineSubmit({ category, onSuccess }: UseCategoryInlineSubmitOptions) {
    const { t } = useTranslation();
    const { mutate, isPending: isSaving } = useUpdateCategory();

    const submitDraft = useCallback(
        (draft: CategoryInlineDraft): { ok: boolean; errors: CategoryInlineFieldErrors } => {
            const errors = validateCategoryInlineDraft(draft);
            if (errors.label) {
                toast({
                    title: t('toast.error'),
                    description: t('categories.backoffice.inline.labelRequired'),
                    variant: 'destructive'
                });
                return { ok: false, errors };
            }

            mutate(
                { id: category.id, data: buildCategoryUpdatePayload(draft, category) },
                {
                    onSuccess: () => {
                        toast({
                            title: t('toast.success'),
                            description: t('categories.backoffice.saved')
                        });
                        onSuccess?.();
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
            return { ok: true, errors };
        },
        [category, mutate, onSuccess, t]
    );

    return { submitDraft, isSaving, validateCategoryInlineDraft };
}
