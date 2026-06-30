import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateShop } from "@/api/shop"
import type { ShopUpdateRequest } from "@/types/shop"

export function useUpdateShop(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ShopUpdateRequest) => updateShop(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-profile", shopId] })
    },
  })
}