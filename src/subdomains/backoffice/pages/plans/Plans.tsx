import React from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import PricingCard from '@/components/PricingCard';
import { Button } from '@/components/ui/button';
import { Archive, Edit, Plus, Trash } from 'lucide-react';
import { Plan, PlanStatus, useDeletePlan, useGetPlans, useUpdatePlan } from '@/utils/services/api/plans';
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
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EntityActionsMenu, type ActionMenuItem } from '@/components/EntityActionsMenu';

type PlanFilter = 'active' | 'archived' | 'all';

type PlanCardWithActionsProps = {
  plan: Plan;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onRequestDelete: () => void;
  t: ReturnType<typeof useTranslation>['t'];
};

function PlanCardWithActions({ plan, onEdit, onArchiveToggle, onRequestDelete, t }: PlanCardWithActionsProps) {
  const isArchived = (plan.status ?? 'active') === 'archived';

  const actionItems = React.useMemo<ActionMenuItem[]>(
    () => [
      {
        id: 'edit',
        label: t('default.edit'),
        icon: <Edit className="h-4 w-4" />,
        onSelect: onEdit,
      },
      {
        id: 'archive',
        label: isArchived
          ? t('plans.backoffice.restore', 'Reativar')
          : t('plans.backoffice.archive', 'Arquivar'),
        icon: <Archive className="h-4 w-4" />,
        onSelect: onArchiveToggle,
      },
      {
        id: 'delete',
        label: t('transactionList.delete'),
        icon: <Trash className="h-4 w-4" />,
        onSelect: onRequestDelete,
        destructive: true,
      },
    ],
    [isArchived, onArchiveToggle, onEdit, onRequestDelete, t]
  );

  const card = (
    <PricingCard
      features={plan.features as string[]}
      price={plan.price}
      title={plan.title}
      period={plan.period}
      className="bo-surface-elevated hover:shadow-md transition-shadow"
      actions={
        <div className="flex flex-col gap-3">
          {isArchived && (
            <Badge variant="outline" className="w-fit bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30">
              {t('plans.backoffice.status.archived', 'Arquivado')}
            </Badge>
          )}
          <div className="flex flex-col md:flex-row justify-end gap-3">
            <Button onClick={onEdit}>
              <Edit />
              {t('default.edit')}
            </Button>
            <Button variant="outline" onClick={onArchiveToggle}>
              <Archive />
              {isArchived
                ? t('plans.backoffice.restore', 'Reativar')
                : t('plans.backoffice.archive', 'Arquivar')}
            </Button>
            <Button className="flex flex-row items-center gap-2" variant="destructive" onClick={onRequestDelete}>
              <Trash />
              {t('transactionList.delete')}
            </Button>
          </div>
        </div>
      }
    />
  );

  return (
    <EntityActionsMenu items={actionItems} menuLabel={t('transactionList.actions')}>
      {card}
    </EntityActionsMenu>
  );
}

function PlansPage() {
  const { t } = useTranslation();
  const { data: plans, isLoading, refetch } = useGetPlans();
  const navigate = useNavigate();
  const deletePlan = useDeletePlan();
  const updatePlan = useUpdatePlan();
  const [filter, setFilter] = React.useState<PlanFilter>('active');
  const [pendingDeletePlan, setPendingDeletePlan] = React.useState<Plan | null>(null);

  const filteredPlans = React.useMemo(() => {
    const list = plans ?? [];
    if (filter === 'all') return list;
    return list.filter((plan) => (plan.status ?? 'active') === filter);
  }, [filter, plans]);

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

  const handleStatusChange = (plan: Plan, status: PlanStatus) => {
    if (!plan.id) return;
    updatePlan.mutate({ ...plan, status }, {
      onSuccess: () => {
        toast({
          title: t('toast.success'),
          description: status === 'archived'
            ? t('plans.backoffice.archiveSuccess', 'Plano arquivado com sucesso.')
            : t('plans.backoffice.restoreSuccess', 'Plano reativado com sucesso.'),
        });
        refetch();
      },
      onError: () => {
        toast({
          title: t('toast.error'),
          description: t('plans.backoffice.archiveError', 'Não foi possível atualizar o status do plano.'),
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
        <div className="space-y-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as PlanFilter)}>
            <TabsList>
              <TabsTrigger value="active">{t('plans.backoffice.status.active', 'Ativos')}</TabsTrigger>
              <TabsTrigger value="archived">{t('plans.backoffice.status.archived', 'Arquivados')}</TabsTrigger>
              <TabsTrigger value="all">{t('plans.backoffice.status.all', 'Todos')}</TabsTrigger>
            </TabsList>
          </Tabs>

        <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6', isLoading && 'animate-pulse')}>
          {filteredPlans.map((plan: Plan) => (
            <PlanCardWithActions
              key={plan.id}
              plan={plan}
              t={t}
              onEdit={() => navigate(`/backoffice/plan/${plan.id}`)}
              onArchiveToggle={() =>
                handleStatusChange(plan, (plan.status ?? 'active') === 'archived' ? 'active' : 'archived')
              }
              onRequestDelete={() => setPendingDeletePlan(plan)}
            />
          ))}

          {!filteredPlans.length && !isLoading && (
            <div className="col-span-full bo-surface p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <EmptyIcon className="w-6 h-6" />
              <span>{t('plans.backoffice.empty')}</span>
              <Button type="button" onClick={() => navigate('/backoffice/plan/')}>
                <Plus className="w-4 h-4 mr-2" />
                {t('plans.backoffice.new')}
              </Button>
            </div>
          )}
        </div>
        </div>

        <Dialog open={!!pendingDeletePlan} onOpenChange={(open) => !open && setPendingDeletePlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('plans.backoffice.deleteConfirmTitle')}</DialogTitle>
              <DialogDescription>
                {pendingDeletePlan &&
                  t('plans.backoffice.deleteConfirmDescription', { title: pendingDeletePlan.title })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('default.cancel')}</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (pendingDeletePlan?.id) handleDelete(pendingDeletePlan.id);
                    setPendingDeletePlan(null);
                  }}
                >
                  {t('transactionList.delete')}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageShell>
    </PrivateLayout>
  );
}

export default PlansPage;
