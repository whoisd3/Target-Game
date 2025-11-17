const CACHE_NAME = 'target-game-v31-fix';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css?v=scroll-fix-nov2024',
  '/script.js?v=mobile-complete-v21',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing new version...', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        // Notify clients about the new version
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_UPDATED',
              version: CACHE_NAME,
              message: 'New version cached and ready!'
            });
          });
        });
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches and notify about activation
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating new version...', CACHE_NAME);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        });
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        // Notify all clients about the successful activation
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: CACHE_NAME,
              message: 'Service Worker activated successfully!'
            });
          });
        });
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the fetched resource for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache GET requests and avoid caching query parameters for dynamic content
                if (event.request.method === 'GET' && !event.request.url.includes('?')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // If network fails and no cache, return offline page or fallback
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for score updates when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-scores') {
    console.log('Service Worker: Background sync for scores');
    event.waitUntil(syncScores());
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New high score achieved!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'play',
        title: 'Play Now',
        icon: '/icons/play-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Target Nexus', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow('/?action=play')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync scores function for background sync
async function syncScores() {
  try {
    // Get pending scores from IndexedDB or localStorage
    const pendingScores = JSON.parse(localStorage.getItem('pendingScores') || '[]');
    
    if (pendingScores.length > 0) {
      // Here you would typically send scores to a server
      // For now, we'll just clear the pending scores
      localStorage.removeItem('pendingScores');
      console.log('Service Worker: Synced', pendingScores.length, 'scores');
    }
  } catch (error) {
    console.error('Service Worker: Score sync failed', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏩ Service Worker: Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ 
      version: CACHE_NAME,
      timestamp: Date.now(),
      urls: STATIC_CACHE_URLS 
    });
  }
  
  if (event.data && event.data.type === 'CHECK_CACHE') {
    // Respond with cache status
    caches.has(CACHE_NAME).then(hasCache => {
      event.ports[0].postMessage({
        type: 'CACHE_STATUS',
        hasCache: hasCache,
        version: CACHE_NAME
      });
    });
  }
});

console.log('✅ Service Worker: Script loaded - Target Nexus Cache System Ready!', CACHE_NAME);