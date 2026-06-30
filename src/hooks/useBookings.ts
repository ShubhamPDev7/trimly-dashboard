import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  listShopBookings,
  updateBookingStatus,
  cancelBooking,
  createBooking,
} from "@/api/bookings"
import type { BookingStatus, BookingRequest } from "@/types/booking"

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