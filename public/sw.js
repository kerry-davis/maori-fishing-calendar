const CACHE_NAME = 'maori-fishing-calendar-cache-v4';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use a more robust caching strategy that handles CORS
        const cachePromises = urlsToCache.map(urlToCache => {
          if (urlToCache.startsWith('http')) {
            // For third-party resources, fetch with no-cors mode.
            const request = new Request(urlToCache, { mode: 'no-cors' });
            return fetch(request)
              .then(response => cache.put(urlToCache, response))
              .catch(err => {
                console.warn(`Failed to cache ${urlToCache}:`, err);
              });
          } else {
            // For local resources, cache.add is fine.
            return cache.add(urlToCache).catch(err => {
              console.warn(`Failed to cache ${urlToCache}:`, err);
            });
          }
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  // Always try to get a fresh version from the network first.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we get a valid response, we clone it and cache it for offline use.
        // We only cache GET requests.
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // If the network request fails (e.g., offline), return the cached version.
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tell the active service worker to take control of the page immediately.
  return self.clients.claim();
});
