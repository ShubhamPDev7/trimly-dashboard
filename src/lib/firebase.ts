import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export async function requestFcmToken(): Promise<string | null> {
  const supported = await isSupported()
  if (!supported) return null

  const permission = await Notification.requestPermission()
  if (permission !== "granted") return null

  const messaging = getMessaging(app)
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    return token || null
  } catch (err) {
    console.error("Failed to get FCM token", err)
    return null
  }
}

export function listenForForegroundMessages(callback: (title: string, body: string) => void) {
  isSupported().then((supported) => {
    if (!supported) return
    const messaging = getMessaging(app)
    onMessage(messaging, (payload) => {
      callback(payload.notification?.title ?? "", payload.notification?.body ?? "")
    })
  })
}