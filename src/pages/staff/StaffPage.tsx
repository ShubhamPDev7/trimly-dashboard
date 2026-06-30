import { useState } from "react"
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
import { Trash2, Plus } from "lucide-react"

export default function StaffPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const currentUserId = useAuthStore((s) => s.userId)
  const { data: staff, isLoading } = useStaffList(shopId)
  const addMutation = useAddStaff(shopId)
  const removeMutation = useRemoveStaff(shopId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<StaffRole>("STAFF")

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

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this staff member?")) return
    try {
      await removeMutation.mutateAsync(userId)
      toast.success("Staff removed")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove staff")
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Staff</h1>
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
        <p className="text-sm text-muted-foreground">No staff yet.</p>
      )}

      <div className="space-y-2">
        {staff?.map((s) => (
          <Card key={s.userId}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.roleInShop === "OWNER" ? "default" : "secondary"}>
                  {s.roleInShop}
                </Badge>
                {s.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemove(s.userId)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}