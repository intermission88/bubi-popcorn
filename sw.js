const CACHE_NAME = 'bubi-popcorn-v58';
const IMG_CACHE = 'bubi-tmdb-img-v1'; // tidak ikut dihapus saat CACHE_NAME naik
const IMG_MAX = 400;
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
  './assets/icon.svg',
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
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== IMG_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase & API: selalu network (jangan cache data dinamis)
  if (url.hostname.includes('supabase.co') || url.hostname === 'api.themoviedb.org') {
    return;
  }

  // Gambar TMDB (poster/logo): cache-first + perbarui di latar; respons opaque (no-cors) ikut disimpan
  if (url.hostname === 'image.tmdb.org') {
    event.respondWith(
      caches.open(IMG_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          const net = fetch(event.request).then((response) => {
            if (response.ok || response.type === 'opaque') {
              cache.put(event.request, response.clone()).then(() =>
                cache.keys().then((ks) => { if (ks.length > IMG_MAX) cache.delete(ks[0]); })
              );
            }
            return response;
          });
          if (cached) { net.catch(() => {}); return cached; }
          return net;
        })
      )
    );
    return;
  }

  // HTML/navigasi: network-first agar update deploy selalu tampil, fallback cache saat offline
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    );
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
