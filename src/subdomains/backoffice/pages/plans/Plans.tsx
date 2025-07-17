import React from 'react'
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils';
import PricingCard from '@/components/PricingCard';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash } from 'lucide-react';
import { Plan, useDeletePlan, useGetPlans } from '@/utils/api/plans';
import { EmptyIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function PlansPage() {
  const { t } = useTranslation();
  const { data: plans, isLoading, refetch } = useGetPlans();
  const navigate = useNavigate();
  const deletePlan = useDeletePlan();

  const handleDelete = (id: string) => {
    if (!id) return
    deletePlan.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Plano excluido",
          description: "Plano excluido com sucesso",
          variant: "destructive"
        })
        refetch()
      },
      onError: () => {
        toast({
          title: "Erro ao excluir plano",
          description: "Erro ao excluir plano",
          variant: "destructive"
        })
      }
    })
  }

  return (
    <PrivateLayout>
      <section className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">{t('backoffice.plans')}</h1>
            <span className='text-muted-foreground'>{t('backoffice.plans.description')}</span>
          </div>
        </div>

        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", isLoading && "animate-pulse")}>
          {plans?.map((plan: Plan) => (
            <PricingCard
              features={plan.features as string[]}
              price={plan.price}
              title={plan.title}
              key={plan.id}
              period={plan.period}
              actions={(
                <div className='flex flex-col md:flex-row justify-end gap-3'>
                  <Button onClick={() => navigate(`/backoffice/plan/${plan.id}`)}>
                    <Edit />
                    {t('default.edit')}
                  </Button>
                  <Dialog>
                    <DialogTrigger>
                      <Button className='flex flex-row items-center gap-2' variant='destructive'>
                        <Trash />
                        {t('transactionList.delete')}
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Aviso de Exclusão de Plano</DialogTitle>
                      </DialogHeader>

                      <DialogDescription>
                        Tem certeza que deseja excluir o plano {plan.title}?
                      </DialogDescription>

                      <DialogFooter>
                        <DialogClose>
                          <Button variant='outline'>
                            Cancelar
                          </Button>
                        </DialogClose>

                        <DialogClose>
                          <Button variant='destructive' onClick={() => handleDelete(plan.id)}>
                            Excluir
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            />
          ))}

          {!plans?.length && (
            <span className='flex flex-row items-center gap-2 text-muted-foreground transition-all hover:text-emerald-500'>
              <EmptyIcon className='w-6 h-6' />
              Sem Planos Cadastrados
            </span>
          )}
        </div>

        <div>
          <Button onClick={() => navigate('/backoffice/plan/')}>
            <Plus />
            Novo Plano
          </Button>
        </div>
      </section>
    </PrivateLayout>
  )
}

export default PlansPage