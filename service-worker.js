// Lightweight PWA cache for offline play
const CACHE = "tetris-pixel-art-v1";
const ASSETS = [
  "/",           // adjust if served from subpath
  "/index.html",
  "/manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network falling back to cache, then cache falling back to network
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  e.respondWith(
    fetch(request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(request, resClone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(request).then(r => r || caches.match("/index.html")))
  );
});
