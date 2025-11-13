const CACHE_NAME = 'target-game-nuclear-20241113-1847';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css?v=nuclear-cache-bust-20241113-1847',
  '/script.js?v=nuclear-cache-bust-20241113-1847',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'
];

// Install event - cache static assets with aggressive cache clearing
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker v33: FORCE INSTALLING with complete cache clear');
  
  event.waitUntil(
    (async () => {
      try {
        // Delete ALL existing caches immediately
        const cacheNames = await caches.keys();
        console.log('🗑️ Found existing caches:', cacheNames);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        
        // Create fresh cache
        const cache = await caches.open(CACHE_NAME);
        console.log('📦 Caching fresh resources for v33...');
        await cache.addAll(STATIC_CACHE_URLS);
        console.log('✅ Service Worker v33: Fresh cache installed');
        
        // Force immediate activation
        await self.skipWaiting();
        console.log('⚡ Service Worker v33: Skipping waiting, activating immediately');
        
      } catch (error) {
        console.error('❌ Service Worker v33: Installation failed', error);
      }
    })()
  );
});

// Activate event - force immediate control and clear any remaining caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker v33: FORCE ACTIVATING and taking control');
  
  event.waitUntil(
    (async () => {
      try {
        // Take immediate control of all clients
        await self.clients.claim();
        console.log('⚡ Service Worker v33: Claimed all clients');
        
        // Final cleanup - delete any remaining old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Final cleanup - deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        console.log('✅ Service Worker v33: Activated with fresh cache only');
        
        // Notify all clients to reload for fresh content
        const clients = await self.clients.matchAll();
        console.log(`📢 Notifying ${clients.length} clients to refresh`);
        
        clients.forEach(client => {
          client.postMessage({ 
            type: 'FORCE_REFRESH', 
            version: 'v33',
            message: 'Fresh content available - reloading...'
          });
        });
        
      } catch (error) {
        console.error('❌ Service Worker v33: Activation failed', error);
      }
    })()
  );
});
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - NETWORK FIRST for immediate fresh content
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  console.log('🌐 SW Nuclear Fetch:', event.request.url);
  
  event.respondWith(
    (async () => {
      try {
        // NETWORK FIRST - Always try to get fresh content
        console.log('🌐 Attempting network fetch for:', event.request.url);
        const networkResponse = await fetch(event.request, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (networkResponse.ok) {
          console.log('✅ Network fetch successful:', event.request.url);
          
          // Update cache with fresh content
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
          
          return networkResponse;
        }
      } catch (error) {
        console.log('❌ Network fetch failed, trying cache:', error.message);
      }
      
      // Fallback to cache only if network fails
      const cacheResponse = await caches.match(event.request);
      if (cacheResponse) {
        console.log('📦 Serving from cache:', event.request.url);
        return cacheResponse;
      }
      
      // If no cache, return network error
      console.log('❌ No cache available for:', event.request.url);
      return new Response('Network error and no cache available', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })()
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
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Script loaded');