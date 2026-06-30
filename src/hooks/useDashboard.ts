import { useQuery } from "@tanstack/react-query"
import { getDashboardSummary, getPeakHours, getTopServices, getStaffPerformance, getShopOverview } from "@/api/dashboard"

export function useDashboardSummary(
  shopId: string | null,
  range: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: ["dashboard-summary", shopId, range],
    queryFn: () => getDashboardSummary(shopId!, range),
    enabled: !!shopId,
    retry: false, // 403 on FREE plan shouldn't retry
  })
}

export function usePeakHours(
  shopId: string | null,
  range: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: ["peak-hours", shopId, range],
    queryFn: () => getPeakHours(shopId!, range),
    enabled: !!shopId,
    retry: false,
  })
}

export function useTopServices(
  shopId: string | null,
  range: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: ["top-services", shopId, range],
    queryFn: () => getTopServices(shopId!, range),
    enabled: !!shopId,
    retry: false,
  })
}

export function useStaffPerformance(
  shopId: string | null,
  range: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: ["staff-performance", shopId, range],
    queryFn: () => getStaffPerformance(shopId!, range),
    enabled: !!shopId,
    retry: false,
  })
}

export function useShopOverview(
  shopId: string | null,
  range: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: ["shop-overview", shopId, range],
    queryFn: () => getShopOverview(shopId!, range),
    enabled: !!shopId,
    retry: false,
  })
}