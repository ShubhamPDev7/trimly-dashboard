import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBarberProfile, upsertBarberProfile, deleteBarberProfile } from "@/api/barber"
import type { BarberProfileRequest } from "@/types/barber"

export function useBarberProfile(shopId: string | null, staffUserId: string | null) {
  return useQuery({
    queryKey: ["barber-profile", shopId, staffUserId],
    queryFn: () => getBarberProfile(shopId!, staffUserId!),
    enabled: !!shopId && !!staffUserId,
    retry: false, // Don't retry on 404 (new staff won't have a profile yet)
  })
}

export function useUpsertBarberProfile(shopId: string | null, staffUserId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BarberProfileRequest) => upsertBarberProfile(shopId!, staffUserId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barber-profile", shopId, staffUserId] })
    },
  })
}

export function useDeleteBarberProfile(shopId: string | null, staffUserId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteBarberProfile(shopId!, staffUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barber-profile", shopId, staffUserId] })
    },
  })
}