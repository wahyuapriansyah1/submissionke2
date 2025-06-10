// Immediately activate the service worker
self.skipWaiting();

self.addEventListener('install', (event) => {
  // Skip waiting and activate immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Claim all clients to ensure the new service worker controls all pages
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
 
  async function chainPromise() {
    try {
      // Get the push data as JSON
      const data = await event.data.json();
      console.log('Push data received:', data);

      // Show notification with the received data
      await self.registration.showNotification(data.title || '', {
        body: data.options?.body || '',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback notification if everything fails
      await self.registration.showNotification('Terjadi kesalahan!', {
        body: error || '',
      });
    }
  }
 
  event.waitUntil(chainPromise());
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  event.notification.close();
});

const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Tambahkan file statis lain jika perlu, misal:
  // '/assets/main.js',
  // '/assets/main.css',
  // '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // Fallback ke index.html jika offline
            return caches.match('/index.html');
          });
      })
  );
}); 