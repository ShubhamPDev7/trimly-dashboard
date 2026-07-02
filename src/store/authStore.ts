import { create } from "zustand"
import { persist } from "zustand/middleware"
import { decodeShopIds } from "@/lib/jwt"
import { useShopStore } from "@/store/shopStore"

export type UserRole = "OWNER" | "STAFF" | "CUSTOMER"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  name: string | null
  email: string | null
  role: UserRole | null
  shopIds: string[]
  isAuthenticated: boolean
  setAuth: (data: {
    accessToken: string
    refreshToken: string
    userId: string
    name: string
    email: string
    role: string
  }) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      name: null,
      email: null,
      role: null,
      shopIds: [],
      isAuthenticated: false,
      setAuth: (data) => {
        const newShopIds = decodeShopIds(data.accessToken)
        const currentSelected = useShopStore.getState().selectedShopId
        if (currentSelected && !newShopIds.includes(currentSelected)) {
          useShopStore.getState().clearShop()
        }
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          shopIds: newShopIds,
          isAuthenticated: true,
        })
      },
      clearAuth: () => {
        useShopStore.getState().clearShop()
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          name: null,
          email: null,
          role: null,
          shopIds: [],
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "trimly-auth",
    }
  )
)