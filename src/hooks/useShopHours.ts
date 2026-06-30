import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getShopHours,
  setShopHours,
  getClosedDates,
  addClosedDate,
  removeClosedDate,
} from "@/api/hours"
import type { ShopHoursRequest, ShopClosedDateRequest } from "@/types/hours"

export function useShopHours(shopId: string | null) {
  return useQuery({
    queryKey: ["shop-hours", shopId],
    queryFn: () => getShopHours(shopId!),
    enabled: !!shopId,
  })
}

export function useSetShopHours(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ShopHoursRequest) => setShopHours(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-hours", shopId] })
    },
  })
}

export function useClosedDates(shopId: string | null) {
  return useQuery({
    queryKey: ["closed-dates", shopId],
    queryFn: () => getClosedDates(shopId!),
    enabled: !!shopId,
  })
}

export function useAddClosedDate(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ShopClosedDateRequest) => addClosedDate(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closed-dates", shopId] })
    },
  })
}

export function useRemoveClosedDate(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (closedDateId: string) => removeClosedDate(shopId!, closedDateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closed-dates", shopId] })
    },
  })
}