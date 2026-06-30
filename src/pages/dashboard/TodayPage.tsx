import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useShopBookings } from "@/hooks/useBookings"
import { useQueueList, useQueueHistory, useCreateWalkInBill } from "@/hooks/useWalkInQueue"
import { useDashboardSummary } from "@/hooks/useDashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { CalendarClock, Users, IndianRupee, Lock, CheckCircle2, Receipt } from "lucide-react"
import type { PaymentMode } from "@/types/bill"

const todayStr = new Date().toISOString().slice(0, 10)

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  ACCEPTED: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
  CANCELLED: "destructive",
}

const queueStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  WAITING: "outline",
  IN_PROGRESS: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
}

function StatCard({
  icon: Icon,
  label,
  value,
  locked,
}: {
  icon: React.ElementType
  label: string
  value: string
  locked?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="flex items-center gap-1 text-lg font-semibold">
            {locked ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span className="text-sm font-normal text-muted-foreground">PRO only</span>
              </>
            ) : (
              value
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TodayPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const billMutation = useCreateWalkInBill(shopId)
  const [billEntry, setBillEntry] = useState<{
    id: string
    guestName: string | null
    total: number
  } | null>(null)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH")

  const { data: bookingsData, isLoading: bookingsLoading } = useShopBookings(shopId, {
    date: todayStr,
    size: 10,
  })
  const { data: queue, isLoading: queueLoading } = useQueueList(shopId)
  const { data: history } = useQueueHistory(shopId, 0, 50)
  const { data: summary, isError: summaryLocked } = useDashboardSummary(shopId, {
    startDate: todayStr,
    endDate: todayStr,
  })

  const activeQueue = queue?.filter(
    (e) => e.status === "WAITING" || e.status === "IN_PROGRESS"
  )

  const completedToday = history?.content.filter(
    (e) =>
      e.status === "COMPLETED" &&
      e.completedAt &&
      e.completedAt.slice(0, 10) === todayStr
  )

  const handleCreateBill = async () => {
    if (!billEntry) return
    try {
      await billMutation.mutateAsync({ entryId: billEntry.id, data: { paymentMode } })
      toast.success("Bill created")
      setBillEntry(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create bill")
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Today</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <StatCard
          icon={CalendarClock}
          label="Today's Bookings"
          value={String(bookingsData?.totalElements ?? 0)}
        />
        <StatCard
          icon={Users}
          label="In Queue"
          value={String(activeQueue?.length ?? 0)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Today"
          value={String(completedToday?.length ?? 0)}
        />
        <StatCard
          icon={IndianRupee}
          label="Today's Revenue"
          value={summary ? `₹${summary.totalRevenue}` : "—"}
          locked={summaryLocked}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Today's Bookings</h2>
            <Link to="/bookings" className="text-xs text-muted-foreground hover:underline">
              View all
            </Link>
          </div>

          {bookingsLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {!bookingsLoading && bookingsData?.bookings.length === 0 && (
            <p className="text-sm text-muted-foreground">No bookings today.</p>
          )}

          <div className="space-y-2">
            {bookingsData?.bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-medium">
                      {b.guestName ?? "Customer"} · {b.timeSlot}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.services.map((s) => s.serviceName).join(", ")}
                    </div>
                  </div>
                  <Badge variant={statusVariant[b.status] ?? "outline"}>{b.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Walk-in Queue</h2>
            <Link to="/queue" className="text-xs text-muted-foreground hover:underline">
              View all
            </Link>
          </div>

          {queueLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {!queueLoading && activeQueue?.length === 0 && (completedToday?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No one in queue.</p>
          )}

          <div className="space-y-2">
            {activeQueue?.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-medium">
                      {entry.guestName ?? "Walk-in"}
                      {entry.queuePosition != null && ` · #${entry.queuePosition}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.services.map((s) => s.serviceName).join(", ")}
                    </div>
                  </div>
                  <Badge variant={queueStatusVariant[entry.status] ?? "outline"}>
                    {entry.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}

            {completedToday && completedToday.length > 0 && (
              <>
                <div className="pt-1 text-xs text-muted-foreground">Completed today</div>
                {completedToday.map((entry) => (
                  <Card key={entry.id} className="opacity-70">
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <div className="text-sm font-medium">
                          {entry.guestName ?? "Walk-in"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.services.map((s) => s.serviceName).join(", ")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">COMPLETED</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setBillEntry({
                              id: entry.id,
                              guestName: entry.guestName,
                              total: entry.services.reduce((sum, s) => sum + s.priceAtJoin, 0),
                            })
                          }
                        >
                          <Receipt className="mr-1 h-3.5 w-3.5" />
                          Bill
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {summaryLocked && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium">Unlock revenue insights</div>
              <div className="text-xs text-muted-foreground">
                Upgrade to PRO to see today's revenue and full analytics.
              </div>
            </div>
            <Link
              to="/subscription"
              className="text-xs font-medium text-primary hover:underline"
            >
              Upgrade
            </Link>
          </CardContent>
        </Card>
      )}
      <Dialog open={!!billEntry} onOpenChange={(open) => !open && setBillEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create Bill{billEntry?.guestName ? ` — ${billEntry.guestName}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total amount</span>
                <span className="font-semibold">₹{billEntry?.total ?? 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateBill} disabled={billMutation.isPending} className="w-full">
              {billMutation.isPending ? "Saving..." : "Create Bill"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}