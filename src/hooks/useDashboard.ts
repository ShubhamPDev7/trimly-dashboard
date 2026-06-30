import { useQuery } from "@tanstack/react-query"
import { getDashboardSummary } from "@/api/dashboard"

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