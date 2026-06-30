import { apiClient } from "./client"
import type {
  ShopResponse,
  ShopRequest,
  ShopStaffResponse,
  ShopPublicProfileResponse,
} from "@/types/shop"

export const createShop = async (data: ShopRequest): Promise<ShopResponse> => {
  const res = await apiClient.post<ShopResponse>("/shops", data)
  return res.data
}

export const getShopStaff = async (shopId: string): Promise<ShopStaffResponse[]> => {
  const res = await apiClient.get<ShopStaffResponse[]>(`/shops/${shopId}/staff`)
  return res.data
}

export const getShopPublicProfile = async (
  shopId: string
): Promise<ShopPublicProfileResponse> => {
  const res = await apiClient.get<ShopPublicProfileResponse>(`/shops/${shopId}/public`)
  return res.data
}

export const addStaff = async (
  shopId: string,
  data: { email: string; roleInShop: "OWNER" | "STAFF" }
): Promise<ShopStaffResponse> => {
  const res = await apiClient.post<ShopStaffResponse>(`/shops/${shopId}/staff`, data)
  return res.data
}

export const removeStaff = async (shopId: string, staffUserId: string): Promise<void> => {
  await apiClient.delete(`/shops/${shopId}/staff/${staffUserId}`)
}