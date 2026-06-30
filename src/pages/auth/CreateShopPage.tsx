import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createShop } from "@/api/shop"
import { useAuthStore } from "@/store/authStore"
import { useShopStore } from "@/store/shopStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

      // Backend returns a fresh JWT with the new shopId embedded — update auth store
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
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Set up your shop</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop name</Label>
              <Input id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locality">Locality</Label>
              <Input id="locality" value={locality} onChange={(e) => setLocality(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Shop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}