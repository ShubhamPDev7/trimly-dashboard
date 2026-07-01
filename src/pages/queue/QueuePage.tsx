import { useState } from "react"
import { motion } from "framer-motion"
import { useShopStore } from "@/store/shopStore"
import { useServices } from "@/hooks/useServices"
import { useStaffList } from "@/hooks/useStaff"
import {
  useQueueList,
  useJoinQueue,
  useStartQueueEntry,
  useCompleteQueueEntry,
  useCancelQueueEntry,
  useMarkNoShow,
  useCreateWalkInBill,
} from "@/hooks/useWalkInQueue"
import type { PaymentMode } from "@/types/bill"
import StatusBadge from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import ServiceRecordDialog from "@/components/shared/ServiceRecordDialog"

const listStagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function QueuePage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { data: queue, isLoading } = useQueueList(shopId)
  const { data: services } = useServices(shopId)
  const { data: staff } = useStaffList(shopId)

  const joinMutation = useJoinQueue(shopId)
  const startMutation = useStartQueueEntry(shopId)
  const completeMutation = useCompleteQueueEntry(shopId)
  const cancelMutation = useCancelQueueEntry(shopId)
  const noShowMutation = useMarkNoShow(shopId)
  const billMutation = useCreateWalkInBill(shopId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [preferredStaffId, setPreferredStaffId] = useState<string>("")

  const [startDialogEntryId, setStartDialogEntryId] = useState<string | null>(null)
  const [startStaffId, setStartStaffId] = useState<string>("")

  const [billEntry, setBillEntry] = useState<{
    id: string
    guestName: string | null
    total: number
  } | null>(null)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH")
  const [recordTarget, setRecordTarget] = useState<{ id: string; name: string | null } | null>(null)

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedServiceIds.length === 0) {
      toast.error("Select at least one service")
      return
    }
    try {
      await joinMutation.mutateAsync({
        serviceIds: selectedServiceIds,
        guestName: guestName || undefined,
        guestPhone: guestPhone || undefined,
        preferredStaffId: preferredStaffId || undefined,
      })
      toast.success("Added to queue")
      setGuestName("")
      setGuestPhone("")
      setSelectedServiceIds([])
      setPreferredStaffId("")
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to join queue")
    }
  }

  const handleStart = async () => {
    if (!startDialogEntryId || !startStaffId) return
    try {
      await startMutation.mutateAsync({
        entryId: startDialogEntryId,
        data: { staffId: startStaffId },
      })
      toast.success("Service started")
      setStartDialogEntryId(null)
      setStartStaffId("")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start")
    }
  }

  const handleComplete = async (entryId: string) => {
    try {
      const updated = await completeMutation.mutateAsync(entryId)
      toast.success("Marked complete")
      const total = updated.services.reduce((sum, s) => sum + s.priceAtJoin, 0)
      setBillEntry({ id: entryId, guestName: updated.guestName, total })
      setPaymentMode("CASH")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to complete")
    }
  }

  const handleCreateBill = async () => {
    if (!billEntry) return
    try {
      await billMutation.mutateAsync({
        entryId: billEntry.id,
        data: { paymentMode },
      })
      toast.success("Bill created")
      setRecordTarget({ id: billEntry.id, name: billEntry.guestName })
      setBillEntry(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create bill")
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await cancelMutation.mutateAsync(cancelTarget)
      toast.success("Cancelled")
      setCancelTarget(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel")
    }
  }

  const handleNoShow = async (entryId: string) => {
    try {
      await noShowMutation.mutateAsync(entryId)
      toast.success("Marked as no-show")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark no-show")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Walk-in Queue</h1>
          <p className="text-sm text-muted-foreground">Live view of who's waiting</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Walk-in
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Walk-in</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label>Guest Name</Label>
                <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Guest Phone</Label>
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
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                        selectedServiceIds.includes(s.id)
                          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]"
                          : "border-input hover:bg-muted"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preferred Staff (optional)</Label>
                <Select value={preferredStaffId} onValueChange={setPreferredStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any available" />
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
              <DialogFooter>
                <Button type="submit" disabled={joinMutation.isPending} className="w-full">
                  {joinMutation.isPending ? "Adding..." : "Add to Queue"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && queue?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Queue is empty.
          </CardContent>
        </Card>
      )}

      <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-3">
        {queue?.map((entry) => (
          <motion.div key={entry.id} variants={listItem}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {entry.queuePosition != null && (
                        <span className="flex size-5.5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {entry.queuePosition}
                        </span>
                      )}
                      <span className="font-medium">{entry.guestName ?? "Registered Customer"}</span>
                    </div>
                    {entry.guestPhone && (
                      <div className="text-sm text-muted-foreground">{entry.guestPhone}</div>
                    )}
                    {entry.estimatedWaitMinutes != null && entry.status === "WAITING" && (
                      <div className="text-sm text-muted-foreground">
                        Est. wait: {entry.estimatedWaitMinutes} min
                      </div>
                    )}
                  </div>
                  <StatusBadge status={entry.status} />
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
                  {entry.services.map((s) => (
                    <span key={s.serviceId} className="rounded-full bg-muted px-2.5 py-1 font-medium">
                      {s.serviceName}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex justify-end gap-2 border-t border-border/60 pt-3">
                  {entry.status === "WAITING" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleNoShow(entry.id)}>
                        No-show
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCancelTarget(entry.id)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setStartDialogEntryId(entry.id)
                          setStartStaffId(entry.preferredStaffId ?? "")
                        }}
                      >
                        Start
                      </Button>
                    </>
                  )}
                  {entry.status === "IN_PROGRESS" && (
                    <Button size="sm" onClick={() => handleComplete(entry.id)}>
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Dialog
        open={!!startDialogEntryId}
        onOpenChange={(open) => !open && setStartDialogEntryId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={startStaffId} onValueChange={setStartStaffId}>
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
            <Button
              onClick={handleStart}
              disabled={!startStaffId || startMutation.isPending}
              className="w-full"
            >
              {startMutation.isPending ? "Starting..." : "Start Service"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!billEntry} onOpenChange={(open) => !open && setBillEntry(null)}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Create Bill{billEntry?.guestName ? ` — ${billEntry.guestName}` : ""}</DialogTitle>
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
            <Button
              onClick={handleCreateBill}
              disabled={billMutation.isPending}
              className="w-full"
            >
              {billMutation.isPending ? "Saving..." : "Create Bill"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              disabled={billMutation.isPending}
              onClick={() => setBillEntry(null)}
            >
              Bill later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ServiceRecordDialog
        open={!!recordTarget}
        onOpenChange={(open) => !open && setRecordTarget(null)}
        target={recordTarget ? { type: "walkin", id: recordTarget.id } : null}
        customerName={recordTarget?.name}
      />
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Queue Entry?"
        description="This customer will be removed from the walk-in queue."
        confirmLabel="Yes, Cancel"
        onConfirm={handleCancel}
        loading={cancelMutation.isPending}
      />
    </div>
  )
}