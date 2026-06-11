import { AccountTypes } from "@/types/enums/AccountsTypes";
import { AccountProviders } from "../enums/AccountProviders";
import { FirebaseTimestamp } from "../Firebase";

export type User = {
    uid: string;
    displayName: string;
    fullName: string;
    email: string;    
    accountType?: AccountTypes;
    status?: UserStatus;
    details?: UserDetails;
    billing?: UserBilling;
}

export type UserStatus = 'active' | 'inactive' | 'blocked';

export type UserDetails = {
    createdAt: FirebaseTimestamp,
    firstName: string;
    lastName: string;
    avatar: string;
    provider: AccountProviders
    updatedAt: Date;
}

export type UserBilling = {
    accountType: AccountTypes;
    premiumAt: Date;
    selectedPlan: string;
    customCategories: number;
    maxExpenses: number;
    maxIncomes: number;
    renovation: Date
}