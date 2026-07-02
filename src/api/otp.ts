import { apiClient } from "./client"
import type { AuthResponse } from "@/types/auth"

export const sendOtpRequest = async (phone: string): Promise<void> => {
  await apiClient.post("/auth/send-otp", null, { params: { phone } })
}

export const verifyOtpRequest = async (phone: string, code: string): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/verify-otp", null, {
    params: { phone, code },
  })
  return res.data
}