export interface StaffShiftResponse {
  id: string
  shopId: string
  staffUserId: string
  staffName: string
  dayOfWeek: number
  dayName: string
  startTime: string
  endTime: string
  isOff: boolean
  createdAt: string
  updatedAt: string
}

export interface StaffShiftRequest {
  dayOfWeek: number
  startTime: string
  endTime: string
  isOff: boolean
}