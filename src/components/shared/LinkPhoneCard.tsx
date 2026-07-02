import { useEffect, useState } from "react"
import { sendPhoneLinkOtp, verifyPhoneLink, getMyProfile } from "@/api/otp"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"
import PhoneInput from "@/components/shared/PhoneInput"

export default function LinkPhoneCard() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const authState = useAuthStore()

  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [loading, setLoading] = useState(false)
  const [linkedPhone, setLinkedPhone] = useState<string | null | undefined>(undefined)

  const loadProfile = async () => {
    try {
      const profile = await getMyProfile()
      setLinkedPhone(profile.phone)
    } catch {
      setLinkedPhone(null)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPhoneLinkOtp(phone)
      setStep("code")
      toast.success("OTP sent!")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await verifyPhoneLink(phone, code)
      toast.success("Phone number linked! You can now sign in with OTP using this number.")
      setLinkedPhone(phone)
      setStep("phone")
      setPhone("")
      setCode("")
      setAuth({
        accessToken: authState.accessToken!,
        refreshToken: authState.refreshToken!,
        userId: authState.userId!,
        name: authState.name!,
        email: authState.email!,
        role: authState.role!,
      })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Phone Number</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkedPhone === undefined && <Skeleton className="h-10 w-full" />}

        {linkedPhone !== undefined && linkedPhone && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>
              <span className="font-medium">{linkedPhone}</span> is linked — you can sign in with OTP using this number.
            </span>
          </div>
        )}

        {linkedPhone !== undefined && !linkedPhone && (
          <>
            <p className="text-sm text-muted-foreground">
              Link a phone number to your account so you can sign in with OTP instead of a password.
            </p>

            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1 space-y-1.5">
                  <Label>Phone Number</Label>
                  <PhoneInput value={phone} onChange={setPhone} required />
                </div>
                <Button type="submit" disabled={loading} className="sm:self-end">
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleVerify} className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1 space-y-1.5">
                  <Label>Enter OTP sent to {phone}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="sm:self-end">
                  {loading ? "Verifying..." : "Verify & Link"}
                </Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}