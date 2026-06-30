import { apiClient } from "./client"
import type {
  ShopHoursResponse,
  ShopHoursRequest,
  ShopClosedDateResponse,
  ShopClosedDateRequest,
} from "@/types/hours"

export const getShopHours = async (shopId: string): Promise<ShopHoursResponse[]> => {
  const res = await apiClient.get<ShopHoursResponse[]>(`/shops/${shopId}/hours`)
  return res.data
}

export const setShopHours = async (
  shopId: string,
  data: ShopHoursRequest
): Promise<ShopHoursResponse> => {
  const res = await apiClient.put<ShopHoursResponse>(`/shops/${shopId}/hours`, data)
  return res.data
}

export const getClosedDates = async (shopId: string): Promise<ShopClosedDateResponse[]> => {
  const res = await apiClient.get<ShopClosedDateResponse[]>(`/shops/${shopId}/hours/closed-dates`)
  return res.data
}

export const addClosedDate = async (
  shopId: string,
  data: ShopClosedDateRequest
): Promise<ShopClosedDateResponse> => {
  const res = await apiClient.post<ShopClosedDateResponse>(
    `/shops/${shopId}/hours/closed-dates`,
    data
  )
  return res.data
}

export const removeClosedDate = async (shopId: string, closedDateId: string): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/hours/closed-dates/${closedDateId}`)
}