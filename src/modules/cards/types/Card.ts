import { FirebaseTimestamp } from "@/types/Firebase";

export type CardType = 'credit' | 'debit' | 'voucher';

export interface Card {
    id: string;
    userId: string;
    name: string;
    balance: number;
    type: CardType;
    color: string;
    flag: string;
    createdAt?: FirebaseTimestamp | Date;
    updatedAt?: FirebaseTimestamp | Date;
}
