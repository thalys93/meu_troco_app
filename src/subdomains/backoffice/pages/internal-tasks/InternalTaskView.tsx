import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { InternalTask } from '@/types/backoffice';
import { isOverdue, priorityAccent } from '@/subdomains/backoffice/pages/internal-tasks/task-shared';
import {
    useDeleteInternalTask,
    useGetInternalTask,
} from '@/utils/services/api/internal-tasks-service';
import { ArrowLeft, Calendar, Edit, Trash2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

function InternalTaskViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data: task, isLoading, isError } = useGetInternalTask(id);
    const deleteTask = useDeleteInternalTask();

    const handleDelete = (item: InternalTask) => {
        if (!item.id) return;
        deleteTask.mutate(item.id, {
            onSuccess: () => {
                toast({ title: t('toast.success'), description: t('internalTasks.deleted', 'Tarefa removida com sucesso.') });
                navigate('/backoffice/internal-tasks');
            },
        });
    };

    if (isLoading) {
        return (
            <PrivateLayout>
                <PageShell title={t('internalTasks.viewTitle', 'Tarefa')} eyebrow={t('sidebar.backoffice')}>
                    <div className="bo-surface h-72 animate-pulse" />
                </PageShell>
            </PrivateLayout>
        );
    }

    if (isError || !task) {
        return (
            <PrivateLayout>
                <PageShell
                    title={t('internalTasks.notFound', 'Tarefa não encontrada')}
                    eyebrow={t('sidebar.backoffice')}
                    actions={(
                        <Button variant="outline" size="sm" onClick={() => navigate('/backoffice/internal-tasks')}>
                            <ArrowLeft className="h-4 w-4" />
                            {t('default.back')}
                        </Button>
                    )}
                >
                    <div className="bo-surface p-8 text-center text-muted-foreground">
                        {t('internalTasks.notFoundDescription', 'A tarefa solicitada não existe ou foi removida.')}
                    </div>
                </PageShell>
            </PrivateLayout>
        );
    }

    const overdue = isOverdue(task.dueDate);

    return (
        <PrivateLayout>
            <PageShell
                title={task.title}
                description={t('internalTasks.viewDescription', 'Detalhes da tarefa operacional.')}
                eyebrow={t('sidebar.internalTasks')}
                actions={(
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/backoffice/internal-tasks')}>
                            <ArrowLeft className="h-4 w-4" />
                            {t('default.back')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/backoffice/internal-task/${task.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                            {t('default.edit')}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(task)} disabled={deleteTask.isPending}>
                            <Trash2 className="h-4 w-4" />
                            {t('default.delete', 'Excluir')}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-6">
                    <div className={cn('bo-surface border-l-[3px] p-5 space-y-4', priorityAccent[task.priority])}>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{t(`internalTasks.status.${task.status}`, task.status)}</Badge>
                            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                {t(`internalTasks.priority.${task.priority}`, task.priority)}
                            </Badge>
                            {task.assignee && (
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    {task.assignee}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className={cn('inline-flex items-center gap-1.5 text-sm', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                                    <Calendar className="h-3.5 w-3.5" />
                                    {task.dueDate}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                {t('internalTasks.fieldDescription', 'Descrição')}
                            </h2>
                            <MarkdownContent
                                content={task.description}
                                className="prose-base"
                                emptyFallback={(
                                    <p className="text-sm text-muted-foreground italic">
                                        {t('internalTasks.noDescription', 'Sem descrição.')}
                                    </p>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default InternalTaskViewPage;
