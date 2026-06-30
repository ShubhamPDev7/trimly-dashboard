export interface DailyRevenue {
  date: string
  revenue: number
}

export interface TopCustomer {
  label: string
  visitCount: number
  totalSpent: number
}

export interface DashboardSummaryResponse {
  totalRevenue: number
  totalBookings: number
  dailyBreakdown: DailyRevenue[]
  topCustomers: TopCustomer[]
}

export interface PeakHourSlot {
  hour: number
  label: string
  bookingCount: number
}

export interface PeakHoursResponse {
  slots: PeakHourSlot[]
}

export interface ServiceStat {
  serviceId: string
  serviceName: string
  bookingCount: number
  totalRevenue: number
}

export interface TopServicesResponse {
  services: ServiceStat[]
}

export interface StaffPerformanceResponse {
  staffId: string
  staffName: string
  bookingsCompleted: number
  totalRevenue: number
  averageRating: number | null
  totalReviews: number
}

export interface ShopOverviewResponse {
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  cancellationRate: number
  totalUniqueCustomers: number
  repeatCustomers: number
  repeatCustomerRate: number
  averageBillValue: number
  averageShopRating: number | null
  totalReviews: number
}