import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  joinQueue,
  listQueue,
  startQueueEntry,
  completeQueueEntry,
  cancelQueueEntry,
  markNoShow,
} from "@/api/walkin"
import type { WalkInJoinRequest, WalkInStartRequest } from "@/types/walkin"

export function useQueueList(shopId: string | null) {
  return useQuery({
    queryKey: ["walk-in-queue", shopId],
    queryFn: () => listQueue(shopId!),
    enabled: !!shopId,
    refetchInterval: 15000, // poll every 15s as a fallback to SSE
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