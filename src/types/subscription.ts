export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE"

export interface SubscriptionResponse {
  id: string
  shopId: string
  plan: SubscriptionPlan
  status: string
  active: boolean
  maxStaff: number
  maxBookingsPerMonth: number
  dashboardEnabled: boolean
  analyticsEnabled: boolean
  multibranchEnabled: boolean
  startedAt: string
  expiresAt: string | null
}

export interface SubscriptionOrderResponse {
  razorpayOrderId: string
  amountInPaise: number
  currency: string
  plan: string
  shopId: string
}