import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export function isFirebaseClientConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
}

export function getFirebaseApp() {
  if (!isFirebaseClientConfigured()) return null;
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export async function getFirebaseMessaging() {
  if (!(await isSupported())) return null;
  const app = getFirebaseApp();
  if (!app) return null;
  return getMessaging(app);
}

export function buildServiceWorkerUrl() {
  const params = new URLSearchParams();
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

export async function requestFcmToken() {
  const vapidKey = import.meta.env.VITE_FCM_VAPID_KEY;
  if (!vapidKey) {
    console.warn('VITE_FCM_VAPID_KEY is not set');
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
  } else if (Notification.permission !== 'granted') {
    return null;
  }

  const swUrl = buildServiceWorkerUrl();
  const registration = await navigator.serviceWorker.register(swUrl);
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
  return token || null;
}

export async function subscribeForegroundMessages(callback) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export { getToken, onMessage };
