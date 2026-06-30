import { useQuery } from "@tanstack/react-query"
import { getShopPublicProfile } from "@/api/shop"
import { useShopStore } from "@/store/shopStore"

export function useShopProfile() {
  const shopId = useShopStore((s) => s.selectedShopId)

  return useQuery({
    queryKey: ["shop-profile", shopId],
    queryFn: () => getShopPublicProfile(shopId!),
    enabled: !!shopId,
  })
}