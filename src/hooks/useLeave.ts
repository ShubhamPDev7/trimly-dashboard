import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getStaffLeaves, markStaffLeave, cancelStaffLeave } from "@/api/leave"
import type { StaffLeaveRequest } from "@/types/leave"

export function useStaffLeaves(shopId: string | null, staffUserId: string | null) {
  return useQuery({
    queryKey: ["staff-leaves", shopId, staffUserId],
    queryFn: () => getStaffLeaves(shopId!, staffUserId!),
    enabled: !!shopId && !!staffUserId,
  })
}

export function useMarkStaffLeave(shopId: string | null, staffUserId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StaffLeaveRequest) => markStaffLeave(shopId!, staffUserId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-leaves", shopId, staffUserId] })
    },
  })
}

export function useCancelStaffLeave(shopId: string | null, staffUserId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (leaveDate: string) => cancelStaffLeave(shopId!, staffUserId!, leaveDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-leaves", shopId, staffUserId] })
    },
  })
}