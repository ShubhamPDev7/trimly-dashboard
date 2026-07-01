import { useEffect, useState } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useFcmRegistration } from "@/hooks/useFcm"
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
  Menu,
  X,
  Scissors as Logo,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useShopStore } from "@/store/shopStore"
import { useShopProfile } from "@/hooks/useShopProfile"
import { cn } from "@/lib/utils"
import PageTransition from "@/components/shared/PageTransition"

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

const mobileNavItems = [
  navItems[0],
  navItems[2],
  navItems[3],
  navItems[4],
  navItems[9],
]

function NavList({
  onNavigate,
  layoutIdPrefix,
}: {
  onNavigate?: () => void
  layoutIdPrefix: string
}) {
  const location = useLocation()
  return (
    <nav className="flex-1 space-y-1 px-3">
      {navItems.map((item) => {
        const isActive =
          item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`${layoutIdPrefix}-active-pill`}
                className="absolute inset-0 rounded-xl bg-primary shadow-[var(--shadow-glow-primary)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <item.icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function AppShell() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const name = useAuthStore((s) => s.name)
  const shopIds = useAuthStore((s) => s.shopIds)
  const selectedShopId = useShopStore((s) => s.selectedShopId)
  const setSelectedShopId = useShopStore((s) => s.setSelectedShopId)
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!selectedShopId && shopIds.length > 0) {
      setSelectedShopId(shopIds[0])
    }
  }, [selectedShopId, shopIds, setSelectedShopId])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const { data: shop } = useShopProfile()
  useFcmRegistration()

  const activeMobileIndex = mobileNavItems.findIndex((item) =>
    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-r md:border-border/60 md:bg-sidebar">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]">
            <Logo className="h-4.5 w-4.5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">Trimly</span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
          <NavList layoutIdPrefix="desktop" />
        </div>
        <div className="border-t border-border/60 p-3">
          <div className="mb-1 truncate px-1 text-sm font-medium">{name}</div>
          <button
            onClick={clearAuth}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-sidebar shadow-[var(--shadow-soft-lg)] safe-top safe-bottom md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]">
                    <Logo className="h-4.5 w-4.5" />
                  </span>
                  <span className="font-heading text-lg font-semibold tracking-tight">Trimly</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
                <NavList layoutIdPrefix="mobile" onNavigate={() => setMobileMenuOpen(false)} />
              </div>
              <div className="border-t border-border/60 p-3">
                <div className="mb-1 truncate px-1 text-sm font-medium">{name}</div>
                <button
                  onClick={clearAuth}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3.5 backdrop-blur-md safe-top md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex size-8 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-heading text-base font-semibold tracking-tight md:text-lg">
              {shop?.name ?? "Trimly"}
            </span>
          </div>
          <button
            onClick={clearAuth}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:hidden"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </header>

        <main className="flex-1 pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>

        {/* Mobile floating bottom nav */}
        <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl border border-border/60 bg-background/95 px-1 py-1.5 shadow-[var(--shadow-soft-lg)] backdrop-blur-md safe-bottom md:hidden">
          {mobileNavItems.map((item, i) => {
            const isActive = i === activeMobileIndex
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10.5px] font-medium"
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-x-2 inset-y-0.5 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative z-10 h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className={cn("relative z-10", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}