import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import type { CategoryCreateInput, CategoryTransactionType } from '@/types/Category';
import { CATEGORY_ICON_OPTIONS, resolveCategoryIcon } from '@/utils/category-icons';
import { CATEGORY_FORM_LOCALES } from './category-form-shared';

type CategoryFormFieldsProps = {
    form: UseFormReturn<CategoryCreateInput>;
    categoryId?: string;
};

function CategoryFormFields({ form, categoryId }: CategoryFormFieldsProps) {
    const { t } = useTranslation();
    const watchedIcon = form.watch('icon');
    const PreviewIcon = resolveCategoryIcon(watchedIcon);

    return (
        <div className="space-y-4">
            {categoryId && (
                <div className="space-y-2">
                    <Label>{t('categories.backoffice.fieldId')}</Label>
                    <Input value={categoryId} disabled className="bg-muted/50 font-mono text-xs" />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t('categories.backoffice.fieldType')} *</Label>
                    <Select
                        value={form.watch('type')}
                        onValueChange={(value: CategoryTransactionType) => form.setValue('type', value)}
                    >
                        <SelectTrigger className="bg-background/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="receita">{t('categories.backoffice.typeIncome')}</SelectItem>
                            <SelectItem value="despesa">{t('categories.backoffice.typeExpense')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>{t('categories.backoffice.fieldIcon')} *</Label>
                    <Select
                        value={form.watch('icon')}
                        onValueChange={(value) => form.setValue('icon', value)}
                    >
                        <SelectTrigger className="bg-background/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORY_ICON_OPTIONS.map((iconName) => {
                                const Icon = resolveCategoryIcon(iconName);
                                return (
                                    <SelectItem key={iconName} value={iconName}>
                                        <span className="flex items-center gap-2">
                                            {Icon && <Icon className="h-4 w-4" />}
                                            {iconName}
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {PreviewIcon && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <PreviewIcon className="h-3 w-3" />
                            {t('categories.backoffice.iconPreview')}
                        </p>
                    )}
                </div>
            </div>

            {categoryId && (
                <div className="space-y-2">
                    <Label>{t('categories.backoffice.fieldOrder')}</Label>
                    <Input
                        value={String(form.watch('order'))}
                        disabled
                        className="bg-muted/50 font-mono text-xs w-24"
                    />
                    <p className="text-xs text-muted-foreground">
                        {t('categories.backoffice.orderManagedInList')}
                    </p>
                </div>
            )}

            <div className="flex items-center gap-3">
                <Switch
                    checked={form.watch('active') !== false}
                    onCheckedChange={(checked) => form.setValue('active', checked)}
                />
                <Label>{t('categories.backoffice.fieldActive')}</Label>
            </div>

            <div className="space-y-3">
                <Label>{t('categories.backoffice.labelByLanguage')}</Label>
                <Tabs defaultValue="pt" className="w-full">
                    <TabsList className="bg-muted/50">
                        {CATEGORY_FORM_LOCALES.map((lang) => (
                            <TabsTrigger key={lang} value={lang}>
                                {t(`categories.backoffice.language.${lang}`)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {CATEGORY_FORM_LOCALES.map((lang) => (
                        <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>{t('categories.backoffice.fieldLabel')} *</Label>
                                <Input
                                    name={`localized.${lang}.label`}
                                    control={form.control}
                                    placeholder={t('categories.backoffice.fieldLabelPlaceholder')}
                                    className="bg-background/50"
                                />
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

export default CategoryFormFields;
