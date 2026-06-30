import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getShopStaff, addStaff, removeStaff } from "@/api/shop"

export function useStaffList(shopId: string | null) {
  return useQuery({
    queryKey: ["staff", shopId],
    queryFn: () => getShopStaff(shopId!),
    enabled: !!shopId,
  })
}

export function useAddStaff(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; roleInShop: "OWNER" | "STAFF" }) =>
      addStaff(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", shopId] })
    },
  })
}

export function useRemoveStaff(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (staffUserId: string) => removeStaff(shopId!, staffUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", shopId] })
    },
  })
}