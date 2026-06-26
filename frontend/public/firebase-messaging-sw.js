/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
  measurementId: params.get('measurementId') || undefined,
});

const messaging = firebase.messaging();

const DEFAULT_IMAGE = '/assets/default-property.svg';

function resolveUrl(pathOrUrl) {
  if (!pathOrUrl) return self.location.origin + '/';
  const s = String(pathOrUrl);
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return self.location.origin + (s.startsWith('/') ? s : `/${s}`);
}

function extractPayload(payload) {
  const n = payload.notification || {};
  const d = payload.data || {};
  const title = n.title || d.title || 'Harsh To Let Services';
  const body = n.body || d.body || '';
  const image = n.image || d.propertyImage || DEFAULT_IMAGE;
  const clickUrl = resolveUrl(
    d.absolutePropertyUrl || d.propertyUrl || (d.propertyId ? `/property/${d.propertyId}` : '/')
  );
  return { title, body, image: resolveUrl(image), clickUrl };
}

messaging.onBackgroundMessage((payload) => {
  const { title, body, image, clickUrl } = extractPayload(payload);

  return self.registration.showNotification(title, {
    body,
    icon: self.location.origin + '/favicon.svg',
    image,
    badge: self.location.origin + '/favicon.svg',
    data: { url: clickUrl },
    tag: payload.data?.propertyId ? `property-${payload.data.propertyId}` : 'harsh-notification',
    renotify: true,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.location.origin + '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus().then((focused) => {
            if ('navigate' in focused) {
              return focused.navigate(targetUrl);
            }
            return focused;
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
