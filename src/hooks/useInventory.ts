import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/api/inventory"
import type { InventoryRequest } from "@/types/inventory"

export function useInventory(shopId: string | null) {
  return useQuery({
    queryKey: ["inventory", shopId],
    queryFn: () => getInventory(shopId!),
    enabled: !!shopId,
  })
}

export function useCreateInventoryItem(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InventoryRequest) => createInventoryItem(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", shopId] })
    },
  })
}

export function useUpdateInventoryItem(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: InventoryRequest }) =>
      updateInventoryItem(shopId!, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", shopId] })
    },
  })
}

export function useDeleteInventoryItem(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => deleteInventoryItem(shopId!, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", shopId] })
    },
  })
}