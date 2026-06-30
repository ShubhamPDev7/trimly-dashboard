import { jwtDecode } from "jwt-decode"

interface TrimlyJwtPayload {
  sub: string
  userId: string
  role: string
  shopIds: string[]
  iat: number
  exp: number
}

export function decodeShopIds(token: string): string[] {
  try {
    const payload = jwtDecode<TrimlyJwtPayload>(token)
    return payload.shopIds || []
  } catch {
    return []
  }
}