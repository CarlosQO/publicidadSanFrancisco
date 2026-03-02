const CACHE_VERSION = "sf-kiosk-v2";

const SHELL_ASSETS = [
    "/",
    "/index.html",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

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
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // ⛔ Solo cachear GET — POST/PUT/DELETE nunca se cachean
    if (event.request.method !== "GET") return;

    // ⛔ No cachear peticiones a la API de Supabase (solo el storage/media)
    if (url.hostname.includes("supabase.co") && !url.pathname.includes("/storage/")) return;

    // ── Media de Supabase Storage → Cache-First (nunca re-descarga) ──────────
    if (url.hostname.includes("supabase.co") && url.pathname.includes("/storage/")) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(async (cache) => {
                const cached = await cache.match(event.request);
                if (cached) return cached;

                const response = await fetch(event.request);
                if (response.ok) cache.put(event.request, response.clone());
                return response;
            })
        );
        return;
    }

    // ── Shell de la app → Network-First con fallback a cache ─────────────────
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    caches.open(CACHE_VERSION).then((cache) =>
                        cache.put(event.request, response.clone())
                    );
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});