export interface ShopResponse {
  id: string
  name: string
  address: string | null
  locality: string | null
  ownerId: string
  createdAt: string
  token: string | null
}

export interface ShopRequest {
  name: string
  address?: string
  locality?: string
}

export interface ShopStaffResponse {
  userId: string
  name: string
  email: string
  roleInShop: "OWNER" | "STAFF"
}

export interface ShopPublicProfileResponse {
  id: string
  name: string
  address: string | null
  locality: string | null
  timezone: string
  averageRating: number | null
  totalReviews: number | null
  services: unknown[]
  hours: unknown[]
  staff: unknown[]
  cancellationPolicy: unknown | null
}

export interface ShopUpdateRequest {
  name: string
  address: string
  locality: string
  timezone: string
}