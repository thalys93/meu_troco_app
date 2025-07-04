import { User } from "@/types/entities/User"
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
    user: User | null;
    addUser: (user: User) => void;
    removeUser: () => void;    
}

const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            addUser: (user) => set({ user }),
            removeUser: () => set({ user: null }),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export default useUserStore
