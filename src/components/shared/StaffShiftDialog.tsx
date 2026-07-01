import { useEffect, useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useStaffSchedule, useUpsertShift } from "@/hooks/useShifts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const DAY_LABELS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface DayRow {
  dayOfWeek: number
  isOff: boolean
  startTime: string
  endTime: string
}

interface Props {
  staffUserId: string | null
  staffName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function StaffShiftDialog({ staffUserId, staffName, open, onOpenChange }: Props) {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { data: shifts } = useStaffSchedule(shopId, staffUserId)
  const upsertMutation = useUpsertShift(shopId, staffUserId)

  const [rows, setRows] = useState<DayRow[]>([])

  useEffect(() => {
    const initial: DayRow[] = []
    for (let d = 1; d <= 7; d++) {
      const existing = shifts?.find((s) => s.dayOfWeek === d)
      initial.push({
        dayOfWeek: d,
        isOff: existing?.isOff ?? false,
        startTime: existing?.startTime?.slice(0, 5) ?? "09:00",
        endTime: existing?.endTime?.slice(0, 5) ?? "18:00",
      })
    }
    setRows(initial)
  }, [shifts])

  const updateRow = (dayOfWeek: number, patch: Partial<DayRow>) => {
    setRows((prev) => prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)))
  }

  const handleSaveAll = async () => {
    try {
      await Promise.all(
        rows.map((r) =>
          upsertMutation.mutateAsync({
            dayOfWeek: r.dayOfWeek,
            isOff: r.isOff,
            startTime: r.startTime + ":00",
            endTime: r.endTime + ":00",
          })
        )
      )
      toast.success("Shifts saved")
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save shifts")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{staffName}'s Weekly Shift</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.dayOfWeek}
              className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="w-24 font-medium text-sm">{DAY_LABELS[row.dayOfWeek]}</div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={row.isOff}
                    onChange={(e) => updateRow(row.dayOfWeek, { isOff: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  Off
                </label>
                {!row.isOff && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={row.startTime}
                      onChange={(e) => updateRow(row.dayOfWeek, { startTime: e.target.value })}
                      className="w-28"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input
                      type="time"
                      value={row.endTime}
                      onChange={(e) => updateRow(row.dayOfWeek, { endTime: e.target.value })}
                      className="w-28"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          <DialogFooter className="pt-2">
            <Button
              onClick={handleSaveAll}
              disabled={upsertMutation.isPending}
              className="w-full"
            >
              {upsertMutation.isPending ? "Saving..." : "Save Shifts"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}