import { FirebaseTimestamp } from "@/types/Firebase";

export type WalletType = "credit" | "debit" | "voucher";

export interface Wallet {
    id: string;
    userId: string;
    name: string;
    accountName: string;
    balance: number;
    initialBalance?: number;
    creditLimit?: number;
    billingClosingDay?: number;
    reloadAmount?: number;
    reloadDay?: number;
    type: WalletType;
    color: string;
    flag: string;
    order?: number;
    legacyCardId?: string;
    createdAt?: FirebaseTimestamp | Date;
    updatedAt?: FirebaseTimestamp | Date;
}
