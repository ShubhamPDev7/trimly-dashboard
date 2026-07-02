import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Scissors } from "lucide-react"
import PhoneInput from "@/components/shared/PhoneInput"
import { loginRequest, registerRequest, forgotPasswordRequest } from "@/api/auth"
import { sendOtpRequest, verifyOtpRequest } from "@/api/otp"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Mode = "signin" | "signup"

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [mode, setMode] = useState<Mode>("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
const [forgotEmail, setForgotEmail] = useState("")
const [forgotLoading, setForgotLoading] = useState(false)
const [forgotSent, setForgotSent] = useState(false)
const [useOtp, setUseOtp] = useState(false)
  const [otpPhone, setOtpPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone")
  const [otpLoading, setOtpLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data =
        mode === "signin"
          ? await loginRequest({ email, password })
          : await registerRequest({ name, email, phone, password, role: "OWNER" })

      setAuth({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      })
      toast.success(mode === "signin" ? "Welcome back!" : "Account created!")
      navigate("/")
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || (mode === "signin" ? "Login failed" : "Sign up failed")
      )
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await forgotPasswordRequest({ email: forgotEmail })
      setForgotSent(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send reset link")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpLoading(true)
    try {
      await sendOtpRequest(otpPhone)
      setOtpStep("code")
      toast.success("OTP sent!")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpLoading(true)
    try {
      const data = await verifyOtpRequest(otpPhone, otpCode)
      setAuth({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      })
      toast.success("Welcome!")
      navigate("/")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP")
    } finally {
      setOtpLoading(false)
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
            <Scissors className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Trimly</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to manage your shop" : "Set up your shop in minutes"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft-lg)]">
          {/* Segmented toggle */}
          <div className="mb-5 flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors",
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "signup" ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Shubham Pawar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput id="phone" value={phone} onChange={setPhone} required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
              {mode === "signin" && (
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true)
                      setForgotSent(false)
                      setForgotEmail(email)
                    }}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseOtp(true)
                      setOtpStep("phone")
                    }}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Sign in with OTP
                  </button>
                </div>
              )}
            </motion.form>
          </AnimatePresence>

          {mode === "signin" && useOtp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 border-t border-border/60 pt-4"
            >
              {otpStep === "phone" ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="otpPhone">Phone Number</Label>
                    <PhoneInput id="otpPhone" value={otpPhone} onChange={setOtpPhone} required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={otpLoading}>
                      {otpLoading ? "Sending..." : "Send OTP"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setUseOtp(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="otpCode">Enter OTP sent to {otpPhone}</Label>
                    <Input
                      id="otpCode"
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={otpLoading}>
                      {otpLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setOtpStep("phone")}>
                      Back
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Trimly Dashboard for shop owners &amp; staff
        </p>
      </motion.div>
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {forgotSent
                ? "Check your email for a link to reset your password."
                : "Enter your account email and we'll send you a reset link."}
            </DialogDescription>
          </DialogHeader>
          {!forgotSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgotEmail">Email</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <Button className="w-full" onClick={() => setForgotOpen(false)}>
              Got it
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}