export type PaymentMode = "CASH" | "ONLINE" | "UPI" | "RAZORPAY"
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

export interface BillRequest {
  paymentMode: PaymentMode
}

export interface BillResponse {
  id: string
  shopId: string
  bookingId: string | null
  totalAmount: number
  paymentMode: PaymentMode
  paymentStatus: PaymentStatus
  createdAt: string
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
}