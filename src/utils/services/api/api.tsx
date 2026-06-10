
import useUserStore from "@/store/UserStore";
import { User } from "@/types/entities/User";
import { AccountTypes } from "@/types/enums/AccountsTypes";
import axios from "axios";
import {
  BackofficeUsersError,
  canListAllUsers,
} from "../../helpers/authGuard";
import { collection, getDocs } from "firebase/firestore";
import { FireStore } from "./firebase";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPlatformStats,
  type BackofficePlatformStats,
} from "./backoffice-stats-service";

export const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/v0"
})

export type BackofficeStats = BackofficePlatformStats;

export const getAllUsers = async (
  uid: string,
  accountType?: AccountTypes
) => {
    if (!canListAllUsers(uid, accountType)) {
        throw new Error(BackofficeUsersError.FORBIDDEN);
    }

    try {
        const snapshot = await getDocs(collection(FireStore, "users"));
        const users = snapshot.docs.map((docSnap) => ({
            ...(docSnap.data() as User),
            uid: docSnap.id,
        }));

        const groupedByAccountType = users.reduce((acc, user) => {
            const type = user.accountType || "undefined";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            users,
            groupedByAccountType,
        };
    } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === 'permission-denied') {
            throw new Error(BackofficeUsersError.FIRESTORE_DENIED);
        }
        throw error;
    }
}

export const useGetAllUsers = () => {
    const { user, uid } = useUserStore();
    const resolvedUid = uid ?? user?.uid ?? null;
    const accountType = user?.accountType;

    return useQuery({
        queryKey: ["users", resolvedUid],
        queryFn: () => getAllUsers(resolvedUid!, accountType),
        enabled: canListAllUsers(resolvedUid, accountType),
        retry: false,
    });
};

export const useBackofficeStats = (): {
    data: BackofficeStats;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
} => {
    const { user, uid } = useUserStore();
    const resolvedUid = uid ?? user?.uid ?? null;
    const accountType = user?.accountType;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["backoffice-platform-stats", resolvedUid],
        queryFn: () => fetchPlatformStats(resolvedUid!, accountType),
        enabled: canListAllUsers(resolvedUid, accountType),
        retry: false,
    });

    return {
        data: data ?? {
            users: 0,
            expenses: 0,
            income: 0,
            bills: 0,
            wallets: 0,
        },
        isLoading,
        isError,
        error,
    };
};
