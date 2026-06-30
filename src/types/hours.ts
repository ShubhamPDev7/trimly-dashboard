export interface ShopHoursResponse {
  id: string
  shopId: string
  dayOfWeek: number
  closed: boolean
  openTime: string | null
  closeTime: string | null
}

export interface ShopHoursRequest {
  dayOfWeek: number
  closed: boolean
  openTime?: string | null
  closeTime?: string | null
}

export interface ShopClosedDateResponse {
  id: string
  shopId: string
  closedDate: string
  reason: string | null
}

export interface ShopClosedDateRequest {
  closedDate: string
  reason?: string
}