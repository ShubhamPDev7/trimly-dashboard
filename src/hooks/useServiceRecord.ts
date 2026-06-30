import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createServiceRecordForBooking,
  createServiceRecordForWalkIn,
  getShopServiceRecords,
} from "@/api/serviceRecord"
import { recordInventoryUsage } from "@/api/inventory"
import type { ServiceRecordRequest } from "@/types/serviceRecord"
import type { InventoryUsageRequest } from "@/types/inventory"

export function useShopServiceRecords(shopId: string | null) {
  return useQuery({
    queryKey: ["service-records", shopId],
    queryFn: () => getShopServiceRecords(shopId!),
    enabled: !!shopId,
  })
}

export function useCreateServiceRecordForBooking(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: ServiceRecordRequest }) =>
      createServiceRecordForBooking(shopId!, bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-records", shopId] })
    },
  })
}

export function useCreateServiceRecordForWalkIn(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: ServiceRecordRequest }) =>
      createServiceRecordForWalkIn(shopId!, entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-records", shopId] })
    },
  })
}

export function useRecordInventoryUsage(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      serviceRecordId,
      usages,
    }: {
      serviceRecordId: string
      usages: InventoryUsageRequest[]
    }) => recordInventoryUsage(shopId!, serviceRecordId, usages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", shopId] })
    },
  })
}