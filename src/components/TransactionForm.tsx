/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Form } from './ui/form';
import { Transaction, type TransactionType, useCreateTransaction, useEditTransaction, useUserTransaction, useUserTransactions } from '@/utils/services/api/transation';
import { Loader2, Calendar as CalendarIcon, List, CreditCard, Tag } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useUserStore from '@/store/UserStore';
import { useCategories } from '@/hooks/use-categories';
import { useTranslation } from 'react-i18next';
import QuickAmountButtons from './QuickAmountButtons';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useWalletsStore } from '@/store/useWalletsStore';
import { usePocketBalance } from '@/hooks/usePocketBalance';
import { LEGACY_POCKET_CARD_NAME, NO_WALLET_ID, isPocketWalletId } from '@/constants/wallets';
import TransactionAllocationsEditor, {
  allocationRowsFromTransaction,
  createAllocationDraftRows,
  type AllocationDraftRow,
} from '@/components/TransactionAllocationsEditor';
import {
  describeAllocationValidationFailure,
  hasMultipleAllocations,
  parseAllocationDraftInputs,
  resolveAllocations,
  validateAllocationsForSave,
} from '@/utils/transaction-allocations';
import { computeWalletDisplayBalance } from '@/utils/wallet-balance';
import { getCurrentMonthKey } from '@/subdomains/dashboard/utils/month-range';
import { useAccountStatus } from '@/hooks/use-account-status';
import { useMarkRecurrenceGenerated } from '@/utils/services/api/recurrence';

interface TransactionFormProps {
  type: TransactionType;
  /** Quando definido (ex.: edição no sheet), usa este id em vez do parâmetro de rota. */
  transactionId?: string;
  onSuccess?: () => void;
  /** Fechar sheet / voltar sem depender de `navigate(-1)`. */
  onCancel?: () => void;
  mode?: 'page' | 'sheet';
  prefill?: Partial<Transaction>;
  recurrenceId?: string;
  recurrenceMonthKey?: string;
}

const initialValues = {
  value: 0,
  date: new Date().toISOString().split('T')[0],
  description: '',
  category: '',
  type: ''
}

type FieldErrors = {
  value: boolean;
  category: boolean;
  wallet: boolean;
  description: boolean;
  allocations: boolean;
};

const TransactionForm = ({ type, transactionId: transactionIdProp, onSuccess, onCancel, mode = 'page', prefill, recurrenceId, recurrenceMonthKey }: TransactionFormProps) => {
  const [category, setCategory] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    value: false,
    category: false,
    wallet: false,
    description: false,
    allocations: false,
  });
  const [splitAcrossWallets, setSplitAcrossWallets] = useState(false);
  const [allocationRows, setAllocationRows] = useState<AllocationDraftRow[]>(
    createAllocationDraftRows
  );
  const transactionForm = useForm({
    defaultValues: initialValues
  })

  const { id: routeId } = useParams();
  const id = transactionIdProp ?? routeId;
  const navigate = useNavigate();
  const { uid } = useUserStore();
  const { data: transaction, refetch: refetchTransaction } = useUserTransaction(uid, id ?? '')
  const { expenseCategories, incomeCategories, billCategories, getCategoryIcon, getCategoryLabel } = useCategories();

  const { mutate: create, isPending } = useCreateTransaction();
  const { mutate: edit, isPending: isPendingEdit } = useEditTransaction(uid, id ?? '');
  const { data: allTransactions = [], refetch: refetchUserTransactions } = useUserTransactions()
  const { wallets, fetchWallets, isLoading: walletsLoading } = useWalletsStore();
  const pocketBalance = usePocketBalance();
  const { t, i18n } = useTranslation();
  const { isReadOnly } = useAccountStatus();
  const { mutate: markRecurrenceGenerated } = useMarkRecurrenceGenerated();

  const realWallets = useMemo(
    () => wallets.filter((wallet) => wallet.name !== LEGACY_POCKET_CARD_NAME),
    [wallets]
  );

  const categories =
    type === 'receita' ? incomeCategories : type === 'conta' ? billCategories : expenseCategories;

  const typeLabel =
    type === 'receita'
      ? t('sidebar.income')
      : type === 'conta'
        ? t('sidebar.bills')
        : t('sidebar.expenses');

  const typeItemLabel =
    type === 'receita'
      ? t('default.receipt')
      : type === 'conta'
        ? t('default.bill')
        : t('default.expense');
  const CategoryTriggerIcon = category ? (getCategoryIcon(category) ?? Tag) : Tag;
  const currentMonthKey = getCurrentMonthKey();

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
    if (id || !prefill) return;
    transactionForm.reset({
      ...initialValues,
      description: prefill.description ?? '',
      date: prefill.date ?? initialValues.date,
    });
    if (prefill.category) setCategory(prefill.category);
    if (prefill.walletId) setSelectedWalletId(prefill.walletId);
    if (prefill.value !== undefined) {
      const v = prefill.value;
      if (v === 0) setDisplayValue('');
      else setDisplayValue(v.toFixed(2).replace('.', i18n.language === 'pt-BR' ? ',' : '.'));
    }
  }, [id, prefill, i18n.language]);

  React.useEffect(() => {
    if (!id || !transaction) return
    transactionForm.reset(transaction)
    setCategory(transaction.category)
    const v = transaction.value;
    if (v === 0) setDisplayValue('')
    else setDisplayValue(v.toFixed(2).replace('.', i18n.language === 'pt-BR' ? ',' : '.'))

    if (hasMultipleAllocations(transaction)) {
      setSplitAcrossWallets(true);
      setAllocationRows(
        allocationRowsFromTransaction(resolveAllocations(transaction), i18n.language)
      );
    } else {
      setSplitAcrossWallets(false);
      setAllocationRows(createAllocationDraftRows());
    }
  }, [id, transaction, i18n.language])

  React.useEffect(() => {
    if (!type) return
    transactionForm.setValue('type', type)
  }, [type])

  React.useEffect(() => {
    if (uid) {
      fetchWallets(uid);
    }
  }, [uid]);

  /**
   * Carteira apagada: vínculo órfão vai para o bolso.
   * Depender só do id persistido evita sobrescrever a escolha atual no refetch.
   */
  React.useEffect(() => {
    if (!id || !transaction) return;
    const walletId = (transaction as { walletId?: string; cardId?: string }).walletId || (transaction as { cardId?: string }).cardId;
    if (!walletId || walletId === '' || isPocketWalletId(walletId)) {
      setSelectedWalletId(NO_WALLET_ID);
      return;
    }
    if (walletsLoading) {
      setSelectedWalletId(walletId);
      return;
    }
    const exists = realWallets.some((wallet) => wallet.id === walletId);
    setSelectedWalletId(exists ? walletId : NO_WALLET_ID);
  }, [id, transaction?.walletId, transaction?.cardId, realWallets, walletsLoading]);

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

  const parseAllocationRows = () =>
    parseAllocationDraftInputs(allocationRows, parseDisplayValue);

  const getValidationErrors = (): FieldErrors => {
    const valueNum = parseDisplayValue(displayValue);
    const baseErrors: FieldErrors = {
      value: !displayValue.trim() || valueNum <= 0,
      category: !category,
      wallet: false,
      description: !transactionForm.getValues('description')?.trim?.(),
      allocations: false,
    };

    if (splitAcrossWallets) {
      const validation = validateAllocationsForSave(valueNum, parseAllocationRows());
      baseErrors.allocations = !validation.ok;
      return baseErrors;
    }

    return {
      ...baseErrors,
      wallet: !selectedWalletId?.trim(),
    };
  };

  const buildFinalTransactionData = (data: Transaction): Transaction => {
    const valueNum = parseDisplayValue(displayValue);
    const base: Transaction = {
      ...data,
      value: valueNum,
      type,
      category,
      walletId: selectedWalletId?.trim() || NO_WALLET_ID,
      ...(type === 'conta' && !id ? { paid: false } : {}),
      ...(recurrenceId ? { recurrenceId } : {}),
    };

    if (!splitAcrossWallets) {
      const { allocations: _removed, ...withoutAllocations } = base;
      return withoutAllocations;
    }

    const validation = validateAllocationsForSave(valueNum, parseAllocationRows());
    if (!validation.ok) return base;

    return {
      ...base,
      walletId: validation.walletId,
      allocations: validation.allocations,
    };
  };

  const handleCreate = async (data: Transaction) => {
    if (isReadOnly) {
      toast({
        title: t('toast.error'),
        description: t('account.blocked.banner', 'Sua conta está bloqueada para alterações. Você pode consultar seus dados, mas não pode criar ou editar informações.'),
        variant: 'destructive',
      });
      return;
    }

    const finalData = buildFinalTransactionData(data);
    const errors = getValidationErrors();

    if (
      errors.value ||
      errors.category ||
      errors.wallet ||
      errors.description ||
      errors.allocations
    ) {
      setFieldErrors(errors);
      let description = [
        errors.value && t('transactionForm.form.value'),
        errors.category && t('transactionForm.form.category'),
        errors.wallet && t('transactionForm.form.wallet'),
        errors.description && t('transactionForm.form.description'),
        errors.allocations && 'Rateio entre carteiras',
      ]
        .filter(Boolean)
        .join(', ');
      if (errors.allocations && splitAcrossWallets) {
        const allocationCheck = validateAllocationsForSave(
          parseDisplayValue(displayValue),
          parseAllocationRows()
        );
        if (!allocationCheck.ok) {
          description = describeAllocationValidationFailure(allocationCheck.reason);
        }
      }
      toast({
        title: t('transactionForm.toast.title'),
        description: errors.allocations && splitAcrossWallets
          ? description
          : t('transactionForm.toast.missingFields', { fields: description }),
        variant: "destructive",
      });
      return;
    }

    create(finalData, {
      onSuccess: () => {
        toast({
          title: t('transactionForm.toast.success'),
          description: `${typeLabel} ${t('transactionForm.toast.successDescription')}`,
          variant: "success",
        });
        transactionForm.reset(initialValues);
        setCategory('');
        setDisplayValue('');
        setFieldErrors({
          value: false,
          category: false,
          wallet: false,
          description: false,
          allocations: false,
        });
        setSplitAcrossWallets(false);
        setAllocationRows(createAllocationDraftRows());
        refetchUserTransactions();
        if (uid) fetchWallets(uid);
        if (recurrenceId && recurrenceMonthKey) {
          markRecurrenceGenerated({ id: recurrenceId, monthKey: recurrenceMonthKey });
        }
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
    if (isReadOnly) {
      toast({
        title: t('toast.error'),
        description: t('account.blocked.banner', 'Sua conta está bloqueada para alterações. Você pode consultar seus dados, mas não pode criar ou editar informações.'),
        variant: 'destructive',
      });
      return;
    }

    const finalData = buildFinalTransactionData(data);
    const errors = getValidationErrors();

    if (
      errors.value ||
      errors.category ||
      errors.wallet ||
      errors.description ||
      errors.allocations
    ) {
      setFieldErrors(errors);
      let description = [
        errors.value && t('transactionForm.form.value'),
        errors.category && t('transactionForm.form.category'),
        errors.wallet && t('transactionForm.form.wallet'),
        errors.description && t('transactionForm.form.description'),
        errors.allocations && 'Rateio entre carteiras',
      ]
        .filter(Boolean)
        .join(', ');
      if (errors.allocations && splitAcrossWallets) {
        const allocationCheck = validateAllocationsForSave(
          parseDisplayValue(displayValue),
          parseAllocationRows()
        );
        if (!allocationCheck.ok) {
          description = describeAllocationValidationFailure(allocationCheck.reason);
        }
      }
      toast({
        title: t('transactionForm.toast.title'),
        description: errors.allocations && splitAcrossWallets
          ? description
          : t('transactionForm.toast.missingFields', { fields: description }),
        variant: "destructive",
      });
      return;
    }

    edit(finalData, {
      onSuccess: () => {
        toast({
          title: 'Sucesso!',
          description: `${typeLabel} ${t('transactionForm.toast.editDescription')}`,
          variant: "success",
        });
        refetchUserTransactions();
        refetchTransaction();
        // Atualizar saldos dos cartões
        if (uid) fetchWallets(uid);
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

  const isEditing = Boolean(id && String(id).length > 0);

  return (
    <Form
      form={transactionForm}
      onSubmit={isEditing ? handleEdit : handleCreate}
      className={cn(
        "space-y-0 flex flex-col",
        mode === 'sheet' ? "h-full min-h-0" : "w-full max-w-lg mx-auto gap-4 sm:gap-5"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 sm:gap-5",
          mode === 'sheet' && "min-h-0 flex-1 overflow-y-auto overscroll-contain"
        )}
      >
      <div className="w-full text-center space-y-2 py-6 md:py-8">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {t('transactionForm.form.value')}
        </p>
        <div className="mx-auto flex w-full items-center justify-center gap-1">
          <span
            className={cn(
              "shrink-0 text-4xl font-bold",
              type === 'receita'
                ? "text-emerald-400"
                : type === 'conta'
                  ? "text-amber-400"
                  : "text-red-400"
            )}
          >
            {type === 'receita' ? '+' : '-'}
          </span>
          <div className="relative inline-flex items-center">
            <span className="mr-1 shrink-0 select-none text-4xl font-medium text-muted-foreground">
              {currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={displayValue}
              onChange={handleValueChange}
              placeholder="0"
              style={{ width: `${Math.max(displayValue.length || 1, 2) + 0.75}ch` }}
              className={cn(
                "max-w-[250px] bg-transparent border-none p-0 text-6xl font-black tracking-tighter text-center outline-none focus-visible:ring-0 placeholder:text-muted-foreground/60",
                type === 'receita'
                  ? "text-emerald-200"
                  : type === 'conta'
                    ? "text-amber-200"
                    : "text-red-200",
                fieldErrors.value && "ring-2 ring-red-500 ring-offset-2 rounded-lg"
              )}
              autoFocus
            />
          </div>
          <span className="mb-2 ml-1 shrink-0 self-end text-2xl font-medium text-muted-foreground">
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

      <TransactionAllocationsEditor
        enabled={splitAcrossWallets}
        onEnabledChange={(enabled) => {
          if (!enabled) {
            const firstWallet = allocationRows.find((row) => row.walletId?.trim())?.walletId;
            if (firstWallet) {
              setSelectedWalletId(firstWallet);
            }
          }
          setSplitAcrossWallets(enabled);
          setFieldErrors((prev) => ({ ...prev, allocations: false, wallet: false }));
        }}
        rows={allocationRows}
        onRowsChange={(rows) => {
          setAllocationRows(rows);
          setFieldErrors((prev) => ({ ...prev, allocations: false }));
        }}
        totalValue={parseDisplayValue(displayValue)}
        realWallets={realWallets}
        pocketLabel={t('wallets.pocket', LEGACY_POCKET_CARD_NAME)}
        pocketBalanceLabel={`${currencySymbol} ${pocketBalance.toFixed(2)}`}
        currencySymbol={currencySymbol}
        locale={i18n.language}
        hasError={fieldErrors.allocations}
        configuredWalletCount={
          allocationRows.filter((row) => row.walletId?.trim()).length
        }
      />

      {!splitAcrossWallets && (
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase ml-1">
            {t('transactionForm.form.wallet')}
          </Label>
          <Select
            value={selectedWalletId}
            onValueChange={(val) => {
              setSelectedWalletId(val);
              setFieldErrors((prev) => ({ ...prev, wallet: false }));
            }}
          >
            <SelectTrigger className={cn("w-full bg-background/40 border-accent h-12 rounded-2xl px-4", fieldErrors.wallet && "border-red-500 ring-2 ring-red-500/20")}>
              <div className='flex flex-row gap-5 items-center'>
                <CreditCard className='text-muted-foreground opacity-50 w-5 h-5' />
                <SelectValue placeholder={t('transactionForm.form.selectWallet')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_WALLET_ID}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span>{t('wallets.pocket', LEGACY_POCKET_CARD_NAME)}</span>
                  <span className="text-muted-foreground text-xs">
                    ({currencySymbol} {pocketBalance.toFixed(2)})
                  </span>
                </div>
              </SelectItem>
              {realWallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id!}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wallet.color }} />
                    <span>{wallet.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({currencySymbol} {computeWalletDisplayBalance(wallet, allTransactions, currentMonthKey).toFixed(2)})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-5 md:divide-x md:divide-accent/10">
          <div className="flex items-center py-3 border-b border-accent/10 md:border-b-0">
            <Input
              name="description"
              placeholder={`${t('transactionForm.form.descriptionPlaceholder')} ${typeItemLabel}`}
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
      </div>

      <div
        className={cn(
          "shrink-0",
          mode === 'sheet'
            ? "border-t border-border/50 bg-background pt-4 mt-2"
            : "pt-1 pb-2"
        )}
      >
        <Button
          type="submit"
          disabled={isPending || isPendingEdit || isReadOnly}
          className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
        >
          {(isPending || isPendingEdit) ? (
            <Loader2 className="animate-spin h-6 w-6" />
          ) : (
            <>
              {isReadOnly ? t('account.blocked.readOnlyAction', 'Somente leitura') : `${isEditing ? t('default.edit') : t('default.add')} ${typeItemLabel}`}
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default TransactionForm;
