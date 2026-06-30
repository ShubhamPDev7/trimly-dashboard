import { apiClient } from "./client"
import type { StaffShiftResponse, StaffShiftRequest } from "@/types/shift"

export const getStaffSchedule = async (
  shopId: string,
  staffUserId: string
): Promise<StaffShiftResponse[]> => {
  const res = await apiClient.get<StaffShiftResponse[]>(
    `/shops/${shopId}/staff/${staffUserId}/shifts`
  )
  return res.data
}

export const upsertShift = async (
  shopId: string,
  staffUserId: string,
  data: StaffShiftRequest
): Promise<StaffShiftResponse> => {
  const res = await apiClient.put<StaffShiftResponse>(
    `/shops/${shopId}/staff/${staffUserId}/shifts`,
    data
  )
  return res.data
}

export const deleteShift = async (
  shopId: string,
  staffUserId: string,
  dayOfWeek: number
): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/staff/${staffUserId}/shifts/${dayOfWeek}`)
}