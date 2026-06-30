import { apiClient } from "./client"
import type { StaffLeaveResponse, StaffLeaveRequest } from "@/types/leave"

export const getStaffLeaves = async (
  shopId: string,
  staffUserId: string
): Promise<StaffLeaveResponse[]> => {
  const res = await apiClient.get<StaffLeaveResponse[]>(
    `/shops/${shopId}/staff/${staffUserId}/leaves`
  )
  return res.data
}

export const markStaffLeave = async (
  shopId: string,
  staffUserId: string,
  data: StaffLeaveRequest
): Promise<StaffLeaveResponse> => {
  const res = await apiClient.post<StaffLeaveResponse>(
    `/shops/${shopId}/staff/${staffUserId}/leaves`,
    data
  )
  return res.data
}

export const cancelStaffLeave = async (
  shopId: string,
  staffUserId: string,
  leaveDate: string
): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/staff/${staffUserId}/leaves/${leaveDate}`)
}