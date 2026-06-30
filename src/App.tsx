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

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<CreateShopPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<div className="p-6">Today placeholder</div>} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reviews" element={<div className="p-6">Reviews placeholder</div>} />
            <Route path="/settings" element={<HoursPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App