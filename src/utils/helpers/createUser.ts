import { User } from "@/types/entities/User";
import { AccountProviders } from "@/types/enums/AccountProviders";
import { AccountTypes } from "@/types/enums/AccountsTypes";
import { SignUpForm } from "@/types/validation/signUp";
import { User as FirebaseUser } from "firebase/auth";

export function createUser(provider: AccountProviders, user: FirebaseUser, data?: SignUpForm) {
    switch (provider) {
        case AccountProviders.GOOGLE:
            return {
                uid: user.uid,
                displayName: user.displayName,
                fullName: user.displayName,
                email: user.email,
                details: {
                    firstName: "",
                    lastName: "",
                    avatar: user.photoURL,
                    provider: AccountProviders.GOOGLE,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                billing: {
                    accountType: AccountTypes.BASIC,
                    premiumAt: null,
                    selectedPlan: "",
                    customCategories: 0,
                    maxExpenses: 20,
                    maxIncomes: 20,
                    renovation: null
                }
            }
        case AccountProviders.EMAIL:
            return {
                uid: user.uid,
                displayName: data.firstName + data.lastName,
                fullName: data.firstName + data.lastName,
                email: data.email,
                details: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    avatar: user.photoURL,
                    provider: AccountProviders.EMAIL,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                billing: {
                    accountType: AccountTypes.BASIC,
                    premiumAt: null,
                    selectedPlan: data.selectedPlan,
                    customCategories: 0,
                    maxExpenses: 20,
                    maxIncomes: 20,
                    renovation: null
                }
            }
    }
}