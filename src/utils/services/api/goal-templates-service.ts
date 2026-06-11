import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import {
    addDoc,
    collection,
    serverTimestamp,
} from 'firebase/firestore';
import type { RankCriterion, RankLocalized, RankLocale, RankTier } from '@/types/backoffice';
import { RANK_SUPPORTED_LOCALES } from '@/types/backoffice';
import { DEFAULT_RANKS_SEED, type DefaultRankSeed } from '@/constants/default-ranks-seed';
import { createBackofficeCrud } from './backoffice-crud-service';
import { FireStore } from './firebase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const DEFAULT_RANK_COLOR = '#6366f1';
const DEFAULT_RANK_ICON = 'Shield';

const parseCriteria = (raw: unknown): RankCriterion[] => {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry, index) => {
            const item = entry as Record<string, unknown>;
            return {
                id: typeof item.id === 'string' ? item.id : `criterion-${index}`,
                metric: (item.metric as RankCriterion['metric']) ?? 'transactions_count',
                targetValue: typeof item.targetValue === 'number' ? item.targetValue : 0,
            };
        });
};

const parseLocalizedEntry = (raw: unknown): RankLocalized[RankLocale] | undefined => {
    if (!raw || typeof raw !== 'object') return undefined;
    const entry = raw as Record<string, unknown>;
    const title = typeof entry.title === 'string' ? entry.title : '';
    const description = typeof entry.description === 'string' ? entry.description : '';
    if (!title && !description) return undefined;
    return { title, description };
};

const parseLocalized = (data: Record<string, unknown>): RankLocalized => {
    const raw = data.localized;
    if (raw && typeof raw === 'object') {
        const localized: RankLocalized = {};
        for (const locale of RANK_SUPPORTED_LOCALES) {
            const entry = parseLocalizedEntry((raw as Record<string, unknown>)[locale]);
            if (entry) localized[locale] = entry;
        }
        if (Object.keys(localized).length > 0) return localized;
    }

    const legacyTitle = typeof data.title === 'string' ? data.title : '';
    const legacyDescription = typeof data.description === 'string' ? data.description : '';
    if (legacyTitle || legacyDescription) {
        return {
            pt: { title: legacyTitle, description: legacyDescription },
        };
    }

    return {
        pt: { title: '', description: '' },
        en: { title: '', description: '' },
        es: { title: '', description: '' },
    };
};

const mapRankTier = (doc: QueryDocumentSnapshot<DocumentData>): RankTier => {
    const data = doc.data();
    const legacyLevel = typeof data.order === 'number' ? data.order : 1;

    return {
        id: doc.id,
        slug: typeof data.slug === 'string' ? data.slug : doc.id,
        localized: parseLocalized(data),
        level: typeof data.level === 'number' ? data.level : legacyLevel,
        icon: typeof data.icon === 'string' ? data.icon : DEFAULT_RANK_ICON,
        color: typeof data.color === 'string' ? data.color : DEFAULT_RANK_COLOR,
        minPoints: typeof data.minPoints === 'number' ? data.minPoints : 0,
        criteria: parseCriteria(data.criteria),
        status: data.status ?? 'active',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

const crud = createBackofficeCrud<RankTier>({
    collectionName: 'goalTemplates',
    queryKey: ['goalTemplates'],
    orderField: 'level',
    mapDoc: mapRankTier,
});

export const getRankTiers = crud.list;
export const getRankTierById = crud.getById;
export const createRankTier = crud.create;
export const updateRankTier = crud.update;
export const deleteRankTier = crud.remove;
export const useGetRankTiers = crud.useList;
export const useGetRankTier = crud.useItem;
export const useCreateRankTier = crud.useCreate;
export const useUpdateRankTier = crud.useUpdate;
export const useDeleteRankTier = crud.useDelete;

export const getGoalTemplates = getRankTiers;
export const getGoalTemplateById = getRankTierById;
export const createGoalTemplate = createRankTier;
export const updateGoalTemplate = updateRankTier;
export const deleteGoalTemplate = deleteRankTier;
export const useGetGoalTemplates = useGetRankTiers;
export const useGetGoalTemplate = useGetRankTier;
export const useCreateGoalTemplate = useCreateRankTier;
export const useUpdateGoalTemplate = useUpdateRankTier;
export const useDeleteGoalTemplate = useDeleteRankTier;

const RANKS_COLLECTION = 'goalTemplates';

export function getMissingDefaultRankSeeds(tiers: RankTier[]): DefaultRankSeed[] {
    const existingSlugs = new Set(tiers.map((tier) => tier.slug));
    return DEFAULT_RANKS_SEED.filter((seed) => !existingSlugs.has(seed.slug));
}

export function countMissingDefaultRanks(tiers: RankTier[]): number {
    return getMissingDefaultRankSeeds(tiers).length;
}

async function insertSeedRank(seed: DefaultRankSeed): Promise<void> {
    const criteria: RankCriterion[] = seed.criteria.map((criterion, index) => ({
        id: `${seed.slug}-${criterion.metric}-${index}`,
        metric: criterion.metric,
        targetValue: criterion.targetValue,
    }));

    const localized: RankLocalized = {
        pt: seed.localized.pt,
        en: seed.localized.en,
        es: seed.localized.es,
    };

    await addDoc(collection(FireStore, RANKS_COLLECTION), {
        slug: seed.slug,
        localized,
        level: seed.level,
        icon: seed.icon,
        color: seed.color,
        minPoints: seed.minPoints,
        criteria,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export const seedDefaultRanks = async (): Promise<number> => {
    const existing = await getRankTiers();
    const missing = getMissingDefaultRankSeeds(existing);

    for (const seed of missing) {
        await insertSeedRank(seed);
    }

    return missing.length;
};

export const useSeedDefaultRanks = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: seedDefaultRanks,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalTemplates'] }),
        retry: false,
    });
};
