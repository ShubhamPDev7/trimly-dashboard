import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useInventory } from "@/hooks/useInventory"
import {
  useCreateServiceRecordForBooking,
  useCreateServiceRecordForWalkIn,
  useRecordInventoryUsage,
} from "@/hooks/useServiceRecord"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ImageUpload from "@/components/shared/ImageUpload"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: { type: "booking" | "walkin"; id: string } | null
  customerName?: string | null
}

interface UsageRow {
  inventoryItemId: string
  quantityUsed: string
}

export default function ServiceRecordDialog({ open, onOpenChange, target, customerName }: Props) {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { data: inventory } = useInventory(shopId)

  const createForBooking = useCreateServiceRecordForBooking(shopId)
  const createForWalkIn = useCreateServiceRecordForWalkIn(shopId)
  const recordUsage = useRecordInventoryUsage(shopId)

  const [notes, setNotes] = useState("")
  const [productInput, setProductInput] = useState("")
  const [productsUsed, setProductsUsed] = useState<string[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [usageRows, setUsageRows] = useState<UsageRow[]>([])

  const reset = () => {
    setNotes("")
    setProductInput("")
    setProductsUsed([])
    setPhotoUrls([])
    setUsageRows([])
  }

  const addProduct = () => {
    if (!productInput.trim()) return
    setProductsUsed((prev) => [...prev, productInput.trim()])
    setProductInput("")
  }

  const removeProduct = (idx: number) => {
    setProductsUsed((prev) => prev.filter((_, i) => i !== idx))
  }

  const addUsageRow = () => {
    setUsageRows((prev) => [...prev, { inventoryItemId: "", quantityUsed: "" }])
  }

  const updateUsageRow = (idx: number, patch: Partial<UsageRow>) => {
    setUsageRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  const removeUsageRow = (idx: number) => {
    setUsageRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return

    try {
      const payload = {
        notes: notes || undefined,
        productsUsed: productsUsed.length > 0 ? productsUsed : undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      }

      const record =
        target.type === "booking"
          ? await createForBooking.mutateAsync({ bookingId: target.id, data: payload })
          : await createForWalkIn.mutateAsync({ entryId: target.id, data: payload })

      const validUsages = usageRows
        .filter((r) => r.inventoryItemId && r.quantityUsed)
        .map((r) => ({
          inventoryItemId: r.inventoryItemId,
          quantityUsed: Number(r.quantityUsed),
        }))

      if (validUsages.length > 0) {
        await recordUsage.mutateAsync({ serviceRecordId: record.id, usages: validUsages })
      }

      toast.success("Service record saved")
      reset()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save service record")
    }
  }

  const saving = createForBooking.isPending || createForWalkIn.isPending || recordUsage.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Service Record{customerName ? ` — ${customerName}` : ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Style notes, preferences, anything for next time..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Products Used</Label>
            <div className="flex gap-2">
              <Input
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="e.g. L'Oreal Pomade"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addProduct()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addProduct}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {productsUsed.map((p, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                >
                  {p}
                  <button type="button" onClick={() => removeProduct(idx)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="flex flex-wrap gap-3">
              {photoUrls.map((url, idx) => (
                <ImageUpload
                  key={idx}
                  folder="service-records"
                  value={url}
                  onChange={() => {}}
                  onRemove={() => setPhotoUrls((prev) => prev.filter((_, i) => i !== idx))}
                />
              ))}
              <ImageUpload
                folder="service-records"
                value={null}
                onChange={(url) => setPhotoUrls((prev) => [...prev, url])}
                onRemove={() => {}}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Inventory Used</Label>
              <Button type="button" size="sm" variant="outline" onClick={addUsageRow}>
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>
            {usageRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={row.inventoryItemId}
                  onChange={(e) => updateUsageRow(idx, { inventoryItemId: e.target.value })}
                  className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">Select item</option>
                  {inventory?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantityInStock} {item.unit ?? ""} left)
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Qty"
                  className="w-20"
                  value={row.quantityUsed}
                  onChange={(e) => updateUsageRow(idx, { quantityUsed: e.target.value })}
                />
                <button type="button" onClick={() => removeUsageRow(idx)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Service Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}