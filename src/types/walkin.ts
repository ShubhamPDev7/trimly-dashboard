export type WalkInStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"

export interface WalkInQueueServiceResponse {
  serviceId: string
  serviceName: string
  priceAtJoin: number
}

export interface WalkInQueueEntryResponse {
  id: string
  shopId: string
  customerId: string | null
  guestName: string | null
  guestPhone: string | null
  preferredStaffId: string | null
  assignedStaffId: string | null
  status: WalkInStatus
  services: WalkInQueueServiceResponse[]
  joinedAt: string
  startedAt: string | null
  completedAt: string | null
  estimatedWaitMinutes: number | null
  estimatedStartAt: string | null
  likelyStaffId: string | null
  queuePosition: number | null
}

export interface WalkInJoinRequest {
  serviceIds: string[]
  preferredStaffId?: string
  guestName?: string
  guestPhone?: string
}

export interface WalkInStartRequest {
  staffId: string
}