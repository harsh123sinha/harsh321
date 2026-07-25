/* Harsh To-Let PWA service worker — network-first; required for Android install. */
const CACHE = 'htls-pwa-v3';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Minimal fetch handler — Chrome Android needs this for a real app install (WebAPK)
  event.respondWith(
    fetch(event.request).catch(async () => {
      if (event.request.mode === 'navigate') {
        const cached = await caches.match('/');
        if (cached) return cached;
      }
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return Response.error();
    })
  );
});
