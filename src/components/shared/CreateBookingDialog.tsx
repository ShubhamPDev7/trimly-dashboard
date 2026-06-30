import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useServices } from "@/hooks/useServices"
import { useStaffList } from "@/hooks/useStaff"
import { useAvailableSlots, useCreateBooking } from "@/hooks/useBookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const todayStr = new Date().toISOString().slice(0, 10)

export default function CreateBookingDialog({ open, onOpenChange }: Props) {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { data: services } = useServices(shopId)
  const { data: staff } = useStaffList(shopId)
  const createMutation = useCreateBooking(shopId)

  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [staffId, setStaffId] = useState("")
  const [date, setDate] = useState(todayStr)
const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
  const [timeSlot, setTimeSlot] = useState("")
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(shopId, date, staffId)

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const resetForm = () => {
    setGuestName("")
    setGuestPhone("")
    setStaffId("")
    setDate(todayStr)
    setTimeSlot("")
    setSelectedServiceIds([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffId) {
      toast.error("Select a staff member")
      return
    }
    if (!timeSlot) {
      toast.error("Select a time slot")
      return
    }
    if (selectedServiceIds.length === 0) {
      toast.error("Select at least one service")
      return
    }

    try {
      await createMutation.mutateAsync({
        staffId,
        bookingDate: date,
        timeSlot: timeSlot + ":00",
        serviceIds: selectedServiceIds,
        guestName,
        guestPhone,
      })
      toast.success("Booking created")
      resetForm()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create booking")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o) }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Customer Phone</Label>
            <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Services</Label>
            <div className="flex flex-wrap gap-2">
              {services?.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`rounded-md border px-2.5 py-1 text-sm ${
                    selectedServiceIds.includes(s.id)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Staff</Label>
            <Select
              value={staffId}
              onValueChange={(v) => {
                setStaffId(v)
                setTimeSlot("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staff?.map((st) => (
                  <SelectItem key={st.userId} value={st.userId}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setTimeSlot("")
              }}
              required
            />
          </div>

          {staffId && (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              {slotsLoading && <p className="text-sm text-muted-foreground">Loading slots...</p>}
              {!slotsLoading &&
                (slotsData?.availableSlots.filter((slot) => {
                  if (date !== todayStr) return true
                  const [h, m] = slot.split(":").map(Number)
                  return h * 60 + m > nowMinutes
                }).length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No slots available for this staff member on this date.
                  </p>
                )}
              <div className="flex flex-wrap gap-2">
                {slotsData?.availableSlots
                  .filter((slot) => {
                    if (date !== todayStr) return true
                    const [h, m] = slot.split(":").map(Number)
                    return h * 60 + m > nowMinutes
                  })
                  .map((slot) => {
                    const display = slot.slice(0, 5)
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setTimeSlot(display)}
                        className={`rounded-md border px-2.5 py-1 text-sm ${
                          timeSlot === display
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        }`}
                      >
                        {display}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}