import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { InternalTask } from '@/types/backoffice';
import { createBackofficeCrud } from './backoffice-crud-service';

const mapInternalTask = (doc: QueryDocumentSnapshot<DocumentData>): InternalTask => {
    const data = doc.data();
    return {
        id: doc.id,
        title: (data.title as string) ?? '',
        description: (data.description as string) ?? '',
        status: data.status ?? 'todo',
        priority: data.priority ?? 'medium',
        assignee: data.assignee,
        dueDate: data.dueDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

const crud = createBackofficeCrud<InternalTask>({
    collectionName: 'internalTasks',
    queryKey: ['internalTasks'],
    mapDoc: mapInternalTask,
});

export const getInternalTasks = crud.list;
export const getInternalTaskById = crud.getById;
export const createInternalTask = crud.create;
export const updateInternalTask = crud.update;
export const deleteInternalTask = crud.remove;
export const useGetInternalTasks = crud.useList;
export const useGetInternalTask = crud.useItem;
export const useCreateInternalTask = crud.useCreate;
export const useUpdateInternalTask = crud.useUpdate;
export const useDeleteInternalTask = crud.useDelete;
