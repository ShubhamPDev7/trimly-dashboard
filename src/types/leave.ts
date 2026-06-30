export interface StaffLeaveResponse {
  id: string
  shopId: string
  staffUserId: string
  staffName: string
  leaveDate: string
  reason: string | null
  createdAt: string
}

export interface StaffLeaveRequest {
  leaveDate: string
  reason?: string
}