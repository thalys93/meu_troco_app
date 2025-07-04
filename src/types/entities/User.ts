import { AccountTypes } from "@/types/enums/AccountsTypes";

export type User = {
    uid: string;
    firstName: string;    
    lastName: string;
    displayName: string;
    fullName: string;
    email: string;    
    createdAt: Date;
    updatedAt: Date;
    photoUrl: string;    
    accountType?: AccountTypes    
}