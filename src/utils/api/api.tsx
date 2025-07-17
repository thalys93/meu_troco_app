
import useUserStore from "@/store/UserStore";
import axios from "axios";
import { whitelist } from "../helpers/authGuard";
import { collection, getDocs } from "firebase/firestore";
import { FireStore } from "./firebase";
import { useQuery } from "@tanstack/react-query";

export const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/v0"
})

export const getAllUsers = async (uid: string) => {    
    if (uid !== whitelist[0]) {
        throw new Error("You don't have permission to access this resource")
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
    const { user } = useUserStore()    
    return useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(user.uid),
        retry: false,              
    })
}