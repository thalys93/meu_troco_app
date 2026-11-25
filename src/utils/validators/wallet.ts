import { z } from "zod";

export const WalletSchema = z.object({
    name: z.string().min(1, "Name is required"),
    accountName: z.string().min(1, "Account name is required"),
    balance: z.coerce.number(),
    initialBalance: z.coerce.number().optional(),
    creditLimit: z.coerce.number().optional(),
    billingClosingDay: z.coerce.number().min(1).max(28).optional(),
    reloadAmount: z.coerce.number().optional(),
    reloadDay: z.coerce.number().min(1).max(28).optional(),
    type: z.enum(["credit", "debit", "voucher"]),
    color: z.string(),
    flag: z.string(),
});

export type WalletForm = z.infer<typeof WalletSchema>;
