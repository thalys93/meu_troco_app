import { create } from "zustand"
import { persist } from "zustand/middleware"

type TokenState = {
    token: string | null
    addToken: (token: string) => void
    removeToken: () => void    
}

export const useTokenStore = create<TokenState>()(
    persist(
        (set) => ({
            token: null,
            addToken: (token: string) => set({ token }),
            removeToken: () => set({ token: null }),
        }),
        {
            name: "token-storage",
        }
    )
)