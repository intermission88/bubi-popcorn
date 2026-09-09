const CACHE_NAME = 'bubi-popcorn-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './assets/Slider_1.webp',
  './assets/Slider_2.webp',
  './assets/Slider_3.webp',
  './assets/Slider_4.webp',
  './assets/Slider_5.webp',
  './assets/pfp_zald.png',
  './assets/pfp_micel.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase & API: selalu network (jangan cache data dinamis)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Aset lokal & CDN: cache-first, fallback network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.ok && (url.origin === location.origin || url.hostname.includes('cdn'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
