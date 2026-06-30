import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  joinQueue,
  listQueue,
  getQueueHistory,
  startQueueEntry,
  completeQueueEntry,
  cancelQueueEntry,
  markNoShow,
  createWalkInBill,
} from "@/api/walkin"
import type { WalkInJoinRequest, WalkInStartRequest } from "@/types/walkin"
import type { BillRequest } from "@/types/bill"

export function useQueueList(shopId: string | null) {
  return useQuery({
    queryKey: ["walk-in-queue", shopId],
    queryFn: () => listQueue(shopId!),
    enabled: !!shopId,
    refetchInterval: 15000, // poll every 15s as a fallback to SSE
  })
}

export function useQueueHistory(shopId: string | null, page = 0, size = 20) {
  return useQuery({
    queryKey: ["walk-in-queue-history", shopId, page, size],
    queryFn: () => getQueueHistory(shopId!, page, size),
    enabled: !!shopId,
  })
}

export function useJoinQueue(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WalkInJoinRequest) => joinQueue(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk-in-queue", shopId] })
    },
  })
}

export function useStartQueueEntry(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: WalkInStartRequest }) =>
      startQueueEntry(shopId!, entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk-in-queue", shopId] })
    },
  })
}

export function useCompleteQueueEntry(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) => completeQueueEntry(shopId!, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk-in-queue", shopId] })
    },
  })
}

export function useCancelQueueEntry(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) => cancelQueueEntry(shopId!, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk-in-queue", shopId] })
    },
  })
}

export function useMarkNoShow(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) => markNoShow(shopId!, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk-in-queue", shopId] })
    },
  })
}

export function useCreateWalkInBill(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: BillRequest }) =>
      createWalkInBill(shopId!, entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk-in-queue", shopId] })
      queryClient.invalidateQueries({ queryKey: ["walk-in-queue-history", shopId] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary", shopId] })
    },
  })
}