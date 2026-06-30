import { apiClient } from "./client"
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"

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