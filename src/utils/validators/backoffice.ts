import { z } from 'zod';

export const BackofficeStatusSchema = z.enum(['active', 'inactive', 'blocked']);

export const UserAdminSchema = z.object({
    accountType: z.enum(['USER', 'ADMIN']),
    status: BackofficeStatusSchema,
    selectedPlan: z.string().optional(),
});

export const RankCriterionSchema = z.object({
    id: z.string(),
    metric: z.enum([
        'transactions_count',
        'savings_total',
        'savings_streak_days',
        'budget_adherence_days',
        'wallets_count',
        'cards_count',
        'income_months',
        'goals_completed',
    ]),
    targetValue: z.number().min(0),
});

const RankLocalizedEntrySchema = z.object({
    title: z.string(),
    description: z.string(),
});

export const RankTierSchema = z.object({
    slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    localized: z.object({
        pt: RankLocalizedEntrySchema.optional(),
        en: RankLocalizedEntrySchema.optional(),
        es: RankLocalizedEntrySchema.optional(),
    }),
    level: z.number().int().min(1),
    icon: z.string().min(1),
    color: z.string().min(4),
    minPoints: z.number().min(0),
    status: z.enum(['active', 'inactive', 'archived']),
    criteria: z.array(RankCriterionSchema).min(1),
}).refine(
    (value) => {
        const ptTitle = value.localized.pt?.title?.trim();
        return Boolean(ptTitle && ptTitle.length >= 2);
    },
    { message: 'PT_TITLE_REQUIRED' },
);

export const InternalTaskSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'done', 'archived']),
    priority: z.enum(['low', 'medium', 'high']),
    assignee: z.string().optional(),
    dueDate: z.string().optional(),
});

export const RoadmapYearSchema = z.object({
    year: z.number().int().min(2000).max(2100),
    status: z.enum(['active', 'inactive', 'archived']),
    order: z.number().int().min(0),
});

export const RoadmapQuarterSchema = z.object({
    yearId: z.string().min(1),
    quarter: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    label: z.string().min(2),
    status: z.enum(['active', 'inactive', 'archived']),
    order: z.number().int().min(0),
});

const RoadmapPhaseLocalizedEntrySchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});

export const RoadmapPhaseSchema = z.object({
    quarterId: z.string().min(1),
    name: z.string().min(2),
    description: z.string().optional(),
    localized: z.object({
        pt: RoadmapPhaseLocalizedEntrySchema.optional(),
        en: RoadmapPhaseLocalizedEntrySchema.optional(),
        es: RoadmapPhaseLocalizedEntrySchema.optional(),
    }).optional(),
    isCurrent: z.boolean(),
    status: z.enum(['active', 'inactive', 'archived']),
    order: z.number().int().min(0),
}).refine(
    (value) => {
        const ptName = value.localized?.pt?.name?.trim() ?? value.name.trim();
        return ptName.length >= 2;
    },
    { message: 'PHASE_PT_NAME_REQUIRED' },
);

const RoadmapItemLocalizedEntrySchema = z.object({
    title: z.string(),
    description: z.string().optional(),
});

export const RoadmapItemSchema = z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    localized: z.object({
        pt: RoadmapItemLocalizedEntrySchema.optional(),
        en: RoadmapItemLocalizedEntrySchema.optional(),
        es: RoadmapItemLocalizedEntrySchema.optional(),
    }).optional(),
    status: z.enum(['planned', 'in_progress', 'done', 'archived']),
    priority: z.enum(['low', 'medium', 'high']),
    phaseId: z.string().min(1),
}).refine(
    (value) => {
        const ptTitle = value.localized?.pt?.title?.trim() ?? value.title.trim();
        return ptTitle.length >= 2;
    },
    { message: 'ITEM_PT_TITLE_REQUIRED' },
);

export type UserAdminForm = z.infer<typeof UserAdminSchema>;
export type RankTierForm = z.infer<typeof RankTierSchema>;
export type InternalTaskForm = z.infer<typeof InternalTaskSchema>;
export type RoadmapYearForm = z.infer<typeof RoadmapYearSchema>;
export type RoadmapQuarterForm = z.infer<typeof RoadmapQuarterSchema>;
export type RoadmapPhaseForm = z.infer<typeof RoadmapPhaseSchema>;
export type RoadmapItemForm = z.infer<typeof RoadmapItemSchema>;
