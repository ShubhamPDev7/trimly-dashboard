import { useEffect } from "react"
import { Outlet, NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  BarChart3,
  CalendarClock,
  Users,
  Scissors,
  Boxes,
  Star,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useShopStore } from "@/store/shopStore"
import { useShopProfile } from "@/hooks/useShopProfile"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Today", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/bookings", label: "Bookings", icon: CalendarClock },
  { to: "/queue", label: "Queue", icon: Users },
  { to: "/services", label: "Services", icon: Scissors },
  { to: "/staff", label: "Staff", icon: Users },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
]

const mobileNavItems = navItems.slice(0, 5)

export default function AppShell() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const name = useAuthStore((s) => s.name)
  const shopIds = useAuthStore((s) => s.shopIds)
  const selectedShopId = useShopStore((s) => s.selectedShopId)
  const setSelectedShopId = useShopStore((s) => s.setSelectedShopId)

  useEffect(() => {
    if (!selectedShopId && shopIds.length > 0) {
      setSelectedShopId(shopIds[0])
    }
  }, [selectedShopId, shopIds, setSelectedShopId])

  const { data: shop } = useShopProfile()

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-background">
        <div className="px-4 py-5 text-lg font-semibold">Trimly</div>
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 truncate text-sm text-muted-foreground">{name}</div>
          <button
            onClick={clearAuth}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:px-6">
          <div className="font-semibold">{shop?.name ?? "Trimly"}</div>
          <button onClick={clearAuth} className="text-sm text-muted-foreground md:hidden">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background md:hidden">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}