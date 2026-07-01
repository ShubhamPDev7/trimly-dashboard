import { useState } from "react"
import { motion } from "framer-motion"
import { useShopStore } from "@/store/shopStore"
import { useShopBookings } from "@/hooks/useBookings"
import { useQueueList, useQueueHistory, useCreateWalkInBill } from "@/hooks/useWalkInQueue"
import { useDashboardSummary } from "@/hooks/useDashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import StatCard from "@/components/shared/StatCard"
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
import { CalendarClock, Users, IndianRupee, CheckCircle2, Receipt, ArrowUpRight } from "lucide-react"
import type { PaymentMode } from "@/types/bill"

const todayStr = new Date().toISOString().slice(0, 10)

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  PENDING: "warning",
  ACCEPTED: "secondary",
  COMPLETED: "success",
  REJECTED: "destructive",
  CANCELLED: "destructive",
}

const queueStatusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  WAITING: "warning",
  IN_PROGRESS: "secondary",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
}

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
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
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Today</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          index={0}
          icon={CalendarClock}
          label="Today's Bookings"
          value={String(bookingsData?.totalElements ?? 0)}
        />
        <StatCard
          index={1}
          icon={Users}
          label="In Queue"
          value={String(activeQueue?.length ?? 0)}
        />
        <StatCard
          index={2}
          icon={CheckCircle2}
          label="Completed Today"
          value={String(completedToday?.length ?? 0)}
        />
        <StatCard
          index={3}
          hero
          icon={IndianRupee}
          label="Today's Revenue"
          value={summary ? `₹${summary.totalRevenue}` : "—"}
          locked={summaryLocked}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Today's Bookings</h2>
            <Link
              to="/bookings"
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
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
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No bookings today.
              </CardContent>
            </Card>
          )}

          <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-2">
            {bookingsData?.bookings.map((b) => (
              <motion.div key={b.id} variants={listItem}>
                <Card className="hover:shadow-[var(--shadow-soft-lg)]">
                  <CardContent className="flex items-center justify-between p-3.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {b.guestName ?? "Customer"} · {b.timeSlot}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {b.services.map((s) => s.serviceName).join(", ")}
                      </div>
                    </div>
                    <Badge variant={statusVariant[b.status] ?? "outline"}>{b.status}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Walk-in Queue</h2>
            <Link
              to="/queue"
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
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
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No one in queue.
              </CardContent>
            </Card>
          )}

          <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-2">
            {activeQueue?.map((entry) => (
              <motion.div key={entry.id} variants={listItem}>
                <Card className="hover:shadow-[var(--shadow-soft-lg)]">
                  <CardContent className="flex items-center justify-between p-3.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {entry.guestName ?? "Walk-in"}
                        {entry.queuePosition != null && ` · #${entry.queuePosition}`}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {entry.services.map((s) => s.serviceName).join(", ")}
                      </div>
                    </div>
                    <Badge variant={queueStatusVariant[entry.status] ?? "outline"}>
                      {entry.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {completedToday && completedToday.length > 0 && (
              <>
                <div className="pt-1 text-[0.68rem] font-medium tracking-wide text-muted-foreground uppercase">
                  Completed today
                </div>
                {completedToday.map((entry) => (
                  <motion.div key={entry.id} variants={listItem}>
                    <Card className="opacity-75">
                      <CardContent className="flex items-center justify-between p-3.5">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {entry.guestName ?? "Walk-in"}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {entry.services.map((s) => s.serviceName).join(", ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success">COMPLETED</Badge>
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
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {summaryLocked && (
        <Card className="border-gold/40 bg-gradient-to-r from-gold/10 to-transparent">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium">Unlock revenue insights</div>
              <div className="text-xs text-muted-foreground">
                Upgrade to PRO to see today's revenue and full analytics.
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/subscription">Upgrade</Link>
            </Button>
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
            <div className="rounded-xl bg-muted p-3 text-sm">
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