importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAd5SlNdTEP-ykh4vyLZAsLRPOXaOK_gl8",
  authDomain: "super-tasty-admin.firebaseapp.com",
  projectId: "super-tasty-admin",
  storageBucket: "super-tasty-admin.firebasestorage.app",
  messagingSenderId: "578115975814",
  appId: "1:578115975814:web:1fb7a73e1b020747336f07"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192.png",
    vibrate: [200,100,200]
  });
});