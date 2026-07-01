import { useEffect } from "react"
import { toast } from "sonner"
import { requestFcmToken, listenForForegroundMessages } from "@/lib/firebase"
import { registerFcmToken } from "@/api/fcm"
import { useAuthStore } from "@/store/authStore"

export function useFcmRegistration() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    requestFcmToken().then((token) => {
      if (cancelled || !token) return
      registerFcmToken(token).catch((err) => {
        console.error("Failed to register FCM token", err)
      })
    })

    listenForForegroundMessages((title, body) => {
      toast.info(title, { description: body })
    })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])
}