import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getServices, createService, updateService, deleteService } from "@/api/services"
import type { ServiceItemRequest } from "@/types/service"

export function useServices(shopId: string | null) {
  return useQuery({
    queryKey: ["services", shopId],
    queryFn: () => getServices(shopId!),
    enabled: !!shopId,
  })
}

export function useCreateService(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ServiceItemRequest) => createService(shopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", shopId] })
    },
  })
}

export function useUpdateService(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: ServiceItemRequest }) =>
      updateService(shopId!, serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", shopId] })
    },
  })
}

export function useDeleteService(shopId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceId: string) => deleteService(shopId!, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", shopId] })
    },
  })
}