import { apiClient } from "./client"
import type { WalkInQueueEntryResponse, WalkInJoinRequest, WalkInStartRequest } from "@/types/walkin"

export const joinQueue = async (
  shopId: string,
  data: WalkInJoinRequest
): Promise<WalkInQueueEntryResponse> => {
  const res = await apiClient.post<WalkInQueueEntryResponse>(`/shops/${shopId}/walk-in-queue`, data)
  return res.data
}

export const listQueue = async (shopId: string): Promise<WalkInQueueEntryResponse[]> => {
  const res = await apiClient.get<WalkInQueueEntryResponse[]>(`/shops/${shopId}/walk-in-queue`)
  return res.data
}

export const startQueueEntry = async (
  shopId: string,
  entryId: string,
  data: WalkInStartRequest
): Promise<WalkInQueueEntryResponse> => {
  const res = await apiClient.patch<WalkInQueueEntryResponse>(
    `/shops/${shopId}/walk-in-queue/${entryId}/start`,
    data
  )
  return res.data
}

export const completeQueueEntry = async (
  shopId: string,
  entryId: string
): Promise<WalkInQueueEntryResponse> => {
  const res = await apiClient.patch<WalkInQueueEntryResponse>(
    `/shops/${shopId}/walk-in-queue/${entryId}/complete`
  )
  return res.data
}

export const cancelQueueEntry = async (
  shopId: string,
  entryId: string
): Promise<WalkInQueueEntryResponse> => {
  const res = await apiClient.patch<WalkInQueueEntryResponse>(
    `/shops/${shopId}/walk-in-queue/${entryId}/cancel`
  )
  return res.data
}

export const markNoShow = async (
  shopId: string,
  entryId: string
): Promise<WalkInQueueEntryResponse> => {
  const res = await apiClient.patch<WalkInQueueEntryResponse>(
    `/shops/${shopId}/walk-in-queue/${entryId}/no-show`
  )
  return res.data
}