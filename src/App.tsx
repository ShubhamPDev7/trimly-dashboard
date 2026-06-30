import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import LoginPage from "@/pages/auth/LoginPage"
import CreateShopPage from "@/pages/auth/CreateShopPage"
import ProtectedRoute from "@/components/shared/ProtectedRoute"
import AppShell from "@/layouts/AppShell"
import HoursPage from "@/pages/settings/HoursPage"
import ServicesPage from "@/pages/services/ServicesPage"
import StaffPage from "@/pages/staff/StaffPage"
import BookingsPage from "@/pages/bookings/BookingsPage"
import QueuePage from "@/pages/queue/QueuePage"
import InventoryPage from "@/pages/inventory/InventoryPage"
import ReviewsPage from "@/pages/reviews/ReviewsPage"
import TodayPage from "@/pages/dashboard/TodayPage"
import SubscriptionPage from "@/pages/subscription/SubscriptionPage"



function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<CreateShopPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/settings" element={<HoursPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App