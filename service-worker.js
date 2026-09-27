const CACHE = 'oftalmologiya-web-guide-v1';
const CORE = ['index.html', 'css/style.css', 'css/responsive.css', 'js/app.js', 'js/navigation.js', 'js/search.js', 'content.json'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const coreUrls = CORE.map(path => new URL(path, self.registration.scope).href);
    await cache.addAll(coreUrls);
    const manifest = await (await fetch(new URL('content.json', self.registration.scope))).json();
    const images = [...new Set(manifest.blocks.flatMap(block => block.images || []))];
    await cache.addAll(images.map(name => new URL(`assets/images/${encodeURIComponent(name)}`, self.registration.scope).href));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('oftalmologiya-web-guide-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    } catch {
      return cached || Response.error();
    }
  })());
});
