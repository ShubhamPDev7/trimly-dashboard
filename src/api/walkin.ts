import { apiClient } from "./client"
import type { WalkInQueueEntryResponse, WalkInJoinRequest, WalkInStartRequest } from "@/types/walkin"
import type { BillRequest, BillResponse } from "@/types/bill"

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

export const getQueueHistory = async (
  shopId: string,
  page = 0,
  size = 20
): Promise<{
  content: WalkInQueueEntryResponse[]
  totalElements: number
  totalPages: number
  number: number
  first: boolean
  last: boolean
}> => {
  const res = await apiClient.get(`/shops/${shopId}/walk-in-queue/history`, {
    params: { page, size },
  })
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

export const createWalkInBill = async (
  shopId: string,
  entryId: string,
  data: BillRequest
): Promise<BillResponse> => {
  const res = await apiClient.post<BillResponse>(
    `/shops/${shopId}/walk-in-queue/${entryId}/bill`,
    data
  )
  return res.data
}