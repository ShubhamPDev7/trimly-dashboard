import { useState } from "react"
import { motion } from "framer-motion"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Check, Crown } from "lucide-react"
import { toast } from "sonner"
import type { SubscriptionPlan } from "@/types/subscription"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined

interface PlanInfo {
  plan: SubscriptionPlan
  title: string
  price: string
  features: string[]
  highlight?: boolean
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
    highlight: true,
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
  
  // New state for custom confirm dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  
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

  // Refactored to actually execute the cancellation when confirmed from the modal
  const executeCancel = async () => {
    try {
      await cancelMutation.mutateAsync()
      toast.success("Subscription cancelled")
      setCancelDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel subscription")
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Subscription & Billing</h1>
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
          {plans.map((p, i) => {
            const isCurrent = subscription.plan === p.plan
            const isUpgrade = planRank[p.plan] > planRank[subscription.plan]
            const isDowngrade = planRank[p.plan] < planRank[subscription.plan]
            return (
              <motion.div
                key={p.plan}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className={cn(
                    "h-full",
                    p.highlight && "relative overflow-visible border-transparent bg-ink text-ink-foreground shadow-[var(--shadow-glow-primary)]",
                    isCurrent && !p.highlight && "border-primary/60"
                  )}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gold px-3 py-1 text-[0.68rem] font-semibold tracking-wide text-gold-foreground uppercase shadow-[var(--shadow-soft)]">
                      <Crown className="h-3 w-3" />
                      Most popular
                    </div>
                  )}
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading font-semibold">{p.title}</h2>
                      {isCurrent && (
                        <Badge variant={p.highlight ? "gold" : "default"}>Current</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight">{p.price}</div>
                    <ul
                      className={cn(
                        "mt-4 flex-1 space-y-2 text-sm",
                        p.highlight ? "text-ink-foreground/75" : "text-muted-foreground"
                      )}
                    >
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", p.highlight ? "text-gold" : "text-primary")} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isUpgrade && p.plan !== "ENTERPRISE" && (
                      <Button
                        className={cn("mt-5 w-full", p.highlight && "bg-gold text-gold-foreground shadow-none hover:bg-gold/90")}
                        disabled={payingPlan === p.plan}
                        onClick={() => handleUpgrade(p.plan)}
                      >
                        {payingPlan === p.plan ? "Processing..." : `Upgrade to ${p.title}`}
                      </Button>
                    )}
                    {isUpgrade && p.plan === "ENTERPRISE" && (
                      <Button variant="outline" className="mt-5 w-full" disabled>
                        Contact sales
                      </Button>
                    )}
                    
                    {isCurrent && p.plan !== "FREE" && (
                      <Button
                        variant="outline"
                        className={cn(
                          "mt-5 w-full",
                          p.highlight && "bg-transparent border border-white/20 text-white hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        Cancel plan
                      </Button>
                    )}

                    {isDowngrade && (
                      <div className="mt-5 text-center text-xs text-muted-foreground">
                        Included in your plan
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Custom Confirmation Modal for Cancelling Subscription */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access to premium features and be moved back to the FREE plan at the end of your billing cycle.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Plan
            </Button>
            <Button 
              variant="destructive" 
              onClick={executeCancel} 
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}