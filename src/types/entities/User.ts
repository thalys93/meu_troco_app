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
}