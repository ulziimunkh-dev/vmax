const CACHE_NAME = 'vmax-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/hero_penthouse.png',
  '/images/hero_tower.png',
  '/images/hero_villa.png',
];

// Install Event - Pre-cache core shell assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache each asset safely so a single missing file does not abort installation
      await Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          fetch(asset)
            .then((res) => {
              if (res.ok) return cache.put(asset, res);
            })
            .catch((err) => console.warn(`[SW] Could not pre-cache: ${asset}`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Safe strategy with guaranteed Response objects
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http(s) schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML pages like /register, /login, /listings):
  // Network-First with guaranteed HTML Response fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cached =
            (await cache.match(request)) ||
            (await cache.match('/index.html')) ||
            (await cache.match('/'));

          if (cached) {
            return cached;
          }

          // Fallback Response if neither network nor cache succeeded
          return new Response(
            `<!DOCTYPE html>
            <html lang="mn">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Vmax.mn | Холболтоо шалгана уу</title>
              <style>
                body { font-family: -apple-system, sans-serif; background: #0a0a0f; color: #fff; text-align: center; padding: 50px 20px; }
                button { background: #863bff; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 16px; }
              </style>
            </head>
            <body>
              <h2>Интернэт холболтоо шалгана уу</h2>
              <p>Хуудсыг ачаалахад алдаа гарлаа.</p>
              <button onclick="window.location.reload()">Дахин ачаалах</button>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        }
      })()
    );
    return;
  }

  // 2. API requests (/api/...):
  // Pass through to network, never return undefined
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(
          JSON.stringify({ offline: true, error: 'Сүлжээний холболтгүй байна.' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          }
        );
      })
    );
    return;
  }

  // 3. Static assets & media: Cache-first / Stale-while-revalidate
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        // Revalidate in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cached;
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Return clean empty 404 response instead of undefined
        return new Response('', { status: 404, statusText: 'Not Found' });
      }
    })()
  );
});

// Push notification event listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Vmax.mn';
  const options = {
    body: data.body || 'Танд шинэ үл хөдлөх хөрөнгийн мэдэгдэл ирлээ.',
    icon: '/icons/icon-192x192.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
