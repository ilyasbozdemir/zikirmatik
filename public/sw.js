// Service Worker Sürümü
const CACHE_VERSION = "v1.1.0"
const CACHE_NAME = `zikirmatik-${CACHE_VERSION}`

// Önbelleğe alınacak dosyalar
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/click.mp3",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
]

// Service Worker kurulumu
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Önbellek açıldı")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        // Yeni service worker'ın hemen aktif olmasını sağla
        return self.skipWaiting()
      }),
  )
})

// Service Worker aktifleştirilmesi
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eski önbellekleri temizle
            if (cacheName !== CACHE_NAME) {
              console.log("Eski önbellek siliniyor:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        // Yeni service worker'ın hemen kontrolü almasını sağla
        return self.clients.claim()
      }),
  )
})

// Ağ isteklerini yakalama
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Önbellekte varsa, önbellekten döndür
        if (response) {
          return response
        }

        // Önbellekte yoksa, ağdan getir
        return fetch(event.request).then((response) => {
          // Geçersiz yanıt veya opaque yanıt ise önbelleğe alma
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response
          }

          // Yanıtın bir kopyasını önbelleğe al
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        // Ağ hatası durumunda, offline sayfasını göster
        if (event.request.mode === "navigate") {
          return caches.match("/")
        }
      }),
  )
})

// Güncelleme mesajını dinle
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

