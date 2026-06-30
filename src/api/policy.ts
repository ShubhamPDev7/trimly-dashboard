import { apiClient } from "./client"
import type { CancellationPolicyRequest, CancellationPolicyResponse } from "@/types/policy"

export const getCancellationPolicy = async (
  shopId: string
): Promise<CancellationPolicyResponse | null> => {
  const res = await apiClient.get<CancellationPolicyResponse>(
    `/shops/${shopId}/cancellation-policy`
  )
  if (res.status === 204 || !res.data) return null
  return res.data
}

export const upsertCancellationPolicy = async (
  shopId: string,
  data: CancellationPolicyRequest
): Promise<CancellationPolicyResponse> => {
  const res = await apiClient.put<CancellationPolicyResponse>(
    `/shops/${shopId}/cancellation-policy`,
    data
  )
  return res.data
}

export const deleteCancellationPolicy = async (shopId: string): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/cancellation-policy`)
}