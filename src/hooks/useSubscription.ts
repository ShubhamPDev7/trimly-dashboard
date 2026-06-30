import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSubscription, createSubscriptionOrder, cancelSubscription } from "@/api/subscription"
import type { SubscriptionPlan } from "@/types/subscription"

export function useSubscription(shopId: string | null) {
  return useQuery({
    queryKey: ["subscription", shopId],
    queryFn: () => getSubscription(shopId!),
    enabled: !!shopId,
  })
}

export function useCreateSubscriptionOrder(shopId: string | null) {
  return useMutation({
    mutationFn: (plan: SubscriptionPlan) => createSubscriptionOrder(shopId!, plan),
  })
}

export function useCancelSubscription(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => cancelSubscription(shopId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", shopId] })
    },
  })
}