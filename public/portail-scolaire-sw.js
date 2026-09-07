const CACHE_NAME = 'portail-scolaire-v2'
const STATIC_ASSETS = [
  '/portail-scolaire/manifest.webmanifest',
  '/portail-scolaire-icon.svg',
  '/portail-scolaire-icon-maskable.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('portail-scolaire-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith('/portail-scolaire') && !STATIC_ASSETS.includes(url.pathname)) return

  // Always use the network for page navigations and Next.js data/chunks.
  // This prevents Safari from reopening an old app shell that can stay on "Chargement...".
  if (request.mode === 'navigate' || url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request, { cache: 'no-store' }))
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && STATIC_ASSETS.includes(url.pathname)) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
