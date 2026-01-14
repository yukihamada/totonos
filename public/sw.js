const CACHE_NAME = 'totonos-cache-v1';
const STATIC_CACHE = 'totonos-static-v1';
const DYNAMIC_CACHE = 'totonos-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip browser-sync and hot reload
  if (url.pathname.includes('browser-sync') || url.pathname.includes('hot-update')) {
    return;
  }

  // Skip API calls (always go to network)
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    return;
  }

  // For static assets, try cache first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetchAndCache(request, STATIC_CACHE);
      })
    );
    return;
  }

  // For pages, use network first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/');
        });
      })
  );
});

// Helper function to check if asset is static
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

// Helper function to fetch and cache
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    const responseClone = response.clone();
    const cache = await caches.open(cacheName);
    cache.put(request, responseClone);
    return response;
  } catch (error) {
    console.error('Fetch and cache failed:', error);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sync event', event.tag);

  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

// Sync pending actions stored in IndexedDB
async function syncPendingActions() {
  try {
    // Open IndexedDB
    const db = await openDB();
    const tx = db.transaction('pending-actions', 'readonly');
    const store = tx.objectStore('pending-actions');
    const actions = await store.getAll();

    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: JSON.stringify(action.body),
        });

        if (response.ok) {
          // Remove from pending
          const deleteTx = db.transaction('pending-actions', 'readwrite');
          const deleteStore = deleteTx.objectStore('pending-actions');
          await deleteStore.delete(action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Simple IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('totonos-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  let data = { title: 'Totonos', body: '新しい通知があります' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window or open new
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((focusedClient) => {
              if ('navigate' in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              }
            });
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
