import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ShopState {
  selectedShopId: string | null
  setSelectedShopId: (id: string) => void
  clearShop: () => void
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      selectedShopId: null,
      setSelectedShopId: (id) => set({ selectedShopId: id }),
      clearShop: () => set({ selectedShopId: null }),
    }),
    {
      name: "trimly-shop",
    }
  )
)