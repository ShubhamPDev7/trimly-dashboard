import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Store } from "lucide-react"
import { createShop } from "@/api/shop"
import { useAuthStore } from "@/store/authStore"
import { useShopStore } from "@/store/shopStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function CreateShopPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const email = useAuthStore((s) => s.email)
  const name = useAuthStore((s) => s.name)
  const userId = useAuthStore((s) => s.userId)
  const role = useAuthStore((s) => s.role)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const setSelectedShopId = useShopStore((s) => s.setSelectedShopId)

  const [shopName, setShopName] = useState("")
  const [address, setAddress] = useState("")
  const [locality, setLocality] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const shop = await createShop({ name: shopName, address, locality })

      if (shop.token && userId && name && email && role && refreshToken) {
        setAuth({
          accessToken: shop.token,
          refreshToken,
          userId,
          name,
          email,
          role,
        })
      }

      setSelectedShopId(shop.id)
      toast.success("Shop created!")
      navigate("/")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create shop")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]">
            <Store className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Let's set up your shop
            </h1>
            <p className="text-sm text-muted-foreground">
              One quick step and you're ready to start taking bookings.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft-lg)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="shopName">Shop name</Label>
              <Input
                id="shopName"
                placeholder="e.g. Shubham's Barber Shop"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Shop no, street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locality">Locality</Label>
              <Input
                id="locality"
                placeholder="Area, city"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating your shop..." : "Create Shop"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can always add more shop details later from Settings.
        </p>
      </motion.div>
    </div>
  )
}