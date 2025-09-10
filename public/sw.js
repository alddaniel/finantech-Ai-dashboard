const CACHE_NAME = 'finantech-ai-cache-v2';
// Add all the files that should be cached for offline use.
// At a minimum, this is the HTML, CSS, and JS files that make up the app shell.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force the new service worker to activate
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Try the network first to get the most up-to-date resources.
      try {
        const networkResponse = await fetch(event.request);
        // If the request is successful, cache it and return it.
        // We only cache requests to our own origin, not external resources like Google Fonts.
        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // If the network fails, try to serve from the cache.
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache either, it's a genuine network error.
        // For navigation requests, you might want to return a fallback offline page.
        // For now, we just let the error propagate.
        return new Response("Network error happened", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })
  );
});