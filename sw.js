const CACHE_NAME = 'lcwtc-cache-v1-fix'; // Я поменял имя кэша с 'v1' на 'v1-fix'
// Важно: обновим список файлов, которые должны быть доступны офлайн
const urlsToCache = [
  './', 
  './index.html',
  './manifest.json',
  './sw.js', // Добавляем сам service worker, чтобы он обновился
  './icon-192.png', 
  './icon-512.png'
];

// Установка: кэшируем все нужные ресурсы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache successfully');
        return cache.addAll(urlsToCache);
      })
  );
  // Заставляем Service Worker активироваться немедленно
  self.skipWaiting();
});

// Активация: удаляем старые кэши
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Если имя кэша не в "белом списке", удаляем его
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Заставляем все текущие клиенты (вкладки) использовать новый SW
  event.waitUntil(clients.claim());
});

// Запрос: отдаем из кэша, если есть
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Кэш попал - возвращаем ответ
        if (response) {
          return response;
        }
        // Если в кэше нет, идем в сеть
        return fetch(event.request);
      }
    )
  );
});

