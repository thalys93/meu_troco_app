import { useEffect } from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form } from '@/components/ui/form';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { toast } from '@/hooks/use-toast';
import type { InternalTask, Priority, WorkStatus } from '@/types/backoffice';
import {
    useCreateInternalTask,
    useGetInternalTask,
    useUpdateInternalTask,
} from '@/utils/services/api/internal-tasks-service';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

type InternalTaskFormValues = {
    title: string;
    description: string;
    status: WorkStatus;
    priority: Priority;
    assignee: string;
    dueDate: string;
};

const defaultValues: InternalTaskFormValues = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
};

function InternalTaskFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isEditing = Boolean(id);
    const { data: task, isLoading, isError } = useGetInternalTask(isEditing ? id : undefined);
    const createTask = useCreateInternalTask();
    const updateTask = useUpdateInternalTask();

    const form = useForm<InternalTaskFormValues>({ defaultValues });

    useEffect(() => {
        if (!isEditing || !task) return;
        form.reset({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee ?? '',
            dueDate: task.dueDate ?? '',
        });
    }, [form, isEditing, task]);

    const onSubmit = (values: InternalTaskFormValues) => {
        const payload: Omit<InternalTask, 'id' | 'createdAt' | 'updatedAt'> = {
            title: values.title.trim(),
            description: values.description.trim(),
            status: values.status,
            priority: values.priority,
            assignee: values.assignee.trim(),
            dueDate: values.dueDate,
        };

        if (isEditing && task?.id) {
            updateTask.mutate({ ...payload, id: task.id }, {
                onSuccess: () => {
                    toast({ title: t('toast.success'), description: t('internalTasks.saved', 'Tarefa salva com sucesso.') });
                    navigate(`/backoffice/internal-task/${task.id}`);
                },
            });
            return;
        }

        createTask.mutate(payload, {
            onSuccess: (newId) => {
                toast({ title: t('toast.success'), description: t('internalTasks.saved', 'Tarefa salva com sucesso.') });
                navigate(`/backoffice/internal-task/${newId}`);
            },
        });
    };

    if (isEditing && isLoading) {
        return (
            <PrivateLayout>
                <PageShell title={t('default.edit')} eyebrow={t('sidebar.backoffice')}>
                    <div className="bo-surface h-72 animate-pulse" />
                </PageShell>
            </PrivateLayout>
        );
    }

    if (isEditing && (isError || !task)) {
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

    return (
        <PrivateLayout>
            <PageShell
                title={isEditing ? t('internalTasks.editTitle', 'Editar tarefa') : t('internalTasks.newTitle', 'Nova tarefa')}
                description={t('internalTasks.formDescription', 'Preencha os dados da tarefa. A descrição aceita markdown.')}
                eyebrow={t('sidebar.internalTasks')}
                actions={(
                    <Button variant="outline" size="sm" onClick={() => navigate(isEditing && id ? `/backoffice/internal-task/${id}` : '/backoffice/internal-tasks')}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('default.back')}
                    </Button>
                )}
            >
                <Form form={form} onSubmit={onSubmit} className="bo-surface p-5 space-y-5">
                    <div className="space-y-2">
                        <Label>{t('internalTasks.fieldTitle', 'Título')}</Label>
                        <Input
                            name="title"
                            control={form.control}
                            required
                            placeholder={t('internalTasks.fieldTitlePlaceholder', 'Ex.: Revisar integração de pagamentos')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('internalTasks.fieldDescription', 'Descrição')}</Label>
                        <MarkdownEditor
                            name="description"
                            control={form.control}
                            placeholder={t('internalTasks.fieldDescriptionPlaceholder', 'Detalhes, checklist, links e contexto em markdown...')}
                            height={320}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>{t('internalTasks.fieldStatus', 'Status')}</Label>
                            <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as WorkStatus)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">{t('internalTasks.status.todo', 'A fazer')}</SelectItem>
                                    <SelectItem value="in_progress">{t('internalTasks.status.in_progress', 'Em progresso')}</SelectItem>
                                    <SelectItem value="done">{t('internalTasks.status.done', 'Concluída')}</SelectItem>
                                    <SelectItem value="archived">{t('internalTasks.status.archived', 'Arquivada')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('internalTasks.fieldPriority', 'Prioridade')}</Label>
                            <Select value={form.watch('priority')} onValueChange={(value) => form.setValue('priority', value as Priority)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">{t('internalTasks.priority.low', 'Baixa')}</SelectItem>
                                    <SelectItem value="medium">{t('internalTasks.priority.medium', 'Média')}</SelectItem>
                                    <SelectItem value="high">{t('internalTasks.priority.high', 'Alta')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('internalTasks.fieldAssignee', 'Responsável')}</Label>
                            <Input name="assignee" control={form.control} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('internalTasks.fieldDueDate', 'Prazo')}</Label>
                            <Input name="dueDate" type="date" control={form.control} />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
                            <Save className="h-4 w-4" />
                            {t('default.save')}
                        </Button>
                    </div>
                </Form>
            </PageShell>
        </PrivateLayout>
    );
}

export default InternalTaskFormPage;
