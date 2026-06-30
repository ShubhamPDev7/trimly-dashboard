import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import {
  useShopOverview,
  usePeakHours,
  useTopServices,
  useStaffPerformance,
} from "@/hooks/useDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "react-router-dom"
import { Lock, Star } from "lucide-react"

const todayStr = new Date().toISOString().slice(0, 10)
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

function LockedCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-md bg-muted p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Available on PRO and above
          </div>
          <Link to="/subscription" className="text-xs font-medium text-primary hover:underline">
            Upgrade
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(todayStr)

  const range = { startDate, endDate }

  const { data: overview, isLoading: overviewLoading, isError: overviewLocked } =
    useShopOverview(shopId, range)
  const { data: peakHours, isLoading: peakLoading, isError: peakLocked } =
    usePeakHours(shopId, range)
  const { data: topServices, isLoading: servicesLoading, isError: servicesLocked } =
    useTopServices(shopId, range)
  const { data: staffPerf, isLoading: staffLoading, isError: staffLocked } =
    useStaffPerformance(shopId, range)

  const maxBookingCount = Math.max(1, ...(peakHours?.slots.map((s) => s.bookingCount) ?? [1]))
  const maxServiceRevenue = Math.max(
    1,
    ...(topServices?.services.map((s) => s.totalRevenue) ?? [1])
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-lg font-semibold">Analytics</h1>
        <div className="flex gap-2">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Overview stats */}
      {overviewLocked ? (
        <LockedCard title="Overview" />
      ) : overviewLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Total Bookings</div>
              <div className="text-lg font-semibold">{overview?.totalBookings ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Cancellation Rate</div>
              <div className="text-lg font-semibold">{overview?.cancellationRate ?? 0}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Repeat Customers</div>
              <div className="text-lg font-semibold">{overview?.repeatCustomerRate ?? 0}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Avg. Bill Value</div>
              <div className="text-lg font-semibold">₹{overview?.averageBillValue ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Peak hours */}
        {peakLocked ? (
          <LockedCard title="Peak Hours" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {peakLoading && <Skeleton className="h-48 w-full" />}
              {!peakLoading && (
                <div className="flex h-40 items-end gap-0.5">
                  {peakHours?.slots.map((slot) => (
                    <div
                      key={slot.hour}
                      className="flex flex-1 flex-col items-center justify-end"
                      title={`${slot.label}: ${slot.bookingCount} bookings`}
                    >
                      <div
                        className="w-full rounded-t bg-primary"
                        style={{
                          height: `${(slot.bookingCount / maxBookingCount) * 100}%`,
                          minHeight: slot.bookingCount > 0 ? "4px" : "0px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>12 AM</span>
                <span>12 PM</span>
                <span>11 PM</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top services */}
        {servicesLocked ? (
          <LockedCard title="Top Services" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {servicesLoading &&
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              {!servicesLoading && topServices?.services.length === 0 && (
                <p className="text-sm text-muted-foreground">No completed bookings in range.</p>
              )}
              {topServices?.services.map((s) => (
                <div key={s.serviceId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{s.serviceName}</span>
                    <span className="text-muted-foreground">
                      {s.bookingCount} · ₹{s.totalRevenue}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(s.totalRevenue / maxServiceRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Staff performance */}
      {staffLocked ? (
        <LockedCard title="Staff Performance" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {staffLoading && <Skeleton className="h-32 w-full" />}
            {!staffLoading && staffPerf?.length === 0 && (
              <p className="text-sm text-muted-foreground">No staff data in range.</p>
            )}
            {!staffLoading && staffPerf && staffPerf.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffPerf.map((s) => (
                      <TableRow key={s.staffId}>
                        <TableCell className="font-medium">{s.staffName}</TableCell>
                        <TableCell>{s.bookingsCompleted}</TableCell>
                        <TableCell>₹{s.totalRevenue}</TableCell>
                        <TableCell>
                          {s.averageRating != null ? (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {s.averageRating} ({s.totalReviews})
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}