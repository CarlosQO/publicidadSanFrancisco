const CACHE_VERSION = "sf-kiosk-v3";

const SHELL_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Solo GET
    if (event.request.method !== "GET") return;

    // API de Supabase (no storage) → nunca cachear
    if (url.hostname.includes("supabase.co") && !url.pathname.includes("/storage/")) return;

    // Media de Supabase Storage → Cache-First
    if (url.hostname.includes("supabase.co") && url.pathname.includes("/storage/")) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(async (cache) => {
                const cached = await cache.match(event.request);
                if (cached) return cached;

                const response = await fetch(event.request);
                if (response.ok) {
                    // ✅ Clonar ANTES de usar — el original va al cache, el clon al navegador
                    const toCache = response.clone();
                    cache.put(event.request, toCache);
                }
                return response;
            })
        );
        return;
    }

    // Shell de la app → Network-First
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok && response.status < 400) {
                    // ✅ Clonar ANTES de retornar
                    const toCache = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, toCache));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});