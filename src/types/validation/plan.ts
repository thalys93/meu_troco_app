import { z } from "zod";
export const PlanSchema = z.object({
    title: z.string(),
    price: z.string(),
    period: z.string(),
    features: z.array(z.string()),
    isPopular: z.boolean(),
    status: z.enum(['active', 'archived']).optional()
})

export type PlanForm = z.infer<typeof PlanSchema>