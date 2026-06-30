import { apiClient } from "./client"
import type {
  ReviewResponse,
  ShopRatingSummaryResponse,
  OwnerReplyRequest,
  PageResponse,
} from "@/types/review"

export const getReviews = async (
  shopId: string,
  page = 0,
  size = 20
): Promise<PageResponse<ReviewResponse>> => {
  const res = await apiClient.get<PageResponse<ReviewResponse>>(
    `/shops/${shopId}/reviews`,
    { params: { page, size } }
  )
  return res.data
}

export const getRatingSummary = async (
  shopId: string
): Promise<ShopRatingSummaryResponse> => {
  const res = await apiClient.get<ShopRatingSummaryResponse>(
    `/shops/${shopId}/reviews/summary`
  )
  return res.data
}

export const replyToReview = async (
  shopId: string,
  reviewId: string,
  data: OwnerReplyRequest
): Promise<ReviewResponse> => {
  const res = await apiClient.post<ReviewResponse>(
    `/shops/${shopId}/reviews/${reviewId}/reply`,
    data
  )
  return res.data
}