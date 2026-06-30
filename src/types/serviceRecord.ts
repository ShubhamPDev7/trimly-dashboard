export interface ServiceRecordResponse {
  id: string
  shopId: string
  staffId: string
  customerId: string | null
  bookingId: string | null
  walkInQueueEntryId: string | null
  notes: string | null
  productsUsed: string[]
  photoUrls: string[]
  createdAt: string
}

export interface ServiceRecordRequest {
  notes?: string
  productsUsed?: string[]
  photoUrls?: string[]
}