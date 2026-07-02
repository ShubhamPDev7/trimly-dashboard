import { apiClient } from "./client"
import type { AuthResponse } from "@/types/auth"
import type { UserProfileResponse } from "@/types/user"

export const sendOtpRequest = async (phone: string): Promise<void> => {
  await apiClient.post("/auth/send-otp", null, { params: { phone } })
}

export const verifyOtpRequest = async (phone: string, code: string): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/verify-otp", null, {
    params: { phone, code },
  })
  return res.data
}

export const sendPhoneLinkOtp = async (phone: string): Promise<void> => {
  await apiClient.post("/users/me/phone/send-otp", { phone })
}

export const verifyPhoneLink = async (phone: string, code: string): Promise<void> => {
  await apiClient.post("/users/me/phone/verify", { phone, code })
}

export const getMyProfile = async (): Promise<UserProfileResponse> => {
  const res = await apiClient.get<UserProfileResponse>("/users/me")
  return res.data
}