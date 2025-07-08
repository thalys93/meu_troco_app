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
  const transactionForm = useForm({
    defaultValues: initialValues
  })

  const { id } = useParams();
  const { uid } = useUserStore();
  const { data: transaction, isLoading, refetch: refetchTransaction } = useUserTransaction(uid, id)

  const { mutate: create, isPending } = useCreateTransaction();
  const { mutate: edit, isPending: isPendingEdit } = useEditTransaction(id);
  const { refetch: refetchUserTransactions } = useUserTransactions()

  const incomeCategories = [
    'Salário', 'Freelancer', 'Negócios', 'Investimentos', 'Trabalho Paralelo', 'Outro'
  ];

  const expenseCategories = [
    'Moradia', 'Alimentação', 'Transporte', 'Serviços', 'Saúde',
    'Entretenimento', 'Compras', 'Educação', 'Viagem', 'Outro'
  ];

  const categories = type === 'receita' ? incomeCategories : expenseCategories;

  React.useEffect(() => {
    refetchTransaction()
  }, [id])

  React.useEffect(() => {
    if (!id) return
    if (id && transaction) {
      transactionForm.reset(transaction)
      setCategory(transaction.category)
    }
  }, [id])

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
        title: "Informações Faltando",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    create(data, {
      onSuccess: () => {
        toast({
          title: 'Sucesso!',
          description: `${type === 'receita' ? 'Receita' : 'Gasto'} adicionado com sucesso!`,
        });
        transactionForm.reset();
        setCategory('');
        refetchUserTransactions();
      },
      onError: (error) => {
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar a transação',
          variant: 'destructive',
        });

        console.log(error)
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
        title: "Informações Faltando",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    edit(dataToEdit, {
      onSuccess: () => {
        toast({
          title: 'Sucesso!',
          description: `${type === 'receita' ? 'Receita' : 'Gasto'} Editado com sucesso!`,
        });
        setCategory('');
        refetchUserTransactions();
        refetchTransaction();        
        transactionForm.reset();
      },
      onError: (error) => {
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar a transação',
          variant: 'destructive',
        });

        console.log(error)
      }
    });
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {id ? "Editar" : "Adicionar Nova" } {type === 'receita' ? 'Receita' : 'Despesa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={transactionForm} onSubmit={id ? handleEdit : handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor ($)</Label>
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
              <Label htmlFor="date">Data</Label>
              <Input
                name="date"
                type="date"
                control={transactionForm.control}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              name="description"
              placeholder={`Digite a descrição da ${type}`}
              control={transactionForm.control}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={(value) => { setCategory(value), transactionForm.setValue('category', value) }}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
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
            {id ? 'Editar' : 'Adicionar'} {type === 'receita' ? 'Receita' : 'Despesa'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
