import { apiClient } from "./client"
import type { ServiceItemResponse, ServiceItemRequest, ServiceCategory } from "@/types/service"

export const getServices = async (
  shopId: string,
  category?: ServiceCategory
): Promise<ServiceItemResponse[]> => {
  const res = await apiClient.get<ServiceItemResponse[]>(`/shops/${shopId}/services`, {
    params: category ? { category } : undefined,
  })
  return res.data
}

export const createService = async (
  shopId: string,
  data: ServiceItemRequest
): Promise<ServiceItemResponse> => {
  const res = await apiClient.post<ServiceItemResponse>(`/shops/${shopId}/services`, data)
  return res.data
}

export const updateService = async (
  shopId: string,
  serviceId: string,
  data: ServiceItemRequest
): Promise<ServiceItemResponse> => {
  const res = await apiClient.put<ServiceItemResponse>(
    `/shops/${shopId}/services/${serviceId}`,
    data
  )
  return res.data
}

export const deleteService = async (shopId: string, serviceId: string): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/services/${serviceId}`)
}