import { z } from "zod";

export const WalletSchema = z.object({
    name: z.string().min(1, "Name is required"),
    accountName: z.string().min(1, "Account name is required"),
    balance: z.coerce.number(),
    type: z.enum(["credit", "debit", "voucher"]),
    color: z.string(),
    flag: z.string(),
});

export type WalletForm = z.infer<typeof WalletSchema>;
