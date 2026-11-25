import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/hooks/use-categories';
import QuickAmountButtons from '@/components/QuickAmountButtons';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight, Loader2, Tag } from 'lucide-react';
import type { Recurrence } from '@/types/Recurrence';
import {
  toMonthlyEstimatedValue,
  type RecurrenceAmountPeriod,
} from '@/subdomains/dashboard/utils/recurrence';
import { useWalletsStore } from '@/store/useWalletsStore';
import useUserStore from '@/store/UserStore';
import { LEGACY_POCKET_CARD_NAME, NO_WALLET_ID } from '@/constants/wallets';
import {
  useCreateRecurrence,
  useEditRecurrence,
} from '@/utils/services/api/recurrence';
import { toast } from '@/hooks/use-toast';
import { useAccountStatus } from '@/hooks/use-account-status';

type WizardStep = 0 | 1 | 2 | 3;

type RecurrenceWizardProps = {
  recurrenceId?: string;
  initialData?: Recurrence;
  onComplete: () => void;
  onCancel: () => void;
};

const STEPS: WizardStep[] = [0, 1, 2, 3];

const RecurrenceWizard = ({
  recurrenceId,
  initialData,
  onComplete,
  onCancel,
}: RecurrenceWizardProps) => {
  const { t, i18n } = useTranslation();
  const { uid } = useUserStore();
  const { isReadOnly } = useAccountStatus();
  const { expenseCategories, getCategoryIcon, getCategoryLabel } = useCategories();
  const { wallets, fetchWallets } = useWalletsStore();
  const { mutate: create, isPending: isCreating } = useCreateRecurrence();
  const { mutate: edit, isPending: isEditing } = useEditRecurrence(
    recurrenceId ?? ''
  );

  const [step, setStep] = useState<WizardStep>(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [amountPeriod, setAmountPeriod] = useState<RecurrenceAmountPeriod>('month');
  const [walletId, setWalletId] = useState(NO_WALLET_ID);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const isEditingMode = Boolean(recurrenceId);
  const isPending = isCreating || isEditing;

  const realWallets = useMemo(
    () => wallets.filter((w) => w.name !== LEGACY_POCKET_CARD_NAME),
    [wallets]
  );

  const currencySymbol = useMemo(() => {
    try {
      return (0)
        .toLocaleString(i18n.language, {
          style: 'currency',
          currency: i18n.language === 'pt-BR' ? 'BRL' : 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/\d/g, '')
        .trim();
    } catch {
      return i18n.language === 'pt-BR' ? 'R$' : '$';
    }
  }, [i18n.language]);

  useEffect(() => {
    if (uid) fetchWallets(uid);
  }, [uid, fetchWallets]);

  useEffect(() => {
    if (!initialData) return;
    setDescription(initialData.description);
    setCategory(initialData.category);
    setDisplayValue(
      initialData.estimatedValue.toFixed(2).replace('.', i18n.language === 'pt-BR' ? ',' : '.')
    );
    setAmountPeriod('month');
    setWalletId(initialData.walletId || NO_WALLET_ID);
  }, [initialData, i18n.language]);

  const parseDisplayValue = (v: string) =>
    parseFloat((v || '0').replace(',', '.')) || 0;

  const inputAmount = parseDisplayValue(displayValue);
  const monthlyEstimatedValue = toMonthlyEstimatedValue(inputAmount, amountPeriod);

  const formatCurrency = (value: number) =>
    value.toLocaleString(i18n.language, {
      style: 'currency',
      currency: i18n.language === 'pt-BR' ? 'BRL' : 'USD',
    });

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return description.trim().length > 0;
      case 1:
        return Boolean(category);
      case 2:
        return inputAmount > 0;
      case 3:
        return Boolean(walletId);
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection('forward');
    setStep((prev) => Math.min(3, prev + 1) as WizardStep);
  };

  const goBack = () => {
    setDirection('back');
    setStep((prev) => Math.max(0, prev - 1) as WizardStep);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let s = e.target.value.replace(/[^0-9,.]/g, '');
    const firstComma = s.indexOf(',');
    const firstDot = s.indexOf('.');
    if (firstComma >= 0 && firstDot >= 0) {
      const sepIdx = Math.min(firstComma, firstDot);
      const sep = s[sepIdx];
      s = s.slice(0, sepIdx + 1) + s.slice(sepIdx + 1).replace(sep === ',' ? /\./g : /,/g, '');
    }
    const sepIdx = s.includes(',') ? s.indexOf(',') : s.indexOf('.');
    if (sepIdx >= 0 && s.length > sepIdx + 3) s = s.slice(0, sepIdx + 3);
    setDisplayValue(s);
  };

  const handleQuickAmount = (amount: number) => {
    const n = parseDisplayValue(displayValue) + amount;
    setDisplayValue(n.toFixed(2).replace('.', i18n.language === 'pt-BR' ? ',' : '.'));
  };

  const handleSubmit = () => {
    if (isReadOnly) {
      toast({
        title: t('toast.error'),
        description: t('account.blocked.banner'),
        variant: 'destructive',
      });
      return;
    }

    const payload: Recurrence = {
      description: description.trim(),
      category,
      type: 'despesa',
      estimatedValue: Math.round(monthlyEstimatedValue * 100) / 100,
      walletId,
    };

    const onSuccess = () => {
      toast({
        title: t('recurrence.toast.success'),
        variant: 'success',
      });
      onComplete();
    };

    const onError = () => {
      toast({
        title: t('toast.error'),
        description: t('recurrence.toast.error'),
        variant: 'destructive',
      });
    };

    if (isEditingMode && recurrenceId) {
      edit(payload, { onSuccess, onError });
    } else {
      create(payload, { onSuccess, onError });
    }
  };

  const stepQuestions: Record<WizardStep, string> = {
    0: t('recurrence.wizard.stepDescription'),
    1: t('recurrence.wizard.stepCategory'),
    2:
      amountPeriod === 'week'
        ? t('recurrence.wizard.stepAmountWeek')
        : t('recurrence.wizard.stepAmountMonth'),
    3: t('recurrence.wizard.stepConfirm'),
  };

  const CategoryIcon = category ? (getCategoryIcon(category) ?? Tag) : Tag;

  return (
    <div className="relative flex min-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card via-card to-muted/20 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              s <= step ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      <div
        key={step}
        className={cn(
          'flex flex-1 flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300',
          direction === 'forward'
            ? 'motion-safe:slide-in-from-right-4'
            : 'motion-safe:slide-in-from-left-4'
        )}
      >
        <p className="mb-1 text-sm font-medium text-muted-foreground">
          {t('recurrence.wizard.step', { current: step + 1, total: 4 })}
        </p>
        <h2 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          {stepQuestions[step]}
        </h2>

        {step === 0 && (
          <div className="space-y-3">
            <Input
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('recurrence.wizard.descriptionPlaceholder')}
              className="h-12 text-base"
              onKeyDown={(e) => e.key === 'Enter' && canAdvance() && goNext()}
            />
          </div>
        )}

        {step === 1 && (
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder={t('transactionForm.form.category')} />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {getCategoryLabel(cat.id)}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('recurrence.wizard.amountPeriodLabel')}
              </p>
              <ToggleGroup
                type="single"
                value={amountPeriod}
                onValueChange={(value) => {
                  if (value === 'month' || value === 'week') setAmountPeriod(value);
                }}
                className="grid w-full grid-cols-2 gap-2"
              >
                <ToggleGroupItem
                  value="month"
                  className="h-11 rounded-xl border border-border/50 data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10"
                >
                  {t('recurrence.wizard.periodMonth')}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="week"
                  className="h-11 rounded-xl border border-border/50 data-[state=on]:border-primary/50 data-[state=on]:bg-primary/10"
                >
                  {t('recurrence.wizard.periodWeek')}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                inputMode="decimal"
                value={displayValue}
                onChange={handleValueChange}
                className="h-14 pl-10 text-2xl font-semibold"
                placeholder="0,00"
              />
            </div>
            <QuickAmountButtons onSelect={handleQuickAmount} />

            {amountPeriod === 'week' && inputAmount > 0 && (
              <div
                className={cn(
                  'rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center',
                  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300'
                )}
              >
                <p className="text-sm text-muted-foreground">
                  {t('recurrence.wizard.monthlyPreviewIntro')}
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {t('recurrence.wizard.monthlyPreview', {
                    amount: formatCurrency(monthlyEstimatedValue),
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                {t('recurrence.wizard.summaryIntro')}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {t('recurrence.wizard.summaryAmount', {
                  amount: formatCurrency(monthlyEstimatedValue),
                  item: description,
                })}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CategoryIcon className="h-4 w-4" />
                {getCategoryLabel(category)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('transactionForm.form.wallet')}</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_WALLET_ID}>
                    {t('wallets.pocket', 'Bolso')}
                  </SelectItem>
                  {realWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id!}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={goBack} className="flex-1">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('navigation.back')}
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('default.cancel')}
          </Button>
        )}

        {step < 3 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!canAdvance()}
            className="flex-1"
          >
            {t('recurrence.wizard.next')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canAdvance()}
            className="flex-1"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditingMode ? t('default.save') : t('recurrence.wizard.finish')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecurrenceWizard;
