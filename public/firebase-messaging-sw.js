importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyA4c_kQpSvV56MKjUenEp6Db-mvsrYOEP4",
  authDomain: "trimly-3162a.firebaseapp.com",
  projectId: "trimly-3162a",
  storageBucket: "trimly-3162a.firebasestorage.app",
  messagingSenderId: "300259777014",
  appId: "1:300259777014:web:635636e040768220ab0fd7",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || "Trimly", {
    body: body || "",
    icon: "/favicon.svg",
  })
})