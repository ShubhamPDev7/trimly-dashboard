import { apiClient } from "./client"
import type {
  DashboardSummaryResponse,
  PeakHoursResponse,
  TopServicesResponse,
  StaffPerformanceResponse,
  ShopOverviewResponse,
} from "@/types/dashboard"

interface DateRange {
  startDate: string
  endDate: string
}

export const getDashboardSummary = async (
  shopId: string,
  range: DateRange
): Promise<DashboardSummaryResponse> => {
  const res = await apiClient.get<DashboardSummaryResponse>(
    `/shops/${shopId}/dashboard/summary`,
    { params: range }
  )
  return res.data
}

export const getPeakHours = async (
  shopId: string,
  range: DateRange
): Promise<PeakHoursResponse> => {
  const res = await apiClient.get<PeakHoursResponse>(
    `/shops/${shopId}/dashboard/peak-hours`,
    { params: range }
  )
  return res.data
}

export const getTopServices = async (
  shopId: string,
  range: DateRange
): Promise<TopServicesResponse> => {
  const res = await apiClient.get<TopServicesResponse>(
    `/shops/${shopId}/dashboard/top-services`,
    { params: range }
  )
  return res.data
}

export const getStaffPerformance = async (
  shopId: string,
  range: DateRange
): Promise<StaffPerformanceResponse[]> => {
  const res = await apiClient.get<StaffPerformanceResponse[]>(
    `/shops/${shopId}/dashboard/staff-performance`,
    { params: range }
  )
  return res.data
}

export const getShopOverview = async (
  shopId: string,
  range: DateRange
): Promise<ShopOverviewResponse> => {
  const res = await apiClient.get<ShopOverviewResponse>(
    `/shops/${shopId}/dashboard/overview`,
    { params: range }
  )
  return res.data
}