import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getReviews, getRatingSummary, replyToReview } from "@/api/reviews"
import type { OwnerReplyRequest } from "@/types/review"

export function useReviews(shopId: string | null, page: number, size = 20) {
  return useQuery({
    queryKey: ["reviews", shopId, page, size],
    queryFn: () => getReviews(shopId!, page, size),
    enabled: !!shopId,
  })
}

export function useRatingSummary(shopId: string | null) {
  return useQuery({
    queryKey: ["reviews-summary", shopId],
    queryFn: () => getRatingSummary(shopId!),
    enabled: !!shopId,
  })
}

export function useReplyToReview(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: OwnerReplyRequest }) =>
      replyToReview(shopId!, reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", shopId] })
    },
  })
}