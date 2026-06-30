import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  listShopBookings,
  updateBookingStatus,
  cancelBooking,
  createBooking,
  getAvailableSlots,
  createBookingBill,
} from "@/api/bookings"
import type { BookingStatus, BookingRequest } from "@/types/booking"
import type { BillRequest } from "@/types/bill"

export function useShopBookings(
  shopId: string | null,
  filters: { date?: string; status?: BookingStatus; page?: number; size?: number }
) {
  return useQuery({
    queryKey: ["bookings", shopId, filters],
    queryFn: () => listShopBookings(shopId!, filters),
    enabled: !!shopId,
  })
}

export function useUpdateBookingStatus(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: BookingStatus }) =>
      updateBookingStatus(shopId!, bookingId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", shopId] })
    },
  })
}

export function useCancelBooking(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(shopId!, bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", shopId] })
    },
  })
}

export function useCreateBooking(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingRequest) => createBooking(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", shopId] })
    },
  })
}

export function useAvailableSlots(shopId: string | null, date: string, staffId: string) {
  return useQuery({
    queryKey: ["available-slots", shopId, date, staffId],
    queryFn: () => getAvailableSlots(shopId!, date, staffId),
    enabled: !!shopId && !!date && !!staffId,
  })
}

export function useCreateBookingBill(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: BillRequest }) =>
      createBookingBill(shopId!, bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", shopId] })
    },
  })
}