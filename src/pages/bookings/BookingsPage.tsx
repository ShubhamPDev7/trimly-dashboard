import { useState } from "react"
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
import { Plus } from "lucide-react"
import type { PaymentMode } from "@/types/bill"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CreateBookingDialog from "@/components/shared/CreateBookingDialog"

const STATUS_OPTIONS: (BookingStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]

export default function BookingsPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const [date, setDate] = useState("")
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL")
  const [page, setPage] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const billMutation = useCreateBookingBill(shopId)
const [billBooking, setBillBooking] = useState<{ id: string; guestName: string | null; total: number } | null>(null)
const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH")

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
      setBillBooking(null)
      setPaymentMode("CASH")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create bill")
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
  <h1 className="text-lg font-semibold">Bookings</h1>
  <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
    <Plus className="mr-1 h-4 w-4" />
    New Booking
  </Button>
</div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            setPage(0)
          }}
          className="sm:w-44"
        />
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
        <p className="text-sm text-muted-foreground">No bookings found.</p>
      )}

      <div className="space-y-3">
        {data?.bookings.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">
                    {b.guestName ?? "Registered Customer"}
                    {b.guestPhone && (
                      <span className="ml-2 text-sm text-muted-foreground">{b.guestPhone}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {b.bookingDate} · {b.timeSlot}
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5 text-sm">
                {b.services.map((s) => (
                  <span key={s.serviceId} className="rounded-md bg-muted px-2 py-0.5">
                    {s.serviceName} · ₹{s.priceAtBooking}
                  </span>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between">
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
        ))}
      </div>

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
      <div className="rounded-md bg-muted p-3 text-sm">
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
      <CreateBookingDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}