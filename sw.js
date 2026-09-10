/**
 * ============================================================================
 * MEP Production & Inventory Management System - Service Worker (sw.js)
 * AUTO-PURGE & ZERO-CACHE ENGINE (Ensures Live Mobile & Desktop Auto-Updates)
 * ============================================================================
 */

// Force immediate activation
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Purge all legacy caches on activation and claim clients
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    console.log('[Service Worker] Auto-purging legacy cache:', cache);
                    return caches.delete(cache);
                })
            );
        })
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
});

// Always fetch fresh from network to guarantee real-time updates
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;

    // Always fetch directly from network without caching stale HTML/JS
    event.respondWith(
        fetch(event.request, { cache: 'no-store' }).catch(() => {
            return caches.match(event.request);
        })
    );
});

