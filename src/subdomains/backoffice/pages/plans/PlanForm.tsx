/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plan, useCreatePlan, useGetPlan, useUpdatePlan } from '@/utils/services/api/plans';
import { useFieldArray, useForm } from 'react-hook-form';
import { PlanForm } from '@/types/validation/plan';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlignLeft, DollarSign, Plus, Save, Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const initialValues = {
  title: '',
  price: '',
  period: '',
  features: [''],
  isPopular: false,
  status: 'active',
};

function PlansFormComponent() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data: plan, refetch } = useGetPlan(id as string);

  const planForm = useForm<PlanForm>({
    defaultValues: initialValues,
  });

  const { fields, append, remove, replace } = useFieldArray<any>({
    control: planForm.control,
    name: 'features',
  });

  const edit = useUpdatePlan();
  const create = useCreatePlan();

  const handleSubmit = (data: any) => {
    if (id) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  const handleCreate = (data: Plan) => {
    const cleanedData = {
      ...data,
      features: data.features.map((f) => (typeof f === 'string' ? f : f.value)).filter(Boolean),
    };

    create.mutate(cleanedData, {
      onSuccess: () => {
        toast({
          title: t('toast.success'),
          description: t('toast.successCreatePlan'),
        });
      },
      onError: () => {
        toast({
          title: t('toast.error'),
          description: t('toast.errorCreatePlan'),
          variant: 'destructive',
        });
      },
    });
  };

  const handleUpdate = (data: Plan) => {
    const cleanedData = {
      ...data,
      id: id,
      features: data.features.map((f) => (typeof f === 'string' ? f : f.value)).filter(Boolean),
    };
    edit.mutate(cleanedData, {
      onSuccess: () => {
        toast({
          title: t('toast.success'),
          description: t('toast.successUpdatePlan'),
        });
        refetch();
      },
      onError: () => {
        toast({
          title: t('toast.error'),
          description: t('toast.errorUpdatePlan'),
          variant: 'destructive',
        });
      },
    });
  };

  React.useEffect(() => {
    if (id) {
      const mappedFeatures = plan?.features.map((f) => ({
        value: typeof f === 'string' ? f : f.value,
      }));
      planForm.reset({
        title: plan.title,
        price: plan.price,
        period: plan.period,
        features: mappedFeatures as any,
        isPopular: plan.isPopular,
        status: plan.status ?? 'active',
      });
    }
  }, [id, plan, planForm, replace]);

  return (
    <PrivateLayout>
      <PageShell
        title={id ? t('plans.backoffice.editTitle') : t('plans.backoffice.newTitle')}
        description={t('plans.backoffice.formDescription')}
        eyebrow={t('sidebar.backoffice')}
      >
        <div className="bo-surface p-6">
          <Form form={planForm} onSubmit={() => handleSubmit(planForm.getValues())} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('plans.backoffice.fieldTitle')} *</Label>
                <Input
                  leftIcon={<AlignLeft className="w-4 h-4" />}
                  name="title"
                  placeholder={t('plans.backoffice.fieldTitlePlaceholder')}
                  control={planForm.control}
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('plans.backoffice.fieldPrice')} *</Label>
                <Input
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  name="price"
                  placeholder={t('plans.backoffice.fieldPricePlaceholder')}
                  control={planForm.control}
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-2 flex flex-col gap-3">
                <div>
                  <Label>{t('plans.backoffice.fieldPeriod')}</Label>
                  <Select onValueChange={(value) => planForm.setValue('period', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('plans.backoffice.fieldPeriodPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={t('plans.backoffice.periodValueMonth')}>
                        {t('plans.backoffice.periodMonth')}
                      </SelectItem>
                      <SelectItem value={t('plans.backoffice.periodValueYear')}>
                        {t('plans.backoffice.periodYear')}
                      </SelectItem>
                      <SelectItem value={t('plans.backoffice.periodValueSemester')}>
                        {t('plans.backoffice.periodSemester')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{t('plans.backoffice.fieldPopular')}</Label>
                  <Switch
                    name="isPopular"
                    checked={planForm.watch('isPopular')}
                    onCheckedChange={(value) => planForm.setValue('isPopular', value)}
                  />
                </div>

                <div>
                  <Label>{t('plans.backoffice.fieldStatus', 'Status')}</Label>
                  <Select
                    value={planForm.watch('status') ?? 'active'}
                    onValueChange={(value) => planForm.setValue('status', value as 'active' | 'archived')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('plans.backoffice.status.active', 'Ativo')}</SelectItem>
                      <SelectItem value="archived">{t('plans.backoffice.status.archived', 'Arquivado')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="col-span-1 border border-border/80 rounded-xl shadow-sm p-4 flex flex-col bg-muted/20">
                <div>
                  <Label className="my-2 mb-3">{t('plans.backoffice.fieldFeatures')} *</Label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-5 my-5">
                      <Input
                        control={planForm.control}
                        name={`features.${index}.value`}
                        placeholder={t('plans.backoffice.featurePlaceholder', { index: index + 1 })}
                        className="bg-background/50 flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                        className="hover:opacity-80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button type="button" onClick={() => append({})} className="flex items-center gap-1 mt-5">
                  <Plus className="w-4 h-4" />
                  {t('plans.backoffice.addFeature')}
                </Button>
              </div>
            </div>

            <div className="flex flex-row gap-3 items-center">
              <Button variant="outline" type="reset">
                <X />
                {t('default.reset')}
              </Button>
              <Button type="submit">
                <Save />
                {t('default.save')}
              </Button>
            </div>
          </Form>
        </div>
      </PageShell>
    </PrivateLayout>
  );
}

export default PlansFormComponent;
