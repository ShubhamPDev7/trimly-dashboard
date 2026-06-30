export interface InventoryResponse {
  id: string
  shopId: string
  name: string
  description: string | null
  unit: string | null
  quantityInStock: number
  lowStockThreshold: number | null
  costPerUnit: number | null
  lowStock: boolean
  createdAt: string
  updatedAt: string
}

export interface InventoryRequest {
  name: string
  description?: string
  unit?: string
  quantityInStock: number
  lowStockThreshold?: number
  costPerUnit?: number
}