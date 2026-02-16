/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { Plan, useCreatePlan, useGetPlan, useUpdatePlan } from '@/utils/services/api/plans';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlanForm, PlanSchema } from '@/types/validation/plan';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlignLeft, DollarSign, Plus, Save, Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const initialValues = {
  title: "",
  price: "",
  period: "",
  features: [""],
  isPopular: false
}

function PlansFormComponent() {
  const { id } = useParams();
  const { t } = useTranslation();

  const { data: plan, refetch } = useGetPlan(id as string);

  const planForm = useForm<PlanForm>({
    defaultValues: initialValues,
    // resolver: zodResolver(PlanSchema),
  })

  const { fields, append, remove, replace } = useFieldArray<any>({
    control: planForm.control,
    name: "features",
  })

  const edit = useUpdatePlan();
  const create = useCreatePlan();

  const handleSubmit = (data: any) => {
    if (id) {
      handleUpdate(data)
    } else {
      handleCreate(data)
    }
  }

  const handleCreate = (data: Plan) => {
    const cleanedData = {
      ...data,
      features: data.features.map(f => typeof f === "string" ? f : f.value).filter(Boolean),
    };

    create.mutate(cleanedData, {
      onSuccess: () => {
        toast({
          title: t('toast.success'),
          description: t('toast.successCreatePlan'),
        })
      },
      onError: () => {
        toast({
          title: t('toast.error'),
          description: t('toast.errorCreatePlan'),
          variant: "destructive"
        })
      }
    })
  }

  const handleUpdate = (data: Plan) => {    
    const cleanedData = {
      ...data,
      id: id,
      features: data.features.map(f => typeof f === "string" ? f : f.value).filter(Boolean),
    };
    edit.mutate(cleanedData, {
      onSuccess: () => {
        toast({
          title: t('toast.success'),
          description: t('toast.successUpdatePlan'),
        })
        refetch()
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: t('toast.error'),
          description: t('toast.errorUpdatePlan'),
          variant: "destructive"
        })
      }
    })
  }

  React.useEffect(() => {
    if (id) {
      const mappedFeatures = plan?.features.map((f) => ({
        value: typeof f === "string" ? f : f.value,
      }));
      planForm.reset({
        title: plan.title,
        price: plan.price,
        period: plan.period,
        features: mappedFeatures as any,
        isPopular: plan.isPopular
      });
    }
  }, [id, plan, planForm, replace])


  return (
    <PrivateLayout>
      <section className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        <div className='flex items-center gap-3'>
          <div>
            <h1 className="text-3xl font-bold">{id ? 'Editar plano' : 'Novo plano'}</h1>
            <span className='text-muted-foreground'>Crie um novo plano para sua empresa</span>
          </div>
        </div>

        <div>
          <Form form={planForm} onSubmit={() => handleSubmit(planForm.getValues())} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className='space-y-2'>
                <Label>Título *</Label>
                <Input
                  leftIcon={<AlignLeft className='w-4 h-4' />}
                  name='title'
                  placeholder='Plano Premium'
                  control={planForm.control}
                  className='bg-background/50'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label>Preço *</Label>
                <Input
                  leftIcon={<DollarSign className='w-4 h-4' />}
                  name='price'
                  placeholder='R$ 50.00'
                  control={planForm.control}
                  className='bg-background/50'
                  required
                />
              </div>

              <div className='space-y-2 flex flex-col gap-3'>
                <div>
                  <Label>Periodo</Label>
                  <Select onValueChange={value => planForm.setValue('period', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Recorrência" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="/mês">Mês</SelectItem>
                      <SelectItem value="/ano">Ano</SelectItem>
                      <SelectItem value="/semestre">Semestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col gap-2'>
                  <Label>Plano Destaque</Label>
                  <Switch
                    name='isPopular'
                    checked={planForm.watch('isPopular')}
                    onCheckedChange={value => planForm.setValue('isPopular', value)} />
                </div>
              </div>

              <Card className='col-span-1 glass-card p-3 flex flex-col'>
                <div>
                  <Label className='my-2 mb-3'>Funcionalidades *</Label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-5 my-5">
                      <Input
                        control={planForm.control}
                        name={`features.${index}.value`}
                        placeholder={`Funcionalidade ${index + 1}`}
                        className="bg-background/50 flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant={"destructive"}
                        onClick={() => remove(index)}
                        className="hover:opacity-80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={() => append({})}
                  className="flex items-center  gap-1 mt-5"
                >
                  <Plus className="w-4 h-4" /> Adicionar funcionalidade
                </Button>
              </Card>
            </div>

            <div className='flex flex-row gap-3 items-center '>
              <Button variant="outline" type="reset">
                <X />
                Resetar
              </Button>

              <Button type="submit">
                <Save />
                Salvar
              </Button>

            </div>
          </Form>
        </div>
      </section>
    </PrivateLayout>
  )
}

export default PlansFormComponent