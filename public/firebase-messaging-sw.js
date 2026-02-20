importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAd5SlNdTEP-ykh4vyLZAsLRPOXaOK_gl8",
  authDomain: "super-tasty-admin.firebaseapp.com",
  projectId: "super-tasty-admin",
  storageBucket: "super-tasty-admin.firebasestorage.app",
  messagingSenderId: "578115975814",
  appId: "1:578115975814:web:1fb7a73e1b020747336f07"
});

const messaging = firebase.messaging();

// 👇 ESTE BLOQUE ES CLAVE
self.addEventListener("push", function(event) {
  const data = event.data?.json() || {};

  const title = data.notification?.title || "🔥 Nuevo pedido";
  const options = {
    body: data.notification?.body || "Tienes un nuevo pedido",
    icon: "/logo192.png",
    badge: "/logo192.png"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});