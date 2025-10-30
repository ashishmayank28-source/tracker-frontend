/* ============================================================
   🚀 Sales Tracker PWA Service Worker
   Provides offline caching and app shell support
   Author: Ashish Kumar
============================================================ */

const CACHE_NAME = "sales-tracker-cache-v1";

// ✅ Add important URLs to cache for offline use
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// 📦 Install service worker and pre-cache assets
self.addEventListener("install", (event) => {
  console.log("📥 Service Worker: Installing and caching app shell...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ♻️ Activate and clean old caches
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 Removing old cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🌐 Fetch handler — serves from cache first, then network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache → return cached response
      if (cachedResponse) {
        return cachedResponse;
      }

      // Else → fetch from network and cache dynamically
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return networkResponse;
        })
        .catch(() => {
          // 📴 Offline fallback (optional)
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// 🔔 Optional: Background sync / push notifications can be added here
