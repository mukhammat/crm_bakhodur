// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - same as in main app
const firebaseConfig = {
  apiKey: "AIzaSyC3h0KwYT8HLZY2XL6Qo0ayMNHH8Ufosm4",
  authDomain: "crm-bakhodur.firebaseapp.com",
  projectId: "crm-bakhodur",
  storageBucket: "crm-bakhodur.firebasestorage.app",
  messagingSenderId: "959435295988",
  appId: "1:959435295988:web:2acce44aa7e6cec52022a1",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle skip waiting message (for activating waiting service worker)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: payload.data?.taskId || 'notification',
    data: payload.data,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
