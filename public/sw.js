// ── Service worker: офлайн-кэш аудио и картинок ──
// Стратегия cache-first для /audio/… (озвучка) и статичных картинок:
// первый раз файл берётся из сети и кладётся в кэш, дальше — мгновенно
// из кэша и работает без сети. Прочие запросы воркер не трогает.

const CACHE = "sitkaz-assets-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Чистим старые версии кэша
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith("sitkaz-assets") && k !== CACHE).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

function isCacheable(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/audio/")) return true;           // озвучка (Aigul и Daulet)
  if (url.pathname.startsWith("/mascot/")) return true;          // картинки барса
  return /\.(png|svg|webp|jpg|jpeg|ico)$/i.test(url.pathname);   // иконки и прочая графика
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (!isCacheable(url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      // Нет сети и в кэше нет — отдаём ошибку, вызывающий код (озвучка)
      // сам мягко откатится на синтез речи.
      return cached || Response.error();
    }
  })());
});
