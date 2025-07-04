import { User } from "@/types/entities/User"
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
    user: User | null;
    uid: string | null;
    setUid: (uid: string) => void;
    removeUid: () => void;
    addUser: (user: User) => void;
    removeUser: () => void;    
}

const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            addUser: (user) => set({ user }),
            removeUser: () => set({ user: null }),
            uid: null,
            setUid: (uid) => set({ uid }),
            removeUid: () => set({ uid: null }),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export default useUserStore
