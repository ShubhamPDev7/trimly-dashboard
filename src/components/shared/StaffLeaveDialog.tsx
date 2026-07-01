import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useStaffLeaves, useMarkStaffLeave, useCancelStaffLeave } from "@/hooks/useLeave"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  staffUserId: string | null
  staffName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function StaffLeaveDialog({ staffUserId, staffName, open, onOpenChange }: Props) {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { data: leaves, isLoading } = useStaffLeaves(shopId, staffUserId)
  const markMutation = useMarkStaffLeave(shopId, staffUserId)
  const cancelMutation = useCancelStaffLeave(shopId, staffUserId)

  const [leaveDate, setLeaveDate] = useState("")
  const [reason, setReason] = useState("")

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await markMutation.mutateAsync({ leaveDate, reason: reason || undefined })
      toast.success("Leave marked")
      setLeaveDate("")
      setReason("")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark leave")
    }
  }

  const handleCancel = async (date: string) => {
    try {
      await cancelMutation.mutateAsync(date)
      toast.success("Leave cancelled")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel leave")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{staffName}'s Leaves</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleMark} className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Reason (optional)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <Button type="submit" disabled={markMutation.isPending}>
            {markMutation.isPending ? "Marking..." : "Mark Leave"}
          </Button>
        </form>

        <div className="space-y-2 pt-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && leaves?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No leaves marked.</p>
          )}
          {leaves?.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div>
                <div className="text-sm font-medium">{l.leaveDate}</div>
                {l.reason && <div className="text-xs text-muted-foreground mt-0.5">{l.reason}</div>}
              </div>
              <button
                onClick={() => handleCancel(l.leaveDate)}
                title="Cancel Leave"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}