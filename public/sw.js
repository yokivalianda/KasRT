// KasRT Service Worker
// Versi cache — naikkan angka ini untuk force update
const CACHE_VERSION = 'kasrt-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`

// File yang selalu di-cache saat install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icon.svg',
]

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activate — hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// Fetch — Network first, fallback ke cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET dan request ke Supabase (selalu fresh)
  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase.co')) return
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache response yang sukses
        if (response.ok) {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline — coba dari cache
        return caches.match(request).then(cached => {
          if (cached) return cached
          // Fallback ke halaman dashboard dari cache
          if (request.destination === 'document') {
            return caches.match('/dashboard')
          }
        })
      })
  )
})
