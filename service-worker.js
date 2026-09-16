// Bump this whenever a file in ASSETS changes, so returning visitors get the new version.
const CACHE_NAME = 'vakantie-uitgaven-tracker-v1';
// Keep this in sync with the actual files — nothing added here won't work offline.
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/calculations.js',
  './js/storage.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
