export interface CancellationPolicyRequest {
  minHoursBeforeCancel: number
}

export interface CancellationPolicyResponse {
  id: string
  shopId: string
  minHoursBeforeCancel: number
  description: string
  createdAt: string
  updatedAt: string
}