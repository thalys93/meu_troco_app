import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import PricingCard from '@/components/PricingCard';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash } from 'lucide-react';
import { Plan, useDeletePlan, useGetPlans } from '@/utils/services/api/plans';
import { EmptyIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function PlansPage() {
  const { t } = useTranslation();
  const { data: plans, isLoading, refetch } = useGetPlans();
  const navigate = useNavigate();
  const deletePlan = useDeletePlan();

  const handleDelete = (id: string) => {
    if (!id) return;
    deletePlan.mutate(id, {
      onSuccess: () => {
        toast({
          title: t('plans.backoffice.deleted'),
          description: t('plans.backoffice.deletedDescription'),
          variant: 'destructive',
        });
        refetch();
      },
      onError: () => {
        toast({
          title: t('toast.error'),
          description: t('plans.backoffice.deleteError'),
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <PrivateLayout>
      <PageShell
        title={t('backoffice.plans')}
        description={t('backoffice.plans.description')}
        eyebrow={t('sidebar.backoffice')}
        actions={
          <Button onClick={() => navigate('/backoffice/plan/')}>
            <Plus className="w-4 h-4 mr-2" />
            {t('plans.backoffice.new')}
          </Button>
        }
      >
        <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6', isLoading && 'animate-pulse')}>
          {plans?.map((plan: Plan) => (
            <PricingCard
              key={plan.id}
              features={plan.features as string[]}
              price={plan.price}
              title={plan.title}
              period={plan.period}
              className="bo-surface-elevated hover:shadow-md transition-shadow"
              actions={
                <div className="flex flex-col md:flex-row justify-end gap-3">
                  <Button onClick={() => navigate(`/backoffice/plan/${plan.id}`)}>
                    <Edit />
                    {t('default.edit')}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex flex-row items-center gap-2" variant="destructive">
                        <Trash />
                        {t('transactionList.delete')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('plans.backoffice.deleteConfirmTitle')}</DialogTitle>
                        <DialogDescription>
                          {t('plans.backoffice.deleteConfirmDescription', { title: plan.title })}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">{t('default.cancel')}</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="destructive" onClick={() => handleDelete(plan.id)}>
                            {t('transactionList.delete')}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              }
            />
          ))}

          {!plans?.length && !isLoading && (
            <div className="col-span-full bo-surface p-8 flex flex-row items-center justify-center gap-2 text-muted-foreground">
              <EmptyIcon className="w-6 h-6" />
              {t('plans.backoffice.empty')}
            </div>
          )}
        </div>
      </PageShell>
    </PrivateLayout>
  );
}

export default PlansPage;
