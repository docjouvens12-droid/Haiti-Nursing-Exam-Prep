const CACHE_NAME = "haiti-nursing-exam-prep-v2";
const OFFLINE_URL = "/hors-connexion";
const APP_SHELL = ["/", "/connexion", OFFLINE_URL, "/manifest.webmanifest", "/pwa-icon.svg", "/pwa-icon-maskable.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Ne jamais mettre en cache les API, l'authentification ou les réponses dynamiques Supabase.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Les pages authentifiées/dynamiques ne sont pas conservées comme source de vérité hors ligne.
          // On garde uniquement les pages publiques essentielles et la page de secours.
          if (["/", "/connexion", OFFLINE_URL].includes(url.pathname) && response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(async () => {
          const exact = await caches.match(request);
          return exact || (await caches.match(OFFLINE_URL)) || Response.error();
        })
    );
    return;
  }

  // Assets statiques : cache-first. Les requêtes Next.js dynamiques restent network-first.
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || !response.ok) return response;
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
