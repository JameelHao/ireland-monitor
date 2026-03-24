/**
 * Service Worker for IrishTech Monitor PWA
 *
 * Caching strategies:
 * - App Shell (HTML/CSS/JS): Cache First
 * - API Data: Network First with Cache Fallback
 * - Images: Cache First with Expiration
 * - News Content: Stale While Revalidate
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `irishtech-${CACHE_VERSION}`;

// App shell resources to cache immediately
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes to cache with network-first strategy
const API_ROUTES = ['/api/briefs', '/api/jobs', '/api/alerts'];

// Cache duration for different resource types (in seconds)
const CACHE_DURATIONS = {
  api: 5 * 60, // 5 minutes
  images: 7 * 24 * 60 * 60, // 7 days
  static: 30 * 24 * 60 * 60, // 30 days
};

/**
 * Install event - cache app shell
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] Failed to cache some app shell resources:', err);
      });
    })
  );

  // Activate immediately without waiting
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('irishtech-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API routes: Network First with Cache Fallback
  if (API_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Static assets: Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // Default: Stale While Revalidate
  event.respondWith(staleWhileRevalidateStrategy(event.request));
});

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  return (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ico')
  );
}

/**
 * Cache First Strategy
 * Best for: static assets that rarely change
 */
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] Cache first fetch failed:', err);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First Strategy
 * Best for: API data that needs to be fresh
 */
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.log('[SW] Network first falling back to cache');
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Best for: content that can be slightly stale
 */
async function staleWhileRevalidateStrategy(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

/**
 * Push notification event
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = { title: 'IrishTech Monitor', body: 'New update available' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' },
    ],
    tag: data.tag || 'default',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Background sync event (future enhancement)
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-briefs') {
    event.waitUntil(
      fetch('/api/briefs?latest=true&lang=en')
        .then((response) => response.json())
        .then((data) => {
          console.log('[SW] Synced briefs:', data);
        })
        .catch((err) => {
          console.warn('[SW] Sync failed:', err);
        })
    );
  }
});

console.log('[SW] Service worker loaded');
