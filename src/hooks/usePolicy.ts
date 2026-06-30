import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCancellationPolicy,
  upsertCancellationPolicy,
  deleteCancellationPolicy,
} from "@/api/policy"
import type { CancellationPolicyRequest } from "@/types/policy"

export function useCancellationPolicy(shopId: string | null) {
  return useQuery({
    queryKey: ["cancellation-policy", shopId],
    queryFn: () => getCancellationPolicy(shopId!),
    enabled: !!shopId,
  })
}

export function useUpsertCancellationPolicy(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CancellationPolicyRequest) => upsertCancellationPolicy(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancellation-policy", shopId] })
    },
  })
}

export function useDeleteCancellationPolicy(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteCancellationPolicy(shopId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancellation-policy", shopId] })
    },
  })
}