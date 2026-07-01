import { useEffect, useState } from "react"
import { useShopStore } from "@/store/shopStore"
import {
  useShopHours,
  useSetShopHours,
  useClosedDates,
  useAddClosedDate,
  useRemoveClosedDate,
} from "@/hooks/useShopHours"
import {
  useCancellationPolicy,
  useUpsertCancellationPolicy,
  useDeleteCancellationPolicy,
} from "@/hooks/usePolicy"
import { useShopProfile } from "@/hooks/useShopProfile"
import { useUpdateShop } from "@/hooks/useShop"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { X } from "lucide-react"

const DAY_LABELS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface DayRow {
  dayOfWeek: number
  closed: boolean
  openTime: string
  closeTime: string
}

export default function HoursPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  
  const { data: shopProfile } = useShopProfile()
  const updateShopMutation = useUpdateShop(shopId)
  const [profileForm, setProfileForm] = useState({ name: "", address: "", locality: "", timezone: "Asia/Kolkata" })
  
  const { data: hours, isLoading } = useShopHours(shopId)
  const setHours = useSetShopHours(shopId)

  const { data: closedDates } = useClosedDates(shopId)
  const addClosed = useAddClosedDate(shopId)
  const removeClosed = useRemoveClosedDate(shopId)

  const { data: policy, isLoading: policyLoading } = useCancellationPolicy(shopId)
  const upsertPolicy = useUpsertCancellationPolicy(shopId)
  const deletePolicy = useDeleteCancellationPolicy(shopId)
  const [minHours, setMinHours] = useState("24")

  const [rows, setRows] = useState<DayRow[]>([])
  const [newDate, setNewDate] = useState("")
  const [newReason, setNewReason] = useState("")

  useEffect(() => {
    const initial: DayRow[] = []
    for (let d = 1; d <= 7; d++) {
      const existing = hours?.find((h) => h.dayOfWeek === d)
      initial.push({
        dayOfWeek: d,
        closed: existing?.closed ?? false,
        openTime: existing?.openTime?.slice(0, 5) ?? "09:00",
        closeTime: existing?.closeTime?.slice(0, 5) ?? "18:00",
      })
    }
    setRows(initial)
  }, [hours])

  useEffect(() => {
    if (policy) setMinHours(String(policy.minHoursBeforeCancel))
  }, [policy])

  useEffect(() => {
    if (shopProfile) {
      setProfileForm({
        name: shopProfile.name,
        address: shopProfile.address ?? "",
        locality: shopProfile.locality ?? "",
        timezone: shopProfile.timezone,
      })
    }
  }, [shopProfile])

  const updateRow = (dayOfWeek: number, patch: Partial<DayRow>) => {
    setRows((prev) => prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)))
  }

  const handleSaveAll = async () => {
    try {
      await Promise.all(
        rows.map((r) =>
          setHours.mutateAsync({
            dayOfWeek: r.dayOfWeek,
            closed: r.closed,
            openTime: r.closed ? null : r.openTime + ":00",
            closeTime: r.closed ? null : r.closeTime + ":00",
          })
        )
      )
      toast.success("Hours saved")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save hours")
    }
  }

  const handleAddClosedDate = async () => {
    if (!newDate) return
    try {
      await addClosed.mutateAsync({ closedDate: newDate, reason: newReason || undefined })
      setNewDate("")
      setNewReason("")
      toast.success("Closed date added")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add closed date")
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateShopMutation.mutateAsync(profileForm)
      toast.success("Shop profile updated")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update shop profile")
    }
  }

  const handleSavePolicy = async () => {
    const hoursNum = Number(minHours)
    if (!hoursNum || hoursNum < 1) {
      toast.error("Enter at least 1 hour")
      return
    }
    try {
      await upsertPolicy.mutateAsync({ minHoursBeforeCancel: hoursNum })
      toast.success("Cancellation policy saved")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save policy")
    }
  }

  const handleRemovePolicy = async () => {
    if (!confirm("Remove the cancellation policy? Customers will be able to cancel anytime.")) return
    try {
      await deletePolicy.mutateAsync()
      setMinHours("24")
      toast.success("Cancellation policy removed")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove policy")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Shop Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, hours, and policies</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shop Name</label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={profileForm.address}
                onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Locality</label>
                <Input
                  value={profileForm.locality}
                  onChange={(e) => setProfileForm((f) => ({ ...f, locality: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Input
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, timezone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={updateShopMutation.isPending} className="w-full sm:w-auto">
                {updateShopMutation.isPending ? "Saving..." : "Save Shop Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shop Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.dayOfWeek}
              className="flex flex-col gap-3 border-b border-border/60 pb-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="w-28 font-medium">{DAY_LABELS[row.dayOfWeek]}</div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={row.closed}
                    onChange={(e) => updateRow(row.dayOfWeek, { closed: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  Closed
                </label>
                {!row.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={row.openTime}
                      onChange={(e) => updateRow(row.dayOfWeek, { openTime: e.target.value })}
                      className="w-28"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input
                      type="time"
                      value={row.closeTime}
                      onChange={(e) => updateRow(row.dayOfWeek, { closeTime: e.target.value })}
                      className="w-28"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Button onClick={handleSaveAll} disabled={setHours.isPending} className="w-full sm:w-auto">
              {setHours.isPending ? "Saving..." : "Save Hours"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Closed Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="sm:w-44" />
            <Input
              placeholder="Reason (optional)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddClosedDate} disabled={addClosed.isPending || !newDate}>
              Add
            </Button>
          </div>

          <div className="space-y-2 mt-4">
            {closedDates?.length === 0 && (
              <div className="rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground border border-border/60">
                No upcoming closed dates.
              </div>
            )}
            {closedDates?.map((cd) => (
              <div key={cd.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-foreground">{cd.closedDate}</span>
                  {cd.reason && <span className="ml-2 text-muted-foreground">{cd.reason}</span>}
                </div>
                <button
                  onClick={() => removeClosed.mutate(cd.id)}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {policyLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              {policy && (
                <p className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/60">{policy.description}</p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex flex-wrap items-center gap-2 text-sm">
                  Customers must cancel at least
                  <Input
                    type="number"
                    min={1}
                    value={minHours}
                    onChange={(e) => setMinHours(e.target.value)}
                    className="w-20"
                  />
                  hour(s) before their appointment.
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSavePolicy} disabled={upsertPolicy.isPending}>
                  {upsertPolicy.isPending ? "Saving..." : "Save Policy"}
                </Button>
                {policy && (
                  <Button
                    variant="outline"
                    onClick={handleRemovePolicy}
                    disabled={deletePolicy.isPending}
                  >
                    Remove Policy
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}