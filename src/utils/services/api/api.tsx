
import useUserStore from "@/store/UserStore";
import axios from "axios";
import { whitelist } from "../../helpers/authGuard";
import { collection, getDocs } from "firebase/firestore";
import { FireStore } from "./firebase";
import { useQuery } from "@tanstack/react-query";

export const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/v0"
})

export const getAllUsers = async (uid: string) => {
    if (!whitelist.includes(uid)) {
        throw new Error("You don't have permission to access this resource");
    }
    
    const snapshot = await getDocs(collection(FireStore, "users"))
    const users = snapshot.docs.map((doc) => doc.data())

    const groupedByAccountType = users.reduce((acc, user) => {
        const type = user.accountType || "undefined";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        users,
        groupedByAccountType,
    };
}

export const useGetAllUsers = () => {
    const { user } = useUserStore();
    return useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(user.uid),
        retry: false,
    });
};

/** Estatísticas agregadas para o backoffice. Despesas/receitas/cartões exigem backend com Admin SDK (Firestore não permite leitura cross-user no client). */
export interface BackofficeStats {
    users: number;
    expenses: number;
    income: number;
    cards: number;
}

const fetchBackofficeStatsFromApi = async (): Promise<Partial<BackofficeStats>> => {
    try {
        const { data } = await api.get<BackofficeStats>("/backoffice/stats");
        return data ?? {};
    } catch {
        return {};
    }
};

export const useBackofficeStats = (): {
    data: BackofficeStats;
    isLoading: boolean;
    isError: boolean;
} => {
    const { user } = useUserStore();
    const { data: usersData, isLoading: usersLoading, isError: usersError } = useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(user.uid),
        retry: false,
    });
    const { data: apiStats, isLoading: apiLoading } = useQuery({
        queryKey: ["backoffice-stats"],
        queryFn: fetchBackofficeStatsFromApi,
        retry: false,
    });

    const users = usersData?.users?.length ?? 0;
    const data: BackofficeStats = {
        users,
        expenses: apiStats?.expenses ?? 0,
        income: apiStats?.income ?? 0,
        cards: apiStats?.cards ?? 0,
    };

    return {
        data,
        isLoading: usersLoading || apiLoading,
        isError: usersError,
    };
};