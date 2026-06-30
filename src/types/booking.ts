export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED"

export interface BookedServiceResponse {
  serviceId: string
  serviceName: string
  priceAtBooking: number
}

export interface BookingResponse {
  id: string
  shopId: string
  customerId: string | null
  staffId: string
  guestName: string | null
  guestPhone: string | null
  bookingDate: string
  timeSlot: string
  status: BookingStatus
  services: BookedServiceResponse[]
  totalAmount: number
  createdAt: string
}

export interface PagedBookingsResponse {
  bookings: BookingResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface BookingStatusUpdateRequest {
  status: BookingStatus
}

export interface BookingRequest {
  staffId: string
  bookingDate: string
  timeSlot: string
  serviceIds: string[]
  guestName?: string
  guestPhone?: string
}

export interface AvailableSlotsResponse {
  shopId: string
  staffId: string
  date: string
  slotIntervalMinutes: number
  availableSlots: string[]
}