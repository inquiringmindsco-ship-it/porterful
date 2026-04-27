// Porterful service worker — v3 (PWA/auth stability fix)
//
// Critical fixes for auth/PWA Application Error:
// - NEVER cache /_next/* (Next.js chunks change per deploy)
// - NEVER cache auth/session/dashboard/login routes
// - NEVER cache App Router flight/data requests (RSC payloads)
// - Navigation: network-first with offline fallback only
// - Static assets: cache-first, but limited to safe extensions only
//
// This prevents stale JS chunks from breaking the PWA after deploys.

const CACHE_NAME = 'porterful-v3'
const OFFLINE_URL = '/'

// NEVER cache these patterns — they must be fresh from network
const NEVER_CACHE_PATTERNS = [
  /^\/_next\//,          // Next.js build chunks
  /\/api\//,             // API routes
  /_rsc=/i,              // Next.js RSC flight data
  /_next\/data\//i,       // Next.js data fetching
  /\.json(\?|$)/i,        // JSON data files
]

// NEVER cache these paths (exact match or starts with)
const NEVER_CACHE_PATHS = [
  '/login',
  '/logout',
  '/dashboard',
  '/session',
  '/api/auth',
]

// ONLY cache these static file extensions
const CACHEABLE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp3', '.mp4', '.webm', '.ogg', '.wav',
  '.css', // Only if not /_next/static/css (handled by pattern above)
]

function shouldNeverCache(url) {
  const path = url.pathname

  // Check path prefixes
  for (const p of NEVER_CACHE_PATHS) {
    if (path.startsWith(p)) return true
  }

  // Check patterns
  for (const pattern of NEVER_CACHE_PATTERNS) {
    if (pattern.test(path)) return true
    if (pattern.test(url.search)) return true
  }

  return false
}

function isCacheableStaticAsset(url) {
  const path = url.pathname
  const ext = path.substring(path.lastIndexOf('.')).toLowerCase()
  if (!CACHEABLE_EXTENSIONS.includes(ext)) return false

  // Still exclude /_next/ even if it has cacheable extension
  if (path.startsWith('/_next/')) return false

  return true
}

self.addEventListener('install', (event) => {
  self.skipWaiting()
  // Only cache root HTML for offline fallback
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL).catch(() => {}))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      // Delete all old caches including v1 and v2
      await Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only handle GET requests
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Ignore cross-origin requests
  if (url.origin !== self.location.origin) return

  // NEVER cache these paths — passthrough to network only
  if (shouldNeverCache(url)) {
    return
  }

  // Navigation requests (HTML pages) — network-first, cache fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful HTML responses
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
          }
          return response
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    )
    return
  }

  // Only cache known static assets
  if (!isCacheableStaticAsset(url)) {
    return // Passthrough to network
  }

  // Static assets — cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
        return response
      })
    })
  )
})
