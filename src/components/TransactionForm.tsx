/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Form } from './ui/form';
import { Transaction, useCreateTransaction, useEditTransaction, useUserTransaction, useUserTransactions } from '@/utils/services/api/transation';
import { Loader2, Calendar as CalendarIcon, ChevronLeft, InfoIcon, List, CreditCard, Tag } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useUserStore from '@/store/UserStore';
import { useCategories } from '@/hooks/use-categories';
import { useTranslation } from 'react-i18next';
import QuickAmountButtons from './QuickAmountButtons';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCardsStore } from '@/store/useCardsStore';
import { usePocketBalance } from '@/hooks/usePocketBalance';
import { NO_CARD_ID, POCKET_CARD_NAME, isPocketCardId } from '@/constants/cards';

interface TransactionFormProps {
  type: 'receita' | 'despesa';
  /** Quando definido (ex.: edição no sheet), usa este id em vez do parâmetro de rota. */
  transactionId?: string;
  onSuccess?: () => void;
  /** Fechar sheet / voltar sem depender de `navigate(-1)`. */
  onCancel?: () => void;
  mode?: 'page' | 'sheet';
}

const initialValues = {
  value: 0,
  date: new Date().toISOString().split('T')[0],
  description: '',
  category: '',
  type: ''
}

type FieldErrors = { value: boolean; category: boolean; card: boolean; description: boolean };

const TransactionForm = ({ type, transactionId: transactionIdProp, onSuccess, onCancel, mode = 'page' }: TransactionFormProps) => {
  const [category, setCategory] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({ value: false, category: false, card: false, description: false });
  const transactionForm = useForm({
    defaultValues: initialValues
  })

  const { id: routeId } = useParams();
  const id = transactionIdProp ?? routeId;
  const navigate = useNavigate();
  const { uid } = useUserStore();
  const { data: transaction, refetch: refetchTransaction } = useUserTransaction(uid, id ?? '')
  const { expenseCategories, incomeCategories, getCategoryIcon } = useCategories();

  const { mutate: create, isPending } = useCreateTransaction();
  const { mutate: edit, isPending: isPendingEdit } = useEditTransaction(uid, id ?? '');
  const { refetch: refetchUserTransactions } = useUserTransactions()
  const { cards, fetchCards, isLoading: cardsLoading } = useCardsStore();
  const pocketBalance = usePocketBalance();
  const { t, i18n } = useTranslation();

  const realCards = useMemo(
    () => cards.filter((c) => c.name !== POCKET_CARD_NAME),
    [cards]
  );

  const categories = type === 'receita' ? incomeCategories : expenseCategories;
  const getCategoryLabel = (category: string) => t(`categories.${category}`);
  const CategoryTriggerIcon = category ? (getCategoryIcon(category) ?? Tag) : Tag;

  const currencySymbol = useMemo(() => {
    try {
      return (0).toLocaleString(i18n.language, {
        style: 'currency',
        currency: i18n.language === 'pt-BR' ? 'BRL' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).replace(/\d/g, '').trim();
    } catch {
      return i18n.language === 'pt-BR' ? 'R$' : '$';
    }
  }, [i18n.language]);

  const currencyName = useMemo(() => {
    return i18n.language === 'pt-BR' ? 'BRL' : 'USD';
  }, [i18n.language]);

  const parseLocalDate = (raw?: string) => {
    if (!raw) return new Date();
    const [y, m, d] = raw.split('-');
    const year = Number(y);
    const month = Number(m) - 1;
    const day = Number(d);
    return new Date(year, month, day);
  };

  const dateLabel = (() => {
    const raw = transactionForm.watch('date');
    try {
      const d = parseLocalDate(raw);
      return d.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return raw;
    }
  })();

  React.useEffect(() => {
    if (id) refetchTransaction()
  }, [id])

  React.useEffect(() => {
    if (!id || !transaction) return
    transactionForm.reset(transaction)
    setCategory(transaction.category)
    const v = transaction.value;
    if (v === 0) setDisplayValue('')
    else setDisplayValue(v.toFixed(2).replace('.', i18n.language === 'pt-BR' ? ',' : '.'))
  }, [id, transaction, i18n.language])

  React.useEffect(() => {
    if (!type) return
    transactionForm.setValue('type', type)
  }, [type])

  React.useEffect(() => {
    if (uid) {
      fetchCards(uid);
    }
  }, [uid]);

  /**
   * Cartão apagado: `transaction.cardId` órfão → `no_card` (evita "Card not found" na API).
   * Depender só de `transaction?.cardId` evita re-sync a cada novo objeto da query (refetch),
   * que repunha o cartão do servidor por cima da escolha Bolso.
   */
  React.useEffect(() => {
    if (!id || !transaction) return;
    const cardId = (transaction as { cardId?: string }).cardId;
    if (!cardId || cardId === '' || isPocketCardId(cardId)) {
      setSelectedCardId(NO_CARD_ID);
      return;
    }
    if (cardsLoading) {
      setSelectedCardId(cardId);
      return;
    }
    const exists = realCards.some((c) => c.id === cardId);
    setSelectedCardId(exists ? cardId : NO_CARD_ID);
  }, [id, transaction?.cardId, realCards, cardsLoading]);

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
    setFieldErrors((prev) => ({ ...prev, value: false }));
  };

  const parseDisplayValue = (v: string) => parseFloat((v || '0').replace(',', '.')) || 0;

  const handleQuickAmount = (amount: number) => {
    const n = parseDisplayValue(displayValue) + amount;
    const formatted = n.toFixed(2).replace('.', i18n.language === 'pt-BR' ? ',' : '.');
    setDisplayValue(formatted);
    setFieldErrors((prev) => ({ ...prev, value: false }));
  };

  const getValidationErrors = (): FieldErrors => ({
    value: !displayValue.trim() || parseDisplayValue(displayValue) <= 0,
    category: !category,
    card: !selectedCardId?.trim(),
    description: !transactionForm.getValues('description')?.trim?.(),
  });

  const handleCreate = async (data: Transaction) => {
    const valueNum = parseDisplayValue(displayValue);
    const finalData = { ...data, value: valueNum, cardId: selectedCardId?.trim() || NO_CARD_ID };
    const errors = getValidationErrors();

    if (errors.value || errors.category || errors.card || errors.description) {
      setFieldErrors(errors);
      const missing = [
        errors.value && t('transactionForm.form.value'),
        errors.category && t('transactionForm.form.category'),
        errors.card && t('transactionForm.form.card'),
        errors.description && t('transactionForm.form.description'),
      ].filter(Boolean).join(', ');
      toast({
        title: t('transactionForm.toast.title'),
        description: t('transactionForm.toast.missingFields', { fields: missing }),
        variant: "destructive",
      });
      return;
    }

    create(finalData, {
      onSuccess: () => {
        toast({
          title: t('transactionForm.toast.success'),
          description: `${type === 'receita' ? t('sidebar.income') : t('sidebar.expenses')} ${t('transactionForm.toast.successDescription')}`,
        });
        transactionForm.reset(initialValues);
        setCategory('');
        setDisplayValue('');
        setFieldErrors({ value: false, category: false, card: false, description: false });
        refetchUserTransactions();
        if (uid) fetchCards(uid);
        onSuccess?.();
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: t('transactionForm.toast.errorDescription'),
          variant: 'destructive',
        });
      }
    });
  };

  const handleEdit = async (data: Transaction) => {
    const valueNum = parseDisplayValue(displayValue);
    const finalData = { ...data, value: valueNum, cardId: selectedCardId?.trim() || NO_CARD_ID };
    const errors = getValidationErrors();

    if (errors.value || errors.category || errors.card || errors.description) {
      setFieldErrors(errors);
      const missing = [
        errors.value && t('transactionForm.form.value'),
        errors.category && t('transactionForm.form.category'),
        errors.card && t('transactionForm.form.card'),
        errors.description && t('transactionForm.form.description'),
      ].filter(Boolean).join(', ');
      toast({
        title: t('transactionForm.toast.title'),
        description: t('transactionForm.toast.missingFields', { fields: missing }),
        variant: "destructive",
      });
      return;
    }

    edit(finalData, {
      onSuccess: () => {
        toast({
          title: 'Sucesso!',
          description: `${type === 'receita' ? t('sidebar.income') : t('sidebar.expenses')} ${t('transactionForm.toast.editDescription')}`,
        });
        refetchUserTransactions();
        refetchTransaction();
        // Atualizar saldos dos cartões
        if (uid) fetchCards(uid);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(-1);
        }
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: t('transactionForm.toast.errorDescription'),
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Form
      form={transactionForm}
      onSubmit={id && String(id).length > 0 ? handleEdit : handleCreate}
      className={cn(
        "space-y-0 flex flex-col gap-5 md:gap-6",
        mode === 'sheet' ? "mx-0 max-w-none" : "sm:max-w-lg mx-auto"
      )}
    >
      {/* Value Display */}
      <div className="text-center space-y-2 py-6 md:py-8">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {t('transactionForm.form.value')}
        </p>
        <div className="flex items-center justify-center gap-1 group">
          <span className={cn(
            "text-4xl font-bold",
            type === 'receita' ? "text-emerald-400" : "text-red-400"
          )}>
            {type === 'receita' ? '+' : '-'}
          </span>
          <div className="relative flex items-center">
            <span className="text-muted-foreground text-4xl font-medium mr-1 select-none">
              {currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={displayValue}
              onChange={handleValueChange}
              placeholder="0"
              className={cn(
                "text-6xl font-black tracking-tighter bg-transparent border-none outline-none w-auto max-w-[250px] text-center focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60",
                type === 'receita' ? "text-emerald-200" : "text-red-200",
                fieldErrors.value && "ring-2 ring-red-500 ring-offset-2 rounded-lg"
              )}
              autoFocus
            />
          </div>
          <span className="text-muted-foreground text-2xl font-medium self-end mb-2 ml-1">
            {currencyName}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Insira o montante</p>
      </div>

      {/* Quick Amounts */}
      <QuickAmountButtons onSelect={handleQuickAmount} />

      {/* Category Selection */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase ml-1">
          {t('transactionForm.form.category')}
        </Label>
        <Select
          value={category}
          onValueChange={(val) => {
            setCategory(val);
            transactionForm.setValue('category', val);
            setFieldErrors((prev) => ({ ...prev, category: false }));
          }}
        >
          <SelectTrigger className={cn("w-full bg-background/40 border-accent h-12 rounded-2xl px-4", fieldErrors.category && "border-red-500 ring-2 ring-red-500/20")}>
            <div className='flex flex-row gap-5 items-center'>
              <CategoryTriggerIcon className='text-muted-foreground opacity-50 w-5 h-5 shrink-0' aria-hidden />
              <SelectValue placeholder={t('transactionForm.form.selectCategory')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span>{getCategoryLabel(cat.id)}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Card Selection */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase ml-1">
          Cartão
        </Label>
        <Select
          value={selectedCardId}
          onValueChange={(val) => {
            setSelectedCardId(val);
            setFieldErrors((prev) => ({ ...prev, card: false }));
          }}
        >
          <SelectTrigger className={cn("w-full bg-background/40 border-accent h-12 rounded-2xl px-4", fieldErrors.card && "border-red-500 ring-2 ring-red-500/20")}>
            <div className='flex flex-row gap-5 items-center'>
              <CreditCard className='text-muted-foreground opacity-50 w-5 h-5' />
              <SelectValue placeholder="Selecione o cartão" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CARD_ID}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span>{t('cards.pocket', POCKET_CARD_NAME)}</span>
                <span className="text-muted-foreground text-xs">
                  ({currencySymbol} {pocketBalance.toFixed(2)})
                </span>
              </div>
            </SelectItem>
            {realCards.map((card) => (
              <SelectItem key={card.id} value={card.id!}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
                  <span>{card.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({currencySymbol} {card.balance.toFixed(2)})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-5 md:divide-x md:divide-accent/10">
          <div className="flex items-center py-3 border-b border-accent/10 md:border-b-0">
            <Input
              name="description"
              placeholder={`${t('transactionForm.form.descriptionPlaceholder')} ${type === 'receita' ? t('default.receipt') : t('default.expense')}`}
              control={transactionForm.control}
              className={cn("bg-background/40 border-accent text-foreground placeholder:text-muted-foreground h-11 rounded-lg", fieldErrors.description && "border-red-500 ring-2 ring-red-500/20")}
              leftIcon={<List className="w-4 h-4 text-muted-foreground" />}
              onFocus={() => setFieldErrors((prev) => ({ ...prev, description: false }))}
            />
          </div>
          <div className="flex items-center py-3 border-b border-accent/10 md:border-b-0 md:-ml-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative w-full h-11 rounded-lg bg-background/40 border border-accent px-3 text-base text-foreground hover:bg-background/50 flex items-center justify-start text-left pl-9">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <span className="truncate">{dateLabel}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-2 w-auto">
                <Calendar
                  mode="single"
                  selected={parseLocalDate(transactionForm.watch('date'))}
                  onSelect={(date) => {
                    if (!date) return;
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    const iso = `${y}-${m}-${d}`;
                    transactionForm.setValue('date', iso, { shouldValidate: true, shouldDirty: true });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        type="submit"
        disabled={isPending || isPendingEdit}
        className="w-full h-16 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-2 md:sticky md:bottom-24 z-10"
      >
        {(isPending || isPendingEdit) ? (
          <Loader2 className="animate-spin h-6 w-6" />
        ) : (
          <>
            {id && String(id).length > 0 ? t('default.edit') : t('default.add')} {type === 'receita' ? t('default.receipt') : t('default.expense')}
          </>
        )}
      </Button>

      {id && String(id).length > 0 && (
        <Button
          variant="ghost"
          type="button"
          onClick={() => (onCancel ? onCancel() : navigate(-1))}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>
      )}
    </Form>
  );
};

export default TransactionForm;
