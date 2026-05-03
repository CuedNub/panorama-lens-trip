/*
  FILE    : sw.js
  VERSI   : 1.0.0
  FUNGSI  : Service worker, cache offline, handle update PWA
*/

const CACHE_NAME = 'plt-cache-v1.2.1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './css/style.css',
  './js/license.js',
  './js/core.js',
  './js/engine.js',
  './js/data_sync.js',
  './js/app_update.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ---------------------------------
// INSTALL: Cache semua file
// ---------------------------------
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

// ---------------------------------
// ACTIVATE: Hapus cache lama
// ---------------------------------
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ---------------------------------
// FETCH: Ambil dari cache dulu
// ---------------------------------
self.addEventListener('fetch', function(event) {
  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Skip cross-origin (worldtimeapi, dll)
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip version.json agar selalu ambil dari server
  if (event.request.url.includes('version.json')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Cache file baru yang berhasil difetch
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match('/index.html');
      });
    })
  );
});

// ---------------------------------
// MESSAGE: Skip waiting (update)
// ---------------------------------
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
