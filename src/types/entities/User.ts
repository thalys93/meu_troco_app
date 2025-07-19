/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountTypes } from "@/types/enums/AccountsTypes";
import { AccountProviders } from "../enums/AccountProviders";

export type User = {
    uid: string;
    firstName: string;
    lastName: string;
    displayName: string;
    fullName: string;
    email: string;
    createdAt: Date | any;
    updatedAt: Date;
    photoUrl: string;
    accountType?: AccountTypes
    provider?: AccountProviders
    premiumDetails?: PremiumDetails
}

export type PremiumDetails = {    
    userPlan?: string
    userLimits?: UserLimits
    premiumSince?: Date
    renewalDate?: Date
}

export type UserLimits = {
    incomes: number;
    expenses: number;
}