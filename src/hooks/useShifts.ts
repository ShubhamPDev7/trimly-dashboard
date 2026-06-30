import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getStaffSchedule, upsertShift, deleteShift } from "@/api/shifts"
import type { StaffShiftRequest } from "@/types/shift"

export function useStaffSchedule(shopId: string | null, staffUserId: string | null) {
  return useQuery({
    queryKey: ["staff-schedule", shopId, staffUserId],
    queryFn: () => getStaffSchedule(shopId!, staffUserId!),
    enabled: !!shopId && !!staffUserId,
  })
}

export function useUpsertShift(shopId: string | null, staffUserId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StaffShiftRequest) => upsertShift(shopId!, staffUserId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-schedule", shopId, staffUserId] })
    },
  })
}