const CACHE_VERSION = "sf-kiosk-v1";

// Archivos del shell de la app (lo que necesita para arrancar sin red)
const SHELL_ASSETS = [
    "/",
    "/index.html",
];

// ── Instalación: precachea el shell ──────────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting(); // activa el SW inmediatamente sin esperar reload
});

// ── Activación: limpia caches viejos ─────────────────────────────────────────
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_VERSION)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim(); // toma control de todas las tabs abiertas
});

// ── Fetch: estrategia Cache-First para media, Network-First para el resto ─────
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Para archivos de media de Supabase → Cache-First (nunca re-descarga)
    if (url.hostname.includes("supabase.co")) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(async (cache) => {
                const cached = await cache.match(event.request);
                if (cached) return cached; // 🎯 sirve desde cache local

                // Primera vez: descarga y guarda
                const response = await fetch(event.request);
                if (response.ok) cache.put(event.request, response.clone());
                return response;
            })
        );
        return;
    }

    // Para el shell de la app → Network-First con fallback a cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Actualiza el cache con la versión más reciente
                if (response.ok && event.request.method === "GET") {
                    caches.open(CACHE_VERSION).then((cache) =>
                        cache.put(event.request, response.clone())
                    );
                }
                return response;
            })
            .catch(() => caches.match(event.request)) // sin red → usa cache
    );
});