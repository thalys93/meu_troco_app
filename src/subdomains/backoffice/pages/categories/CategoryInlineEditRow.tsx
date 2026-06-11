import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    ExternalLink,
    Loader2,
    Tag,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import type { Category, CategoryTransactionType } from '@/types/Category';
import { CATEGORY_ICON_OPTIONS, resolveCategoryIcon } from '@/utils/category-icons';
import {
    CategoryInlineDraft,
    CategoryInlineFieldErrors,
    validateCategoryInlineDraft
} from './category-inline-utils';
import { useCategoryInlineSubmit } from './useCategoryInlineSubmit';
import { normalizeCategoryLang } from '@/types/Category';

type CategoryInlineEditRowProps = {
    category: Category;
    listIndex: number;
    draft: CategoryInlineDraft;
    onDraftChange: (draft: CategoryInlineDraft) => void;
    onCancel: () => void;
    onSaved: () => void;
};

function CategoryInlineEditRow({
    category,
    listIndex,
    draft,
    onDraftChange,
    onCancel,
    onSaved
}: CategoryInlineEditRowProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [fieldErrors, setFieldErrors] = React.useState<CategoryInlineFieldErrors>({
        label: false
    });
    const { submitDraft, isSaving } = useCategoryInlineSubmit({
        category,
        onSuccess: onSaved
    });

    const updateDraft = (patch: Partial<CategoryInlineDraft>) => {
        onDraftChange({ ...draft, ...patch });
    };

    const handleSave = () => {
        const errors = validateCategoryInlineDraft(draft);
        setFieldErrors(errors);
        const result = submitDraft(draft);
        if (!result.ok) {
            setFieldErrors(result.errors);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
            return;
        }
        if (e.key !== 'Enter' || e.shiftKey) return;
        const target = e.target as HTMLElement;
        if (
            target.closest('[role="combobox"]') ||
            target.closest('[data-radix-popper-content-wrapper]')
        ) {
            return;
        }
        e.preventDefault();
        handleSave();
    };

    const toggleType = () => {
        const nextType: CategoryTransactionType =
            draft.type === 'receita' ? 'despesa' : 'receita';
        updateDraft({ type: nextType });
    };

    const PreviewIcon = resolveCategoryIcon(draft.icon) ?? Tag;
    const langKey = normalizeCategoryLang(draft.lang);

    return (
        <div
            role="group"
            className={cn(
                'px-4 py-3 transition-colors bg-primary/5 ring-1 ring-primary/25 ring-inset',
                isSaving && 'pointer-events-none opacity-70'
            )}
            onKeyDown={handleKeyDown}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleType}
                        className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-offset-background',
                            draft.type === 'receita'
                                ? 'bg-emerald-500/12 text-emerald-600 hover:ring-emerald-500/40 dark:text-emerald-400'
                                : 'bg-rose-500/12 text-rose-600 hover:ring-rose-500/40 dark:text-rose-400'
                        )}
                        aria-label={t('transactionList.inline.toggleType')}
                        title={t('transactionList.inline.toggleType')}
                    >
                        {draft.type === 'receita' ? (
                            <ArrowUpRight className="h-4 w-4" />
                        ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                        )}
                    </button>

                    <Select
                        value={draft.icon}
                        onValueChange={(icon) => updateDraft({ icon })}
                    >
                        <SelectTrigger className="h-8 w-[110px] text-xs border-border/60 bg-background/80">
                            <div className="flex items-center gap-1.5">
                                <PreviewIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORY_ICON_OPTIONS.map((iconName) => {
                                const Icon = resolveCategoryIcon(iconName);
                                return (
                                    <SelectItem key={iconName} value={iconName}>
                                        <span className="flex items-center gap-2 text-xs">
                                            {/* {Icon && <Icon className="h-3.5 w-3.5" />} */}
                                            {iconName}
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    <Input
                        name="label"
                        value={draft.label}
                        onChange={(e) => {
                            updateDraft({ label: e.target.value });
                            setFieldErrors((prev) => ({ ...prev, label: false }));
                        }}
                        placeholder={t('categories.backoffice.fieldLabelPlaceholder')}
                        className={cn(
                            'h-8 min-w-[140px] flex-1 text-sm border-border/60 bg-background/80',
                            fieldErrors.label && 'border-red-500'
                        )}
                        autoFocus
                    />

                    <span
                        className="flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-border/60 bg-muted/40 px-2 text-xs font-mono tabular-nums text-muted-foreground"
                        title={t('categories.backoffice.fieldOrder')}
                    >
                        {listIndex}
                    </span>

                    <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                        <Switch
                            checked={draft.active}
                            onCheckedChange={(active) => updateDraft({ active })}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {t('categories.backoffice.fieldActive')}
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-1 shrink-0">
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                            navigate(
                                `/backoffice/category/${encodeURIComponent(category.id)}`
                            )
                        }
                        aria-label={t('categories.backoffice.openFullEdit')}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={onCancel}
                        disabled={isSaving}
                        aria-label={t('transactionList.inline.cancel')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        className={cn(
                            'h-8 w-8 text-white',
                            draft.type === 'receita'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-rose-600 hover:bg-rose-700'
                        )}
                        onClick={handleSave}
                        disabled={isSaving}
                        aria-label={t('transactionList.inline.save')}
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-mono truncate pl-10">
                {category.id}
                <span className="ml-2 font-sans">
                    · {t(`categories.backoffice.language.${langKey}`)}
                </span>
            </p>
        </div>
    );
}

export default CategoryInlineEditRow;
