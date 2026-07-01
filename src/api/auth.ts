import { apiClient } from "./client"
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"
import type { ForgotPasswordRequest, ResetPasswordRequest, MessageResponse } from "@/types/passwordReset"

export const loginRequest = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/login", data)
  return res.data
}

export const registerRequest = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/auth/register", data)
  return res.data
}

export const logoutRequest = async (refreshToken: string): Promise<void> => {
  await apiClient.post("/auth/logout", { refreshToken })
}

export const forgotPasswordRequest = async (
  data: ForgotPasswordRequest
): Promise<MessageResponse> => {
  const res = await apiClient.post<MessageResponse>("/auth/forgot-password", data)
  return res.data
}

export const resetPasswordRequest = async (
  data: ResetPasswordRequest
): Promise<MessageResponse> => {
  const res = await apiClient.post<MessageResponse>("/auth/reset-password", data)
  return res.data
}

