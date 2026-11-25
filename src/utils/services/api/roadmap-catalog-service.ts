import {
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    writeBatch,
    type DocumentData,
    type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoadmapPhase, RoadmapPhaseLocalized, RoadmapQuarter, RoadmapYear } from '@/types/backoffice';
import { createBackofficeCrud } from './backoffice-crud-service';
import { FireStore } from './firebase';
import { formatQuarterLabel, parseQuarterLabel, sortPhases, sortQuarters, sortYears } from '@/utils/roadmap/catalog-utils';
import { phaseNamesMatch } from '@/utils/roadmap/phase-form-shared';
import { ROADMAP_DEFAULT_PHASE_NAME } from '@/utils/roadmap/roadmap-i18n';

const YEARS_KEY = ['roadmapYears'] as const;
const QUARTERS_KEY = ['roadmapQuarters'] as const;
const PHASES_KEY = ['roadmapPhases'] as const;

const mapYear = (snapshot: QueryDocumentSnapshot<DocumentData>): RoadmapYear => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        year: Number(data.year),
        status: data.status ?? 'active',
        order: typeof data.order === 'number' ? data.order : Number(data.year),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

const mapQuarter = (snapshot: QueryDocumentSnapshot<DocumentData>): RoadmapQuarter => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        yearId: data.yearId as string,
        quarter: data.quarter as 1 | 2 | 3 | 4,
        label: (data.label as string) ?? '',
        status: data.status ?? 'active',
        order: typeof data.order === 'number' ? data.order : Number(data.quarter),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

const mapPhaseLocalized = (value: unknown): RoadmapPhaseLocalized | undefined => {
    if (!value || typeof value !== 'object') return undefined;

    const raw = value as Record<string, { name?: string; description?: string }>;
    const localized: RoadmapPhaseLocalized = {};

    for (const locale of ['pt', 'en', 'es'] as const) {
        const entry = raw[locale];
        if (!entry) continue;
        localized[locale] = {
            name: entry.name ?? '',
            description: entry.description ?? '',
        };
    }

    return Object.keys(localized).length > 0 ? localized : undefined;
};

const mapPhase = (snapshot: QueryDocumentSnapshot<DocumentData>): RoadmapPhase => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        quarterId: data.quarterId as string,
        name: (data.name as string) ?? '',
        description: data.description as string | undefined,
        localized: mapPhaseLocalized(data.localized),
        isCurrent: Boolean(data.isCurrent),
        status: data.status ?? 'active',
        order: typeof data.order === 'number' ? data.order : 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

const yearsCrud = createBackofficeCrud<RoadmapYear>({
    collectionName: 'roadmapYears',
    queryKey: YEARS_KEY,
    orderField: 'order',
    mapDoc: mapYear,
});

const quartersCrud = createBackofficeCrud<RoadmapQuarter>({
    collectionName: 'roadmapQuarters',
    queryKey: QUARTERS_KEY,
    mapDoc: mapQuarter,
});

const phasesCrud = createBackofficeCrud<RoadmapPhase>({
    collectionName: 'roadmapPhases',
    queryKey: PHASES_KEY,
    mapDoc: mapPhase,
});

export const listRoadmapYears = yearsCrud.list;
export const listRoadmapQuarters = quartersCrud.list;
export const listRoadmapPhases = phasesCrud.list;

export const useGetRoadmapYears = yearsCrud.useList;
export const useGetRoadmapQuarters = quartersCrud.useList;
export const useGetRoadmapPhases = phasesCrud.useList;

async function listActiveCatalog() {
    const [years, quarters, phases] = await Promise.all([
        listRoadmapYears(),
        listRoadmapQuarters(),
        listRoadmapPhases(),
    ]);

    return {
        years: years.filter((year) => year.status === 'active').sort(sortYears),
        quarters: quarters.filter((quarter) => quarter.status === 'active').sort(sortQuarters),
        phases: phases.filter((phase) => phase.status === 'active').sort(sortPhases),
    };
}

export function useGetActiveRoadmapCatalog() {
    return useQuery({
        queryKey: [...YEARS_KEY, 'active-catalog'],
        queryFn: listActiveCatalog,
        staleTime: 60_000,
    });
}

export async function createYearWithQuarters(yearValue: number) {
    const existingYears = await listRoadmapYears();
    if (existingYears.some((year) => year.year === yearValue && year.status === 'active')) {
        throw new Error('YEAR_ALREADY_EXISTS');
    }

    const batch = writeBatch(FireStore);
    const yearRef = doc(collection(FireStore, 'roadmapYears'));
    batch.set(yearRef, {
        year: yearValue,
        status: 'active',
        order: yearValue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    for (let quarter = 1; quarter <= 4; quarter += 1) {
        const quarterRef = doc(collection(FireStore, 'roadmapQuarters'));
        batch.set(quarterRef, {
            yearId: yearRef.id,
            quarter,
            label: formatQuarterLabel(yearValue, quarter),
            status: 'active',
            order: quarter,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
    return yearRef.id;
}

function invalidateCatalogQueries(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: YEARS_KEY });
    queryClient.invalidateQueries({ queryKey: QUARTERS_KEY });
    queryClient.invalidateQueries({ queryKey: PHASES_KEY });
    queryClient.invalidateQueries({ queryKey: ['roadmapItems', 'public-tree'] });
}

function invalidateRoadmapQueries(queryClient: ReturnType<typeof useQueryClient>) {
    invalidateCatalogQueries(queryClient);
    queryClient.invalidateQueries({ queryKey: ['roadmapItems'] });
}

export function useCreateYearWithQuarters() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createYearWithQuarters,
        onSuccess: () => invalidateCatalogQueries(queryClient),
    });
}

async function archiveEntity(collectionName: string, id: string) {
    const ref = doc(FireStore, collectionName, id);
    await updateDoc(ref, { status: 'archived', updatedAt: serverTimestamp() });
}

export function useArchiveRoadmapYear() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => archiveEntity('roadmapYears', id),
        onSuccess: () => invalidateCatalogQueries(queryClient),
    });
}

export async function deleteYearPermanently(yearId: string) {
    const [quarters, phases, itemsSnapshot] = await Promise.all([
        listRoadmapQuarters(),
        listRoadmapPhases(),
        getDocs(query(collection(FireStore, 'roadmapItems'))),
    ]);

    const yearQuarterIds = quarters
        .filter((quarter) => quarter.yearId === yearId)
        .map((quarter) => quarter.id!)
        .filter(Boolean);

    const yearPhaseIds = new Set(
        phases
            .filter((phase) => yearQuarterIds.includes(phase.quarterId))
            .map((phase) => phase.id!)
            .filter(Boolean),
    );

    const linkedItemsCount = itemsSnapshot.docs.filter((itemDoc) => {
        const data = itemDoc.data();
        const phaseId = data.phaseId as string | undefined;
        const status = data.status ?? 'planned';
        return Boolean(phaseId && yearPhaseIds.has(phaseId) && status !== 'archived');
    }).length;

    if (linkedItemsCount > 0) {
        const error = new Error('YEAR_HAS_ITEMS');
        (error as Error & { itemCount: number }).itemCount = linkedItemsCount;
        throw error;
    }

    const batch = writeBatch(FireStore);
    batch.delete(doc(FireStore, 'roadmapYears', yearId));

    for (const quarterId of yearQuarterIds) {
        batch.delete(doc(FireStore, 'roadmapQuarters', quarterId));
    }

    for (const phaseId of yearPhaseIds) {
        batch.delete(doc(FireStore, 'roadmapPhases', phaseId));
    }

    await batch.commit();
}

export function useDeleteRoadmapYearPermanently() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteYearPermanently,
        onSuccess: () => invalidateRoadmapQueries(queryClient),
    });
}

export function useArchiveRoadmapQuarter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => archiveEntity('roadmapQuarters', id),
        onSuccess: () => invalidateCatalogQueries(queryClient),
    });
}

export function useArchiveRoadmapPhase() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => archiveEntity('roadmapPhases', id),
        onSuccess: () => invalidateCatalogQueries(queryClient),
    });
}

export async function setCurrentPhase(phaseId: string) {
    const phases = await listRoadmapPhases();
    const batch = writeBatch(FireStore);

    for (const phase of phases) {
        if (!phase.id) continue;
        const shouldBeCurrent = phase.id === phaseId;
        if (phase.isCurrent === shouldBeCurrent) continue;
        batch.update(doc(FireStore, 'roadmapPhases', phase.id), {
            isCurrent: shouldBeCurrent,
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
}

export function useSetCurrentPhase() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setCurrentPhase,
        onSuccess: () => invalidateCatalogQueries(queryClient),
    });
}

const baseUseCreatePhase = phasesCrud.useCreate;
const baseUseUpdatePhase = phasesCrud.useUpdate;

export function useCreateRoadmapPhase() {
    const queryClient = useQueryClient();
    const mutation = baseUseCreatePhase();
    return {
        ...mutation,
        mutate: (...args: Parameters<typeof mutation.mutate>) => {
            mutation.mutate(args[0], {
                ...args[1],
                onSuccess: (...successArgs) => {
                    invalidateCatalogQueries(queryClient);
                    args[1]?.onSuccess?.(...successArgs);
                },
            });
        },
        mutateAsync: async (...args: Parameters<typeof mutation.mutateAsync>) => {
            const result = await mutation.mutateAsync(...args);
            invalidateCatalogQueries(queryClient);
            return result;
        },
    };
}

export function useUpdateRoadmapPhase() {
    const queryClient = useQueryClient();
    const mutation = baseUseUpdatePhase();
    return {
        ...mutation,
        mutate: (...args: Parameters<typeof mutation.mutate>) => {
            mutation.mutate(args[0], {
                ...args[1],
                onSuccess: (...successArgs) => {
                    invalidateCatalogQueries(queryClient);
                    args[1]?.onSuccess?.(...successArgs);
                },
            });
        },
        mutateAsync: async (...args: Parameters<typeof mutation.mutateAsync>) => {
            const result = await mutation.mutateAsync(...args);
            invalidateCatalogQueries(queryClient);
            return result;
        },
    };
}

export async function ensurePhaseFromLegacy(quarterText: string, phaseText: string) {
    const parsed = parseQuarterLabel(quarterText);
    const years = await listRoadmapYears();
    const quarters = await listRoadmapQuarters();
    const phases = await listRoadmapPhases();

    const activeYears = years.filter((entry) => entry.status === 'active');

    let year = parsed
        ? activeYears.find((entry) => entry.year === parsed.year)
        : undefined;

    if (!year?.id) {
        const currentYear = new Date().getFullYear();
        year = activeYears.find((entry) => entry.year === currentYear);
    }

    if (!year?.id) {
        throw new Error('YEAR_NOT_FOUND');
    }

    const yearQuarters = quarters.filter(
        (quarter) => quarter.yearId === year.id && quarter.status === 'active',
    );

    let quarter = parsed
        ? yearQuarters.find((entry) => entry.quarter === parsed.quarter)
        : yearQuarters.find((entry) => entry.label === quarterText.trim());

    if (!quarter?.id) {
        throw new Error('QUARTER_NOT_FOUND');
    }

    const phaseName = phaseText.trim() || ROADMAP_DEFAULT_PHASE_NAME;
    const existingPhase = phases.find(
        (phase) => phase.quarterId === quarter.id && phaseNamesMatch(phase, phaseName) && phase.status === 'active',
    );

    if (existingPhase?.id) return existingPhase.id;

    const quarterPhases = phases.filter((phase) => phase.quarterId === quarter.id && phase.status === 'active');
    const phaseId = await phasesCrud.create({
        quarterId: quarter.id,
        name: phaseName,
        description: '',
        localized: {
            pt: { name: phaseName, description: '' },
        },
        isCurrent: false,
        status: 'active',
        order: quarterPhases.length + 1,
    });

    return phaseId;
}

export async function fetchPublicRoadmapCatalog() {
    const snapshotYears = await getDocs(query(collection(FireStore, 'roadmapYears')));
    const snapshotQuarters = await getDocs(query(collection(FireStore, 'roadmapQuarters')));
    const snapshotPhases = await getDocs(query(collection(FireStore, 'roadmapPhases')));

    return {
        years: snapshotYears.docs.map(mapYear).filter((year) => year.status === 'active').sort(sortYears),
        quarters: snapshotQuarters.docs.map(mapQuarter).filter((quarter) => quarter.status === 'active').sort(sortQuarters),
        phases: snapshotPhases.docs.map(mapPhase).filter((phase) => phase.status === 'active').sort(sortPhases),
    };
}
