export type ServiceCategory = "MALE" | "FEMALE" | "CHILDREN"

export interface ServiceItemResponse {
  id: string
  shopId: string
  category: ServiceCategory
  name: string
  price: number
  estTimeMinutes: number | null
  imageUrl: string | null
}

export interface ServiceItemRequest {
  category: ServiceCategory
  name: string
  price: number
  estTimeMinutes?: number | null
  imageUrl?: string | null
}