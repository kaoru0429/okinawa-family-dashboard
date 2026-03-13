const CACHE_NAME = 'okinawa-trip-v2';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  // JS
  './js/app.js',
  './js/weather.js',
  './js/places.js',
  './js/spots.js',
  './js/exchange.js',
  './js/emergency.js',
  './js/transport.js',
  './js/notify.js',
  './js/geo.js',
  // Data
  './data/weather.json',
  './data/spots.json',
  './data/emergency.json',
  './data/transport.json',
  './data/places.json',
  // Pages
  './pages/weather.html',
  './pages/exchange.html',
  './pages/spots.html',
  './pages/spot-detail.html',
  './pages/emergency.html',
  './pages/day4-transport.html',
  './pages/places.html',
  './pages/gas-station.html',
  // Icons
  './images/icons/icon-192x192.png',
  './images/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 若在快取中找到則直接回傳，否則從網路獲取 (不快取新資源)
        return response || fetch(event.request);
      })
      .catch(() => {
        // 離線 fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
