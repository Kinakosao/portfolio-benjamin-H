// Bump this version whenever cached assets change.
const CACHE = "portfolio-v2";
const ASSETS = [
  "/", "/index.html", "/resume.html", "/linux.html", "/404.html",
  "/style.css", "/resume.css", "/404.css", "/linux.css",
  "/i18n.js", "/script.js", "/linux.js",
  "/favicon.svg", "/profile.jpg", "/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for our own GET requests so visitors always get the latest
// version when online; the cache is only an offline fallback.
// Cross-origin requests (CDNs, analytics, EmailJS) are left to the browser.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then(r => r || (req.mode === "navigate" ? caches.match("/index.html") : null))
          .then(r => r || Response.error())
      )
  );
});
