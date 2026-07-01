import { useState } from "react"
import { motion } from "framer-motion"
import { useShopStore } from "@/store/shopStore"
import { useAuthStore } from "@/store/authStore"
import { useStaffList, useAddStaff, useRemoveStaff } from "@/hooks/useStaff"
import type { StaffRole } from "@/types/staff"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
import { Trash2, Plus, Clock, UserCircle, CalendarOff } from "lucide-react"
import StaffShiftDialog from "@/components/shared/StaffShiftDialog"
import BarberProfileDialog from "@/components/shared/BarberProfileDialog"
import StaffLeaveDialog from "@/components/shared/StaffLeaveDialog"

const listStagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function StaffPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const currentUserId = useAuthStore((s) => s.userId)
  const { data: staff, isLoading } = useStaffList(shopId)
  const addMutation = useAddStaff(shopId)
  const removeMutation = useRemoveStaff(shopId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<StaffRole>("STAFF")
  
  // New state for custom confirm dialog
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  
  const [profileDialogStaff, setProfileDialogStaff] = useState<{ id: string; name: string } | null>(null)
  const [shiftDialogStaff, setShiftDialogStaff] = useState<{ id: string; name: string } | null>(null)
  const [leaveDialogStaff, setLeaveDialogStaff] = useState<{ id: string; name: string } | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addMutation.mutateAsync({ email, roleInShop: role })
      toast.success("Staff added")
      setEmail("")
      setRole("STAFF")
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to add staff. Make sure they already have a Trimly account."
      )
    }
  }

  // Refactored to actually execute the removal when confirmed from the modal
  const executeRemove = async () => {
    if (!removeTarget) return
    try {
      await removeMutation.mutateAsync(removeTarget)
      toast.success("Staff removed")
      setRemoveTarget(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove staff")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Staff</h1>
          <p className="text-sm text-muted-foreground">Team members and permissions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The person must already have a Trimly account (registered via the app) before
                you can add them as staff.
              </p>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">STAFF</SelectItem>
                    <SelectItem value="OWNER">OWNER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addMutation.isPending} className="w-full">
                  {addMutation.isPending ? "Adding..." : "Add Staff"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isLoading && staff?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No staff yet.
          </CardContent>
        </Card>
      )}

      <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-2.5">
        {staff?.map((s) => (
          <motion.div key={s.userId} variants={listItem}>
            <Card>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {s.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{s.email}</div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Badge variant={s.roleInShop === "OWNER" ? "default" : "secondary"} className="mr-1.5">
                    {s.roleInShop}
                  </Badge>

                  <button
                    onClick={() => setProfileDialogStaff({ id: s.userId, name: s.name })}
                    title="Public Profile"
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <UserCircle className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setShiftDialogStaff({ id: s.userId, name: s.name })}
                    title="Weekly Shifts"
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <Clock className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setLeaveDialogStaff({ id: s.userId, name: s.name })}
                    title="Leaves"
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <CalendarOff className="h-4 w-4" />
                  </button>

                  {s.userId !== currentUserId && (
                    <button
                      onClick={() => setRemoveTarget(s.userId)}
                      title="Remove Staff"
                      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Custom Confirmation Modal for Removing Staff */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Member?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this staff member? They will lose access to the shop immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={executeRemove} 
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removing..." : "Yes, Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StaffShiftDialog
        staffUserId={shiftDialogStaff?.id ?? null}
        staffName={shiftDialogStaff?.name ?? ""}
        open={!!shiftDialogStaff}
        onOpenChange={(open) => !open && setShiftDialogStaff(null)}
      />

      <BarberProfileDialog
        staffUserId={profileDialogStaff?.id ?? null}
        staffName={profileDialogStaff?.name ?? ""}
        open={!!profileDialogStaff}
        onOpenChange={(open) => !open && setProfileDialogStaff(null)}
      />

      <StaffLeaveDialog
        staffUserId={leaveDialogStaff?.id ?? null}
        staffName={leaveDialogStaff?.name ?? ""}
        open={!!leaveDialogStaff}
        onOpenChange={(open) => !open && setLeaveDialogStaff(null)}
      />
    </div>
  )
}