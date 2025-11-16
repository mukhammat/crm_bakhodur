import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';
import { apiClient } from './api';

// Firebase configuration - you'll need to add your Firebase config here
// Get this from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'crm-bakhodur',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

console.log(firebaseConfig);

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

// Check if Firebase config is complete
function isFirebaseConfigValid(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

// Register and wait for service worker to be ready
async function ensureServiceWorkerReady(): Promise<boolean> {
  console.log('[Notifications] ensureServiceWorkerReady called');
  
  if (!('serviceWorker' in navigator)) {
    console.error('[Notifications] Service Worker is not supported in this browser');
    return false;
  }

  try {
    console.log('[Notifications] Checking for existing service worker registration...');
    // Check if service worker is already registered
    let registration = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');
    
    if (!registration) {
      // Register service worker
      console.log('[Notifications] No existing registration found, registering service worker...');
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope',
      });
      console.log('[Notifications] Service worker registration started');
    } else {
      console.log('[Notifications] Found existing service worker registration');
    }

    // Check current state first
    console.log('[Notifications] Service worker state:', {
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      activeState: registration.active?.state,
      installingState: registration.installing?.state,
      waitingState: registration.waiting?.state,
    });

    // If already active, return immediately
    if (registration.active && registration.active.state === 'activated') {
      console.log('[Notifications] Service worker is already active');
      return true;
    }

    // Wait for service worker with timeout
    console.log('[Notifications] Waiting for service worker to be ready...');
    try {
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Service worker ready timeout')), 10000)
      );
      
      await Promise.race([readyPromise, timeoutPromise]);
      console.log('[Notifications] Service worker is ready');
    } catch (error: any) {
      console.warn('[Notifications] Service worker ready timeout or error:', error.message);
      // Continue anyway, check state manually
    }
    
    // Check state again after waiting
    console.log('[Notifications] Service worker state after wait:', {
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      activeState: registration.active?.state,
      installingState: registration.installing?.state,
      waitingState: registration.waiting?.state,
    });
    
    // Ensure service worker is active
    if (registration.active && registration.active.state === 'activated') {
      console.log('[Notifications] Service worker is active');
      return true;
    } else if (registration.installing) {
      console.log('[Notifications] Service worker is installing, waiting for activation...');
      // Wait for installation to complete with timeout
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Service worker activation timeout'));
          }, 10000);
          
          registration!.installing!.addEventListener('statechange', function() {
            console.log('[Notifications] Service worker state changed:', this.state);
            if (this.state === 'activated') {
              clearTimeout(timeout);
              console.log('[Notifications] Service worker activated');
              resolve();
            } else if (this.state === 'redundant') {
              clearTimeout(timeout);
              reject(new Error('Service worker became redundant'));
            }
          });
        });
        return true;
      } catch (error: any) {
        console.error('[Notifications] Error waiting for service worker activation:', error.message);
        return false;
      }
    } else if (registration.waiting) {
      console.log('[Notifications] Service worker is waiting, activating...');
      // Activate waiting service worker
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      try {
        const readyPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
        );
        await Promise.race([readyPromise, timeoutPromise]);
        console.log('[Notifications] Service worker activated');
        return true;
      } catch (error: any) {
        console.error('[Notifications] Error activating waiting service worker:', error.message);
        return false;
      }
    }

    console.error('[Notifications] Service worker is in unknown state');
    return false;
  } catch (error: any) {
    console.error('[Notifications] Error registering service worker:', error);
    console.error('[Notifications] Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return false;
  }
}

// Initialize Firebase only if config is valid
async function initializeFirebase(): Promise<boolean> {
  console.log('[Notifications] initializeFirebase called');
  
  if (typeof window === 'undefined') {
    console.error('[Notifications] Window is undefined (SSR)');
    return false;
  }

  console.log('[Notifications] Checking Firebase config validity...');
  if (!isFirebaseConfigValid()) {
    console.error('[Notifications] Firebase configuration is incomplete. Notifications will not work.');
    console.error('[Notifications] Please set the following environment variables:');
    console.error('- VITE_FIREBASE_API_KEY');
    console.error('- VITE_FIREBASE_AUTH_DOMAIN');
    console.error('- VITE_FIREBASE_PROJECT_ID');
    console.error('- VITE_FIREBASE_STORAGE_BUCKET');
    console.error('- VITE_FIREBASE_MESSAGING_SENDER_ID');
    console.error('- VITE_FIREBASE_APP_ID');
    console.error('[Notifications] Current config:', firebaseConfig);
    return false;
  }
  console.log('[Notifications] Firebase config is valid');

  try {
    console.log('[Notifications] Ensuring service worker is ready...');
    // Ensure service worker is ready before initializing Firebase Messaging
    const swReady = await ensureServiceWorkerReady();
    if (!swReady) {
      console.error('[Notifications] Service worker is not ready');
      return false;
    }
    console.log('[Notifications] Service worker is ready');

    console.log('[Notifications] Initializing Firebase app...');
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('[Notifications] Firebase app initialized');
    } else {
      app = getApps()[0];
      console.log('[Notifications] Using existing Firebase app');
    }

    console.log('[Notifications] Checking if messaging is supported...');
    // Check if messaging is supported
    const messagingSupported = await isSupported();
    console.log('[Notifications] Messaging supported:', messagingSupported);
    
    if (messagingSupported && 'serviceWorker' in navigator) {
      console.log('[Notifications] Getting messaging instance...');
      messaging = getMessaging(app);
      console.log('[Notifications] Messaging instance obtained');
      return true;
    } else {
      console.error('[Notifications] Firebase Messaging is not supported in this browser');
      return false;
    }
  } catch (error: any) {
    console.error('[Notifications] Error initializing Firebase:', error);
    console.error('[Notifications] Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function getFCMToken(): Promise<string | null> {
  console.log('[Notifications] getFCMToken called');
  
  // Initialize Firebase if not already initialized
  if (!messaging) {
    console.log('[Notifications] Messaging not initialized, initializing...');
    const initialized = await initializeFirebase();
    if (!initialized) {
      console.error('[Notifications] Firebase messaging initialization failed');
      return null;
    }
    console.log('[Notifications] Firebase messaging initialized successfully');
  } else {
    console.log('[Notifications] Messaging already initialized');
  }

  if (!messaging) {
    console.error('[Notifications] Messaging is still null after initialization');
    return null;
  }

  // Ensure service worker is still ready
  if ('serviceWorker' in navigator) {
    console.log('[Notifications] Checking service worker status...');
    const registration = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');
    if (!registration || !registration.active) {
      console.warn('[Notifications] Service worker is not active, waiting...');
      const swReady = await ensureServiceWorkerReady();
      if (!swReady) {
        console.error('[Notifications] Service worker failed to become ready');
        return null;
      }
      console.log('[Notifications] Service worker is now ready');
    } else {
      console.log('[Notifications] Service worker is active');
    }
  } else {
    console.error('[Notifications] Service Worker is not supported');
    return null;
  }

  try {
    console.log('[Notifications] Requesting notification permission...');
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.error('[Notifications] Notification permission denied by user');
      return null;
    }
    console.log('[Notifications] Notification permission granted');

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
    if (!vapidKey) {
      console.error('[Notifications] VAPID key is not configured. Set VITE_FIREBASE_VAPID_KEY in .env');
      console.error('[Notifications] To get VAPID key:');
      console.error('1. Go to Firebase Console > Project Settings > Cloud Messaging');
      console.error('2. Scroll to "Web configuration" > "Web Push certificates"');
      console.error('3. Click "Generate key pair" if no key exists');
      console.error('4. Copy the key and add it to frontend/.env as VITE_FIREBASE_VAPID_KEY=your-key');
      return null;
    }
    
    // Validate VAPID key format (should be base64 URL-safe string)
    if (vapidKey.length < 80) {
      console.error('[Notifications] VAPID key appears to be invalid (too short). Expected base64 URL-safe string.');
      console.error('[Notifications] VAPID key length:', vapidKey.length);
      console.error('[Notifications] VAPID key preview:', vapidKey.substring(0, 20) + '...');
      return null;
    }
    
    console.log('[Notifications] VAPID key found, requesting token...');
    console.log('[Notifications] VAPID key preview:', vapidKey.substring(0, 30) + '...');

    const token = await getToken(messaging, { vapidKey });
    if (token) {
      console.log('[Notifications] FCM token obtained successfully:', token.substring(0, 30) + '...');
      return token;
    } else {
      console.error('[Notifications] No registration token available from Firebase');
      return null;
    }
  } catch (error: any) {
    console.error('[Notifications] An error occurred while retrieving token:', error);
    console.error('[Notifications] Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return null;
  }
}

export async function sendTokenToBackend(token: string) {
  console.log('[Notifications] Attempting to send FCM token to backend:', token.substring(0, 20) + '...');
  try {
    const result = await apiClient.saveFcmToken(token);
    console.log('[Notifications] FCM token saved to backend successfully:', result);
    return true;
  } catch (error: any) {
    console.error('[Notifications] Error saving FCM token:', error);
    console.error('[Notifications] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url,
    });
    return false;
  }
}

export async function setupForegroundMessageHandler(
  onMessageReceived: (payload: any) => void
): Promise<() => void> {
  // Initialize Firebase if not already initialized
  if (!messaging) {
    const initialized = await initializeFirebase();
    if (!initialized) {
      console.log('Firebase messaging not initialized');
      return () => {};
    }
  }

  if (!messaging) {
    return () => {};
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      onMessageReceived(payload);
      
      // Show browser notification
      if (payload.notification) {
        const notificationTitle = payload.notification.title || 'New Notification';
        const notificationOptions = {
          body: payload.notification.body || '',
          icon: '/icon-192x192.png', // Add your app icon
          badge: '/icon-192x192.png',
          tag: payload.data?.taskId || 'notification',
          data: payload.data,
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up foreground message handler:', error);
    return () => {};
  }
}

