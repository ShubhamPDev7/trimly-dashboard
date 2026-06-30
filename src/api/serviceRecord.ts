import { apiClient } from "./client"
import type { ServiceRecordResponse, ServiceRecordRequest } from "@/types/serviceRecord"

export const createServiceRecordForBooking = async (
  shopId: string,
  bookingId: string,
  data: ServiceRecordRequest
): Promise<ServiceRecordResponse> => {
  const res = await apiClient.post<ServiceRecordResponse>(
    `/shops/${shopId}/bookings/${bookingId}/service-record`,
    data
  )
  return res.data
}

export const createServiceRecordForWalkIn = async (
  shopId: string,
  entryId: string,
  data: ServiceRecordRequest
): Promise<ServiceRecordResponse> => {
  const res = await apiClient.post<ServiceRecordResponse>(
    `/shops/${shopId}/walk-in-queue/${entryId}/service-record`,
    data
  )
  return res.data
}

export const getShopServiceRecords = async (shopId: string): Promise<ServiceRecordResponse[]> => {
  const res = await apiClient.get<ServiceRecordResponse[]>(`/shops/${shopId}/service-records`)
  return res.data
}