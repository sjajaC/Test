const VERSION = "smokejp-v7-cache";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => null)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// Cache-first for static assets, network-first for Overpass and OSM tiles.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isTile = /tile\.openstreetmap\.org$/.test(url.hostname);
  const isOverpass = /overpass/.test(url.hostname);

  if (sameOrigin) {
    // cache-first
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => null);
            return res;
          }),
      ),
    );
    return;
  }

  if (isTile) {
    // stale-while-revalidate
    event.respondWith(
      caches.open(VERSION + "-tiles").then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req)
            .then((res) => {
              cache.put(req, res.clone()).catch(() => null);
              return res;
            })
            .catch(() => cached);
          return cached || network;
        }),
      ),
    );
    return;
  }

  if (isOverpass) {
    // network-only; data is volatile.
    return;
  }
});
