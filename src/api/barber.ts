import { apiClient } from "./client"
import type { BarberProfileResponse, BarberProfileRequest } from "@/types/barber"

export const getBarberProfile = async (
  shopId: string,
  staffUserId: string
): Promise<BarberProfileResponse> => {
  const res = await apiClient.get<BarberProfileResponse>(
    `/shops/${shopId}/staff/${staffUserId}/profile`
  )
  return res.data
}

export const upsertBarberProfile = async (
  shopId: string,
  staffUserId: string,
  data: BarberProfileRequest
): Promise<BarberProfileResponse> => {
  const res = await apiClient.put<BarberProfileResponse>(
    `/shops/${shopId}/staff/${staffUserId}/profile`,
    data
  )
  return res.data
}

export const deleteBarberProfile = async (
  shopId: string,
  staffUserId: string
): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/staff/${staffUserId}/profile`)
}