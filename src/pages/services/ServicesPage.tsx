import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/useServices"
import type { ServiceItemResponse, ServiceCategory } from "@/types/service"
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
import { Pencil, Trash2, Plus } from "lucide-react"

const CATEGORIES: ServiceCategory[] = ["MALE", "FEMALE", "CHILDREN"]

interface FormState {
  category: ServiceCategory
  name: string
  price: string
  estTimeMinutes: string
}

const emptyForm: FormState = { category: "MALE", name: "", price: "", estTimeMinutes: "" }

export default function ServicesPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { data: services, isLoading } = useServices(shopId)
  const createMutation = useCreateService(shopId)
  const updateMutation = useUpdateService(shopId)
  const deleteMutation = useDeleteService(shopId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (service: ServiceItemResponse) => {
    setEditingId(service.id)
    setForm({
      category: service.category,
      name: service.name,
      price: String(service.price),
      estTimeMinutes: service.estTimeMinutes ? String(service.estTimeMinutes) : "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      category: form.category,
      name: form.name,
      price: Number(form.price),
      estTimeMinutes: form.estTimeMinutes ? Number(form.estTimeMinutes) : null,
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ serviceId: editingId, data: payload })
        toast.success("Service updated")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Service added")
      }
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save service")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Service deleted")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete service")
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Services</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Service" : "Add Service"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as ServiceCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.estTimeMinutes}
                    onChange={(e) => setForm((f) => ({ ...f, estTimeMinutes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : editingId ? "Update Service" : "Add Service"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!isLoading && services?.length === 0 && (
        <p className="text-sm text-muted-foreground">No services yet. Add your first one.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services?.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <Badge variant="secondary" className="mt-1">
                    {s.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold">₹{s.price}</span>
                {s.estTimeMinutes != null && (
                  <span className="text-muted-foreground">{s.estTimeMinutes} min</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}