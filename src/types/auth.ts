export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone?: string
  password: string
  role: "OWNER" | "CUSTOMER"
}

export interface AuthResponse {
  token: string
  refreshToken: string
  userId: string
  name: string
  email: string
  role: string
}