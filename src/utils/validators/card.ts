import { z } from "zod";

export const CardSchema = z.object({
    name: z.string().min(1, "Name is required"),
    balance: z.coerce.number(), // Allow negative? Plan said maybe. But users usually enter positive magnitude.
    type: z.enum(["credit", "debit", "voucher"]),
    color: z.string(),
    flag: z.string(),
});

export type CardForm = z.infer<typeof CardSchema>;
