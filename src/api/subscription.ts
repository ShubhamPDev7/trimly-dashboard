import { apiClient } from "./client"
import type {
  SubscriptionResponse,
  SubscriptionOrderResponse,
  SubscriptionPlan,
} from "@/types/subscription"

export const getSubscription = async (shopId: string): Promise<SubscriptionResponse> => {
  const res = await apiClient.get<SubscriptionResponse>(`/shops/${shopId}/subscription`)
  return res.data
}

export const createSubscriptionOrder = async (
  shopId: string,
  plan: SubscriptionPlan
): Promise<SubscriptionOrderResponse> => {
  const res = await apiClient.post<SubscriptionOrderResponse>(
    `/shops/${shopId}/subscription/pay`,
    null,
    { params: { plan } }
  )
  return res.data
}

export const cancelSubscription = async (shopId: string): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/subscription`)
}