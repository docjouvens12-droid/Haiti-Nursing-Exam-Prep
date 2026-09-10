const CACHE_NAME = 'movi-static-v7'
const STATIC_URLS = ['/manifest.webmanifest', '/movi-icon.svg', '/movi-icon-maskable.svg']
const PWA_REFRESH_VERSION = '7'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => Promise.all(clients.map((client) => {
        try {
          const url = new URL(client.url)
          if (url.origin !== self.location.origin) return undefined
          if (url.searchParams.get('movi_pwa') === PWA_REFRESH_VERSION) return undefined
          url.searchParams.set('movi_pwa', PWA_REFRESH_VERSION)
          return client.navigate(url.toString())
        } catch {
          return undefined
        }
      })))
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, { cache: 'no-store' }))
    return
  }

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/driver') ||
    url.pathname.startsWith('/passenger')
  ) return

  if (STATIC_URLS.includes(url.pathname)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined)
          }
          return response
        })
        .catch(() => caches.match(request))
    )
  }
})
