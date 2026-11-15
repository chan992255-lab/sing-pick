/* 싱픽 서비스 워커
 *
 * 목표는 "홈 화면에 설치" 요건을 채우면서, 캐시 때문에 화면이 낡아 보이지 않게 하는 것.
 *  - install: skipWaiting / activate: clients.claim 으로 새 버전 즉시 적용
 *  - 같은 출처 GET 은 network-first, 실패했을 때만 캐시로 대신한다
 *  - /api/* 는 캐시하지 않는다 (실시간 검색·차트·가사)
 */

const CACHE_NAME = 'sing-pick-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;
  if (url.pathname.endsWith('/sw.js')) return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.status === 200 && fresh.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const shell = await caches.match('./index.html');
          if (shell) return shell;
        }
        throw error;
      }
    })(),
  );
});
