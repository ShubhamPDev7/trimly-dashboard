import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import {
  useInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from "@/hooks/useInventory"
import type { InventoryResponse } from "@/types/inventory"
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
import { toast } from "sonner"
import { Pencil, Trash2, Plus } from "lucide-react"

interface FormState {
  name: string
  description: string
  unit: string
  quantityInStock: string
  lowStockThreshold: string
  costPerUnit: string
}

const emptyForm: FormState = {
  name: "",
  description: "",
  unit: "",
  quantityInStock: "",
  lowStockThreshold: "",
  costPerUnit: "",
}

export default function InventoryPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { data: items, isLoading } = useInventory(shopId)
  const createMutation = useCreateInventoryItem(shopId)
  const updateMutation = useUpdateInventoryItem(shopId)
  const deleteMutation = useDeleteInventoryItem(shopId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: InventoryResponse) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      description: item.description ?? "",
      unit: item.unit ?? "",
      quantityInStock: String(item.quantityInStock),
      lowStockThreshold: item.lowStockThreshold != null ? String(item.lowStockThreshold) : "",
      costPerUnit: item.costPerUnit != null ? String(item.costPerUnit) : "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      description: form.description || undefined,
      unit: form.unit || undefined,
      quantityInStock: Number(form.quantityInStock),
      lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : undefined,
      costPerUnit: form.costPerUnit ? Number(form.costPerUnit) : undefined,
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ itemId: editingId, data: payload })
        toast.success("Item updated")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Item added")
      }
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save item")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inventory item?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Item deleted")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete item")
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Inventory</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Item" : "Add Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Unit (e.g. ml, pcs)</Label>
                  <Input
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity in Stock</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.quantityInStock}
                    onChange={(e) => setForm((f) => ({ ...f, quantityInStock: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.lowStockThreshold}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Per Unit (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.costPerUnit}
                    onChange={(e) => setForm((f) => ({ ...f, costPerUnit: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
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

      {!isLoading && items?.length === 0 && (
        <p className="text-sm text-muted-foreground">No inventory items yet.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.lowStock && (
                    <Badge className="mt-1 border-0 bg-red-100 text-red-800 hover:bg-red-100">
                      Low Stock
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {item.quantityInStock} {item.unit ?? "units"} in stock
              </div>
              {item.costPerUnit != null && (
                <div className="text-sm text-muted-foreground">₹{item.costPerUnit}/unit</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}