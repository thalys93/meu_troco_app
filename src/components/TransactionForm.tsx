/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Form } from './ui/form';
import { Transaction, useCreateTransaction, useEditTransaction, useUserTransaction, useUserTransactions } from '@/utils/api/transation';
import { Loader2, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useUserStore from '@/store/UserStore';
import { useCategories } from '@/hooks/use-categories';
import { useTranslation } from 'react-i18next';
import QuickAmountButtons from './QuickAmountButtons';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionFormProps {
  type: 'receita' | 'despesa';
}

const initialValues = {
  value: 0,
  date: new Date().toISOString().split('T')[0],
  description: '',
  category: '',
  type: ''
}

const TransactionForm = ({ type }: TransactionFormProps) => {
  const [category, setCategory] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const transactionForm = useForm({
    defaultValues: initialValues
  })

  const { id } = useParams();
  const navigate = useNavigate();
  const { uid } = useUserStore();
  const { data: transaction, refetch: refetchTransaction } = useUserTransaction(uid, id)
  const { expenseCategories, incomeCategories } = useCategories()

  const { mutate: create, isPending } = useCreateTransaction();
  const { mutate: edit, isPending: isPendingEdit } = useEditTransaction(uid, id);
  const { refetch: refetchUserTransactions } = useUserTransactions()
  const { t, i18n } = useTranslation();

  const categories = type === 'receita' ? incomeCategories : expenseCategories;
  const getCategoryLabel = (category: string) => t(`categories.${category}`);

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

  React.useEffect(() => {
    if (id) refetchTransaction()
  }, [id])

  React.useEffect(() => {
    if (!id || !transaction) return
    transactionForm.reset(transaction)
    setCategory(transaction.category)
    setDisplayValue(transaction.value.toString())
  }, [id, transaction])

  React.useEffect(() => {
    if (!type) return
    transactionForm.setValue('type', type)
  }, [type])

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setDisplayValue(val || '0');
  };

  const handleQuickAmount = (amount: number) => {
    setDisplayValue(prev => (parseFloat(prev || '0') + amount).toFixed(2).replace(/\.00$/, ''));
  };

  const handleCreate = async (data: Transaction) => {
    const finalData = { ...data, value: parseFloat(displayValue) };

    if (finalData.value <= 0 || !category || !finalData.description) {
      toast({
        title: t('transactionForm.toast.title'),
        description: t('transactionForm.toast.description'),
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
        setDisplayValue('0');
        refetchUserTransactions();
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
    const finalData = { ...data, value: parseFloat(displayValue) };

    if (finalData.value <= 0 || !category || !finalData.description) {
      toast({
        title: t('transactionForm.toast.title'),
        description: t('transactionForm.toast.description'),
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
        navigate(-1);
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
    <Form form={transactionForm} onSubmit={id ? handleEdit : handleCreate} className="space-y-0 flex flex-col gap-6 max-w-md mx-auto">
      {/* Value Display */}
      <div className="text-center space-y-2 py-8">
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
              className={cn("text-6xl font-black tracking-tighter bg-transparent border-none outline-none w-auto max-w-[250px] text-center focus-visible:ring-0 p-0", type === 'receita' ? "text-emerald-200" : "text-red-200")}
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
          }}
        >
          <SelectTrigger className="w-full bg-background/40 border-accent/10 h-12 rounded-2xl px-4">
            <SelectValue placeholder={t('transactionForm.form.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description & Date Row */}
      <Card className="bg-background/40 border-accent/10 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="flex items-center px-4 py-3 border-b border-accent/10">
              <Input
                name="description"
                placeholder={`${t('transactionForm.form.descriptionPlaceholder')} ${type === 'receita' ? t('default.receipt') : t('default.expense')}`}
                control={transactionForm.control}
                className="bg-transparent border-none focus-visible:ring-0 text-base h-auto p-0"
              />
            </div>
            <div className="flex items-center px-4 py-3 group cursor-pointer">
              <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
              <Input
                name="date"
                type="date"
                control={transactionForm.control}
                className="bg-transparent border-none focus-visible:ring-0 text-sm h-auto p-0 cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        type="submit"
        disabled={isPending || isPendingEdit}
        className={cn(
          "w-full h-16 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]",
          type === 'receita' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"
        )}
      >
        {(isPending || isPendingEdit) ? (
          <Loader2 className="animate-spin h-6 w-6" />
        ) : (
          <>
            {id ? t('default.edit') : t('default.add')} {type === 'receita' ? t('default.receipt') : t('default.expense')}
          </>
        )}
      </Button>

      {id && (
        <Button
          variant="ghost"
          type="button"
          onClick={() => navigate(-1)}
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
