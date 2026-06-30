export interface ReviewResponse {
  id: string
  shopId: string
  reviewerId: string
  bookingId: string | null
  walkInQueueEntryId: string | null
  rating: number
  comment: string | null
  ownerReply: string | null
  ownerRepliedAt: string | null
  createdAt: string
}

export interface ShopRatingSummaryResponse {
  averageRating: number
  totalReviews: number
}

export interface OwnerReplyRequest {
  reply: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}