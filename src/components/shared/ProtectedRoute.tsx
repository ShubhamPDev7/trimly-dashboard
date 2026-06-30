import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const shopIds = useAuthStore((s) => s.shopIds)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (shopIds.length === 0) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}