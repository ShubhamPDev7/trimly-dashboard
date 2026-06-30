import { apiClient } from "./client"
import type {
  PagedBookingsResponse,
  BookingResponse,
  BookingStatusUpdateRequest,
  BookingStatus,
  BookingRequest,
} from "@/types/booking"

export const listShopBookings = async (
  shopId: string,
  params: { date?: string; status?: BookingStatus; page?: number; size?: number }
): Promise<PagedBookingsResponse> => {
  const res = await apiClient.get<PagedBookingsResponse>(`/shops/${shopId}/bookings`, {
    params,
  })
  return res.data
}

export const updateBookingStatus = async (
  shopId: string,
  bookingId: string,
  data: BookingStatusUpdateRequest
): Promise<BookingResponse> => {
  const res = await apiClient.patch<BookingResponse>(
    `/shops/${shopId}/bookings/${bookingId}/status`,
    data
  )
  return res.data
}

export const cancelBooking = async (shopId: string, bookingId: string): Promise<BookingResponse> => {
  const res = await apiClient.patch<BookingResponse>(`/shops/${shopId}/bookings/${bookingId}/cancel`)
  return res.data
}

export const createBooking = async (
  shopId: string,
  data: BookingRequest
): Promise<BookingResponse> => {
  const res = await apiClient.post<BookingResponse>(`/shops/${shopId}/bookings`, data)
  return res.data
}