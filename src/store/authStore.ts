import { create } from "zustand"
import { persist } from "zustand/middleware"
import { decodeShopIds } from "@/lib/jwt"

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
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          shopIds: decodeShopIds(data.accessToken),
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          name: null,
          email: null,
          role: null,
          shopIds: [],
          isAuthenticated: false,
        }),
    }),
    {
      name: "trimly-auth",
    }
  )
)