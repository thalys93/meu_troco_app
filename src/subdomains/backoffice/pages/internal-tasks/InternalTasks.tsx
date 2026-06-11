import React from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { InternalTask, Priority } from '@/types/backoffice';
import {
    boardColumns,
    columnAccent,
    isOverdue,
    priorityAccent,
    stripMarkdownPreview,
    type BoardColumnStatus,
} from '@/subdomains/backoffice/pages/internal-tasks/task-shared';
import {
    useDeleteInternalTask,
    useGetInternalTasks,
    useUpdateInternalTask,
} from '@/utils/services/api/internal-tasks-service';
import { cn } from '@/lib/utils';
import { Calendar, Edit, GripVertical, Plus, Trash2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type AnyFilter<T extends string> = 'all' | T;

function TaskCardContent({
    task,
    onView,
    onEdit,
    onDelete,
    dragHandleProps,
    className,
}: {
    task: InternalTask;
    onView?: (task: InternalTask) => void;
    onEdit?: (task: InternalTask) => void;
    onDelete?: (task: InternalTask) => void;
    dragHandleProps?: React.ComponentProps<'button'>;
    className?: string;
}) {
    const { t } = useTranslation();
    const overdue = isOverdue(task.dueDate);
    const preview = task.description ? stripMarkdownPreview(task.description) : '';

    return (
        <article
            className={cn(
                'rounded-xl border border-border/70 border-l-[3px] bg-card p-4 shadow-sm space-y-3',
                priorityAccent[task.priority],
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <button
                    type="button"
                    className="mt-0.5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
                    {...dragHandleProps}
                >
                    <GripVertical className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                    {onView ? (
                        <button
                            type="button"
                            className="font-semibold leading-tight text-left hover:text-primary transition-colors"
                            onClick={() => onView(task)}
                        >
                            {task.title}
                        </button>
                    ) : (
                        <h3 className="font-semibold leading-tight">{task.title}</h3>
                    )}
                    {preview && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{preview}</p>
                    )}
                </div>
                {onEdit && onDelete && (
                    <div className="flex gap-0.5 shrink-0">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(task)}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Badge
                    variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-[11px] font-medium"
                >
                    {t(`internalTasks.priority.${task.priority}`, task.priority)}
                </Badge>
                {task.assignee && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {task.assignee}
                    </span>
                )}
                {task.dueDate && (
                    <span className={cn('inline-flex items-center gap-1 text-xs', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                    </span>
                )}
            </div>
        </article>
    );
}

function TaskCard({
    task,
    onView,
    onEdit,
    onDelete,
}: {
    task: InternalTask;
    onView: (task: InternalTask) => void;
    onEdit: (task: InternalTask) => void;
    onDelete: (task: InternalTask) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id ?? task.title,
        data: { status: task.status },
    });

    return (
        <div
            ref={setNodeRef}
            style={isDragging ? undefined : { transform: CSS.Translate.toString(transform) }}
            className={cn('relative transition-shadow hover:shadow-md', isDragging && 'opacity-40')}
        >
            <TaskCardContent
                task={task}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                dragHandleProps={{ ...listeners, ...attributes }}
            />
        </div>
    );
}

function TaskColumn({
    status,
    items,
    onView,
    onEdit,
    onDelete,
}: {
    status: BoardColumnStatus;
    items: InternalTask[];
    onView: (task: InternalTask) => void;
    onEdit: (task: InternalTask) => void;
    onDelete: (task: InternalTask) => void;
}) {
    const { t } = useTranslation();
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <section
            ref={setNodeRef}
            className={cn(
                'bo-surface border-t-[3px] p-4 min-h-[420px] flex flex-col gap-3 transition-all',
                columnAccent[status],
                isOver && 'ring-2 ring-primary/40 bg-primary/[0.02]',
            )}
        >
            <div className="flex items-center justify-between pb-1">
                <h2 className="font-semibold text-sm uppercase tracking-wide">{t(`internalTasks.status.${status}`, status)}</h2>
                <Badge variant="outline" className="tabular-nums">{items.length}</Badge>
            </div>
            <div className="flex flex-col gap-3 flex-1">
                {items.map((task) => (
                    <TaskCard key={task.id} task={task} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                ))}
                {items.length === 0 && (
                    <div className="flex-1 rounded-lg border border-dashed border-border/60 flex items-center justify-center min-h-[120px]">
                        <p className="text-xs text-muted-foreground">{t('internalTasks.columnEmpty', 'Arraste tarefas para cá')}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

function InternalTasksPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: tasks = [], isLoading } = useGetInternalTasks();
    const updateTask = useUpdateInternalTask();
    const deleteTask = useDeleteInternalTask();
    const [priorityFilter, setPriorityFilter] = React.useState<AnyFilter<Priority>>('all');
    const [assigneeFilter, setAssigneeFilter] = React.useState('');
    const [activeTask, setActiveTask] = React.useState<InternalTask | null>(null);

    const filteredTasks = React.useMemo(() => {
        return tasks.filter((task) => {
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesAssignee = !assigneeFilter.trim() || (task.assignee ?? '').toLowerCase().includes(assigneeFilter.toLowerCase());
            return matchesPriority && matchesAssignee;
        });
    }, [assigneeFilter, priorityFilter, tasks]);

    const boardTasks = React.useMemo(
        () => filteredTasks.filter((task) => task.status !== 'archived'),
        [filteredTasks],
    );

    const archivedTasks = React.useMemo(
        () => filteredTasks.filter((task) => task.status === 'archived'),
        [filteredTasks],
    );

    const handleView = (task: InternalTask) => {
        if (!task.id) return;
        navigate(`/backoffice/internal-task/${task.id}`);
    };

    const handleEdit = (task: InternalTask) => {
        if (!task.id) return;
        navigate(`/backoffice/internal-task/${task.id}/edit`);
    };

    const handleDelete = (task: InternalTask) => {
        if (!task.id) return;
        deleteTask.mutate(task.id, {
            onSuccess: () => toast({ title: t('toast.success'), description: t('internalTasks.deleted', 'Tarefa removida com sucesso.') }),
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find((current) => current.id === event.active.id);
        setActiveTask(task ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const overStatus = event.over?.id as BoardColumnStatus | undefined;
        const taskId = event.active.id as string;
        if (!overStatus || !boardColumns.includes(overStatus)) return;
        const task = tasks.find((current) => current.id === taskId);
        if (!task || task.status === overStatus) return;
        updateTask.mutate({ ...task, status: overStatus });
    };

    return (
        <PrivateLayout>
            <PageShell
                title={t('internalTasks.title', 'Tarefas Internas')}
                description={t('internalTasks.description', 'Organize o trabalho operacional da equipe sem misturar com o roadmap público.')}
                eyebrow={t('sidebar.backoffice')}
                actions={(
                    <Button size="sm" onClick={() => navigate('/backoffice/internal-task/new')}>
                        <Plus className="h-4 w-4" />
                        {t('internalTasks.newTitle', 'Nova tarefa')}
                    </Button>
                )}
            >
                <div className="space-y-6">
                    <div className="bo-surface p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as AnyFilter<Priority>)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('internalTasks.filters.allPriority', 'Todas as prioridades')}</SelectItem>
                                <SelectItem value="low">{t('internalTasks.priority.low', 'Baixa')}</SelectItem>
                                <SelectItem value="medium">{t('internalTasks.priority.medium', 'Média')}</SelectItem>
                                <SelectItem value="high">{t('internalTasks.priority.high', 'Alta')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            name="assigneeFilter"
                            value={assigneeFilter}
                            onChange={(event) => setAssigneeFilter(event.target.value)}
                            placeholder={t('internalTasks.filters.assignee', 'Responsável')}
                        />
                    </div>

                    {isLoading && <div className="bo-surface h-64 animate-pulse" />}

                    {!isLoading && boardTasks.length === 0 && archivedTasks.length === 0 && (
                        <div className="bo-surface p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <p className="text-sm">{t('internalTasks.empty', 'Nenhuma tarefa encontrada.')}</p>
                            <Button variant="outline" onClick={() => navigate('/backoffice/internal-task/new')}>
                                <Plus className="h-4 w-4" />
                                {t('internalTasks.newTitle', 'Nova tarefa')}
                            </Button>
                        </div>
                    )}

                    {!isLoading && (boardTasks.length > 0 || archivedTasks.length > 0) && (
                        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveTask(null)}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 isolate">
                                    {boardColumns.map((status) => (
                                        <TaskColumn
                                            key={status}
                                            status={status}
                                            items={boardTasks.filter((task) => task.status === status)}
                                            onView={handleView}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>

                                {archivedTasks.length > 0 && (
                                    <section className="bo-surface p-4 space-y-3 opacity-80">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                                {t('internalTasks.status.archived', 'Arquivada')}
                                            </h2>
                                            <Badge variant="outline" className="tabular-nums">{archivedTasks.length}</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {archivedTasks.map((task) => (
                                                <TaskCard key={task.id} task={task} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <DragOverlay dropAnimation={null} className="z-[100]">
                                {activeTask ? (
                                    <TaskCardContent
                                        task={activeTask}
                                        className="shadow-2xl ring-2 ring-primary/40 rotate-1 cursor-grabbing"
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>
            </PageShell>
        </PrivateLayout>
    );
}

export default InternalTasksPage;
