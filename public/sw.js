self.addEventListener('install', event => {
  console.log('Installing passthrough service worker.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Activating passthrough service worker.');
  // Clean up all old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Do nothing. Let the request go to the network.
  // This is the default behavior when there's no event.respondWith().
  // Adding a log to be sure it's running.
  console.log('Passthrough SW: Fetching', event.request.url);
});
