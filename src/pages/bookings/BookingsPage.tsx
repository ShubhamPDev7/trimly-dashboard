import { useState } from "react"
import { motion } from "framer-motion"
import { useShopStore } from "@/store/shopStore"
import { useShopBookings, useUpdateBookingStatus, useCreateBookingBill } from "@/hooks/useBookings"
import type { BookingStatus } from "@/types/booking"
import StatusBadge from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, CalendarClock } from "lucide-react"
import type { PaymentMode } from "@/types/bill"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CreateBookingDialog from "@/components/shared/CreateBookingDialog"
import ServiceRecordDialog from "@/components/shared/ServiceRecordDialog"

const STATUS_OPTIONS: (BookingStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]

const listStagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function BookingsPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const [date, setDate] = useState("")
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL")
  const [page, setPage] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const billMutation = useCreateBookingBill(shopId)
  const [billBooking, setBillBooking] = useState<{ id: string; guestName: string | null; total: number } | null>(null)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH")
  const [recordTarget, setRecordTarget] = useState<{ id: string; name: string | null } | null>(null)

  const { data, isLoading } = useShopBookings(shopId, {
    date: date || undefined,
    status: status === "ALL" ? undefined : status,
    page,
    size: 20,
  })

  const updateStatus = useUpdateBookingStatus(shopId)

  const isBookingTimePassed = (bookingDate: string, timeSlot: string) => {
    const bookingDateTime = new Date(`${bookingDate}T${timeSlot}`)
    return bookingDateTime.getTime() <= Date.now()
  }

  const handleAction = async (booking: { id: string; guestName: string | null; totalAmount: number }, newStatus: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ bookingId: booking.id, status: newStatus })
      toast.success(`Booking ${newStatus.toLowerCase()}`)
      if (newStatus === "COMPLETED") {
        setBillBooking({ id: booking.id, guestName: booking.guestName, total: booking.totalAmount })
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update booking")
    }
  }

  const handleCreateBill = async () => {
    if (!billBooking) return
    try {
      await billMutation.mutateAsync({ bookingId: billBooking.id, data: { paymentMode } })
      toast.success("Bill created")
      setRecordTarget({ id: billBooking.id, name: billBooking.guestName })
      setBillBooking(null)
      setPaymentMode("CASH")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create bill")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage appointment requests</p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Filter by date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setPage(0)
            }}
            className="sm:w-44"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as BookingStatus | "ALL")
              setPage(0)
            }}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {date && (
          <Button variant="outline" size="sm" onClick={() => setDate("")}>
            Clear date
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && data?.bookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <CalendarClock className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No bookings found.</p>
          </CardContent>
        </Card>
      )}

      <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-3">
        {data?.bookings.map((b) => (
          <motion.div key={b.id} variants={listItem}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {b.guestName ?? "Registered Customer"}
                      {b.guestPhone && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">{b.guestPhone}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {b.bookingDate} · {b.timeSlot}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
                  {b.services.map((s) => (
                    <span key={s.serviceId} className="rounded-full bg-muted px-2.5 py-1 font-medium">
                      {s.serviceName} · ₹{s.priceAtBooking}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-sm font-semibold">Total: ₹{b.totalAmount}</span>
                  <div className="flex gap-2">
                    {b.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(b, "REJECTED")}
                        >
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleAction(b, "ACCEPTED")}>
                          Accept
                        </Button>
                      </>
                    )}
                    {b.status === "ACCEPTED" && (
                      isBookingTimePassed(b.bookingDate, b.timeSlot) ? (
                        <Button size="sm" onClick={() => handleAction(b, "COMPLETED")}>
                          Mark Complete
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Available after {b.timeSlot.slice(0, 5)} on {b.bookingDate}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {data.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Dialog open={!!billBooking} onOpenChange={(open) => !open && setBillBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create Bill{billBooking?.guestName ? ` — ${billBooking.guestName}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total amount</span>
                <span className="font-semibold">₹{billBooking?.total ?? 0}</span>
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
      <ServiceRecordDialog
        open={!!recordTarget}
        onOpenChange={(open) => !open && setRecordTarget(null)}
        target={recordTarget ? { type: "booking", id: recordTarget.id } : null}
        customerName={recordTarget?.name}
      />
      <CreateBookingDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}