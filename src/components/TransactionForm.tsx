/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Form } from './ui/form';
import { Transaction, useCreateTransaction, useEditTransaction, useUserTransaction, useUserTransactions } from '@/utils/api/transation';
import { Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import useUserStore from '@/store/UserStore';
import { useCategories } from '@/hooks/use-categories';
import { useTranslation } from 'react-i18next';

interface TransactionFormProps {
  type: 'receita' | 'despesa';
}

const initialValues = {
  value: null,
  date: new Date().toISOString().split('T')[0],
  description: '',
  category: '',
  type: ''
}

const TransactionForm = ({ type }: TransactionFormProps) => {
  const [category, setCategory] = useState<string>('');
  const transactionForm = useForm({
    defaultValues: initialValues
  })

  const { id } = useParams();
  const { uid } = useUserStore();
  const { data: transaction, isLoading, refetch: refetchTransaction } = useUserTransaction(uid, id)
  const { expenseCategories, incomeCategories } = useCategories()

  const { mutate: create, isPending } = useCreateTransaction();
  const { mutate: edit, isPending: isPendingEdit } = useEditTransaction(uid, id);
  const { refetch: refetchUserTransactions } = useUserTransactions()
  const { t } = useTranslation();

  const categories = type === 'receita' ? incomeCategories : expenseCategories;        
  const getCategoryLabel = (category: string) => t(`categories.${category}`);

  React.useEffect(() => {
    refetchTransaction()
  }, [id])

  React.useEffect(() => {
    if (!id) return
    if (!transaction) return
    transactionForm.reset(transaction)
    setCategory(transaction.category)
  }, [id, transaction])

  React.useEffect(() => {
    if (!type) return
    transactionForm.setValue('type', type)
  }, [type])

  const handleCreate = async (data: Transaction) => {
    event?.preventDefault();
    const validations = {
      value: data.value > 0,
      category: data.category !== '',
      date: data.date !== '',
      description: data.description !== ''
    }

    const isValid = Object.values(validations).every(Boolean);

    if (!isValid) {
      toast({
        title: t('transactionForm.toast.title'),
        description: t('transactionForm.toast.description'),
        variant: "destructive",
      });
      return;
    }

    create(data, {
      onSuccess: () => {
        toast({
          title: t('transactionForm.toast.success'),
          description: `${type === 'receita' ? t('sidebar.income') : t('sidebar.expenses')} ${t('transactionForm.toast.successDescription')}`,
        });
        transactionForm.reset(initialValues);
        setCategory('');
        refetchUserTransactions();
      },
      onError: (error) => {
        toast({
          title: 'Erro',
          description: t('transactionForm.toast.errorDescription'),
          variant: 'destructive',
        });        
      }
    });
  };

  const handleEdit = async (data: Transaction) => {
    event?.preventDefault();
    const validations = {
      value: data.value > 0,
      category: data.category !== '',
      date: data.date !== '',
      description: data.description !== ''
    }

    const isValid = Object.values(validations).every(Boolean);

    const dataToEdit: Transaction = {
      category: data.category,
      date: data.date,
      description: data.description,
      type: data.type,
      value: data.value
    }

    if (!isValid) {
      toast({
        title: t('transactionForm.toast.title'),
        description: t('transactionForm.toast.description'),
        variant: "destructive",
      });
      return;
    }

    edit(dataToEdit, {
      onSuccess: () => {
        toast({
          title: 'Sucesso!',
          description: `${type === 'receita' ? t('sidebar.income') : t('sidebar.expenses') } ${t('transactionForm.toast.editDescription')}`,
        });
        setCategory('');
        refetchUserTransactions();
        refetchTransaction();
        transactionForm.reset(initialValues);
      },
      onError: (error) => {
        toast({
          title: 'Erro',
          description: t('transactionForm.toast.errorDescription'),
          variant: 'destructive',
        });

        console.log(error)
      }
    });
  }

  const getTranslatedType = (type: string) => {
    switch (type) {
      case 'receita':
        return t('default.receipt')
      case 'despesa':
        return t('default.expense')
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {id ? t('default.edit') : t('default.new')} {type === 'receita' ? t('default.receipt') : t('default.expense')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={transactionForm} onSubmit={id ? handleEdit : handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('transactionForm.form.value')} ($)</Label>
              <Input
                name="value"
                type="number"
                step="0.01"
                placeholder="0.00"
                control={transactionForm.control}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t('transactionForm.form.date')}</Label>
              <Input
                name="date"
                type="date"
                control={transactionForm.control}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('transactionForm.form.description')}</Label>
            <Input
              name="description"
              placeholder={`${t('transactionForm.form.descriptionPlaceholder')} ${getTranslatedType(type)}`}
              control={transactionForm.control}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('transactionForm.form.category')}</Label>
            <Select value={category} onValueChange={(value) => { setCategory(value), transactionForm.setValue('category', value) }}>
              <SelectTrigger className="bg-background/50">
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

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isPending && <Loader2 className='animate-spin' />}
            {id ? t('default.edit') : t('default.add')} {type === 'receita' ? t('default.receipt') : t('default.expense')}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
