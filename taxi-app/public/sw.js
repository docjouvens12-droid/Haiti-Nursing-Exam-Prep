const CACHE_NAME = 'taxi-haiti-shell-v1'
const SHELL_URLS = ['/', '/manifest.webmanifest', '/taxi-haiti-icon.svg', '/taxi-haiti-icon-maskable.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never cache authenticated/data-heavy app routes or Supabase/API calls.
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/driver') ||
    url.pathname.startsWith('/passenger') ||
    url.pathname.startsWith('/api/')
  ) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === 'navigate' && url.pathname === '/') {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(() => undefined)
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  )
})
