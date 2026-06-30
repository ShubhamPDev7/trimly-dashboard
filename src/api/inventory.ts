import { apiClient } from "./client"
import type { InventoryResponse, InventoryRequest } from "@/types/inventory"

export const getInventory = async (shopId: string): Promise<InventoryResponse[]> => {
  const res = await apiClient.get<InventoryResponse[]>(`/shops/${shopId}/inventory`)
  return res.data
}

export const getLowStockInventory = async (shopId: string): Promise<InventoryResponse[]> => {
  const res = await apiClient.get<InventoryResponse[]>(`/shops/${shopId}/inventory/low-stock`)
  return res.data
}

export const createInventoryItem = async (
  shopId: string,
  data: InventoryRequest
): Promise<InventoryResponse> => {
  const res = await apiClient.post<InventoryResponse>(`/shops/${shopId}/inventory`, data)
  return res.data
}

export const updateInventoryItem = async (
  shopId: string,
  itemId: string,
  data: InventoryRequest
): Promise<InventoryResponse> => {
  const res = await apiClient.put<InventoryResponse>(`/shops/${shopId}/inventory/${itemId}`, data)
  return res.data
}

export const deleteInventoryItem = async (shopId: string, itemId: string): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/inventory/${itemId}`)
}