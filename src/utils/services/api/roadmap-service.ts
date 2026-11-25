import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { RoadmapItem, RoadmapItemLocalized, RoadmapTimelineTree } from '@/types/backoffice';
import { useQuery } from '@tanstack/react-query';
import { buildRoadmapTimelineTree } from '@/utils/roadmap/catalog-utils';
import { createBackofficeCrud } from './backoffice-crud-service';
import {
    ensurePhaseFromLegacy,
    fetchPublicRoadmapCatalog,
    listRoadmapPhases,
    listRoadmapQuarters,
    listRoadmapYears,
} from './roadmap-catalog-service';

const mapItemLocalized = (value: unknown): RoadmapItemLocalized | undefined => {
    if (!value || typeof value !== 'object') return undefined;

    const raw = value as Record<string, { title?: string; description?: string }>;
    const localized: RoadmapItemLocalized = {};

    for (const locale of ['pt', 'en', 'es'] as const) {
        const entry = raw[locale];
        if (!entry) continue;
        localized[locale] = {
            title: entry.title ?? '',
            description: entry.description ?? '',
        };
    }

    return Object.keys(localized).length > 0 ? localized : undefined;
};

const mapRoadmapItem = (doc: QueryDocumentSnapshot<DocumentData>): RoadmapItem => {
    const data = doc.data();
    return {
        id: doc.id,
        title: (data.title as string) ?? '',
        description: (data.description as string) ?? '',
        localized: mapItemLocalized(data.localized),
        status: data.status ?? 'planned',
        priority: data.priority ?? 'medium',
        phaseId: (data.phaseId as string) ?? '',
        order: typeof data.order === 'number' ? data.order : 0,
        quarter: data.quarter as string | undefined,
        phase: data.phase as string | undefined,
        isCurrentPhase: data.isCurrentPhase as boolean | undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

const crud = createBackofficeCrud<RoadmapItem>({
    collectionName: 'roadmapItems',
    queryKey: ['roadmapItems'],
    orderField: 'order',
    mapDoc: mapRoadmapItem,
});

async function migrateLegacyItem(item: RoadmapItem): Promise<RoadmapItem> {
    if (item.phaseId?.trim()) return item;
    if (!item.quarter?.trim() && !item.phase?.trim()) return item;

    try {
        const phaseId = await ensurePhaseFromLegacy(item.quarter ?? '', item.phase ?? '');
        const migrated: RoadmapItem = {
            ...item,
            phaseId,
        };

        await crud.update(migrated);
        return migrated;
    } catch {
        return item;
    }
}

async function listRoadmapItemsWithMigration(): Promise<RoadmapItem[]> {
    const items = await crud.list();
    const migrated: RoadmapItem[] = [];

    for (const item of items) {
        migrated.push(await migrateLegacyItem(item));
    }

    return migrated;
}

export const getRoadmapItems = listRoadmapItemsWithMigration;
export const getRoadmapItemById = crud.getById;
export const createRoadmapItem = crud.create;
export const updateRoadmapItem = crud.update;
export const deleteRoadmapItem = crud.remove;

export const useGetRoadmapItems = () => useQuery({
    queryKey: ['roadmapItems'],
    queryFn: listRoadmapItemsWithMigration,
    retry: false,
    staleTime: 60_000,
});

export const useGetRoadmapItemsRaw = () => useQuery({
    queryKey: ['roadmapItems', 'raw'],
    queryFn: () => crud.list(),
    staleTime: 60_000,
});

export const useGetRoadmapItem = crud.useItem;
export const useCreateRoadmapItem = crud.useCreate;
export const useUpdateRoadmapItem = crud.useUpdate;
export const useDeleteRoadmapItem = crud.useDelete;

async function getPublicRoadmapTree(lang: string): Promise<RoadmapTimelineTree> {
    const [catalog, items] = await Promise.all([
        fetchPublicRoadmapCatalog(),
        listRoadmapItemsWithMigration(),
    ]);

    return buildRoadmapTimelineTree({
        years: catalog.years,
        quarters: catalog.quarters,
        phases: catalog.phases,
        items,
        lang,
    });
}

export function useGetPublicRoadmap(lang: string) {
    return useQuery({
        queryKey: ['roadmapItems', 'public-tree', lang],
        queryFn: () => getPublicRoadmapTree(lang),
        staleTime: 60_000,
    });
}

export async function getRoadmapCatalogContext() {
    const [years, quarters, phases] = await Promise.all([
        listRoadmapYears(),
        listRoadmapQuarters(),
        listRoadmapPhases(),
    ]);

    return {
        years: years.filter((year) => year.status === 'active'),
        quarters: quarters.filter((quarter) => quarter.status === 'active'),
        phases: phases.filter((phase) => phase.status === 'active'),
    };
}
