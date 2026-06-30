import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useAuthStore } from "@/store/authStore"
import {
  useSubscription,
  useCreateSubscriptionOrder,
  useCancelSubscription,
} from "@/hooks/useSubscription"
import { loadRazorpayScript } from "@/lib/razorpay"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Check } from "lucide-react"
import { toast } from "sonner"
import type { SubscriptionPlan } from "@/types/subscription"
import { useQueryClient } from "@tanstack/react-query"

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined

interface PlanInfo {
  plan: SubscriptionPlan
  title: string
  price: string
  features: string[]
}

const planRank: Record<SubscriptionPlan, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 }

const plans: PlanInfo[] = [
  {
    plan: "FREE",
    title: "Free",
    price: "₹0/mo",
    features: ["Up to 2 staff", "100 bookings/mo", "Bookings & queue"],
  },
  {
    plan: "PRO",
    title: "Pro",
    price: "₹999/mo",
    features: [
      "Up to 10 staff",
      "1,000 bookings/mo",
      "Dashboard & analytics",
      "Staff performance reports",
    ],
  },
  {
    plan: "ENTERPRISE",
    title: "Enterprise",
    price: "Contact us",
    features: [
      "Unlimited staff",
      "Unlimited bookings",
      "Dashboard & analytics",
      "Multi-branch support",
    ],
  },
]

export default function SubscriptionPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const { name, email } = useAuthStore()
  const queryClient = useQueryClient()
  const [payingPlan, setPayingPlan] = useState<SubscriptionPlan | null>(null)

  const { data: subscription, isLoading } = useSubscription(shopId)
  const createOrderMutation = useCreateSubscriptionOrder(shopId)
  const cancelMutation = useCancelSubscription(shopId)

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!RAZORPAY_KEY_ID) {
      toast.error("Payments aren't configured yet — set VITE_RAZORPAY_KEY_ID")
      return
    }
    setPayingPlan(plan)
    try {
      const order = await createOrderMutation.mutateAsync(plan)
      await loadRazorpayScript()

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amountInPaise,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "Trimly",
        description: `Upgrade to ${plan}`,
        prefill: { name: name ?? undefined, email: email ?? undefined },
        handler: () => {
          toast.success("Payment received — your plan will update shortly")
          // webhook confirms the payment server-side; refetch after a short delay
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["subscription", shopId] })
          }, 3000)
        },
        modal: {
          ondismiss: () => setPayingPlan(null),
        },
      })

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.")
        setPayingPlan(null)
      })

      rzp.open()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start payment")
      setPayingPlan(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm("Cancel your subscription? You'll be moved back to the FREE plan.")) return
    try {
      await cancelMutation.mutateAsync()
      toast.success("Subscription cancelled")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel subscription")
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-lg font-semibold">Subscription & Billing</h1>
        {subscription && (
          <p className="mt-1 text-sm text-muted-foreground">
            Current plan: <span className="font-medium text-foreground">{subscription.plan}</span>
            {subscription.expiresAt &&
              ` · renews ${new Date(subscription.expiresAt).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {subscription && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = subscription.plan === p.plan
            const isUpgrade = planRank[p.plan] > planRank[subscription.plan]
            const isDowngrade = planRank[p.plan] < planRank[subscription.plan]
            return (
              <Card key={p.plan} className={isCurrent ? "border-primary" : undefined}>
                <CardContent className="flex h-full flex-col p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium">{p.title}</h2>
                    {isCurrent && <Badge>Current</Badge>}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{p.price}</div>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm text-muted-foreground">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isUpgrade && p.plan !== "ENTERPRISE" && (
                    <Button
                      className="mt-4 w-full"
                      disabled={payingPlan === p.plan}
                      onClick={() => handleUpgrade(p.plan)}
                    >
                      {payingPlan === p.plan ? "Processing..." : `Upgrade to ${p.title}`}
                    </Button>
                  )}
                  {isUpgrade && p.plan === "ENTERPRISE" && (
                    <Button variant="outline" className="mt-4 w-full" disabled>
                      Contact sales
                    </Button>
                  )}
                  {isCurrent && p.plan !== "FREE" && (
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      disabled={cancelMutation.isPending}
                      onClick={handleCancel}
                    >
                      {cancelMutation.isPending ? "Cancelling..." : "Cancel plan"}
                    </Button>
                  )}
                  {isDowngrade && (
                    <div className="mt-4 text-center text-xs text-muted-foreground">
                      Included in your plan
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}