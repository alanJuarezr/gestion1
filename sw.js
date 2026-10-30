const CACHE_NAME = 'farmacia-angel-v1';

// Archivos esenciales que se guardarán en la memoria caché del navegador
const ARCHIVOS_CACHE = [
    './',
    'index.html',
    'style.css',
    'app.js',
    'manifest.json',
    'favicon.ico'
];

// 1. ETAPA DE INSTALACIÓN (Install)
// Se ejecuta cuando el Service Worker se instala por primera vez.
// Guarda los recursos estáticos en la memoria caché.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Guardando archivos en caché...');
                return cache.addAll(ARCHIVOS_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ETAPA DE ACTIVACIÓN (Activate)
// Se ejecuta cuando el Service Worker toma el control.
// Se encarga de limpiar cachés antiguas de versiones anteriores del proyecto.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => {
                        console.log('[Service Worker] Limpiando caché obsoleta:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. ETAPA DE INTERCEPTACIÓN DE PETICIONES (Fetch)
// Intercepta las solicitudes de red. Si el dispositivo pierde la conexión,
// responde devolviendo la copia que tiene guardada en caché (Estrategia Cache First con Fallback).
self.addEventListener('fetch', (event) => {
    // Solo manejamos peticiones de tipo GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cacheResponse) => {
            // Si el archivo está en caché, lo entrega desde ahí
            if (cacheResponse) {
                return cacheResponse;
            }

            // Si no está en caché, intenta realizar la petición a la red
            return fetch(event.request).then((networkResponse) => {
                // Si la respuesta es válida, guarda una copia en la caché para la próxima vez
                if (networkResponse && networkResponse.status === 200) {
                    const copiaRespuesta = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, copiaRespuesta);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Si falla la red (modo offline), intenta devolver la página principal
                return caches.match('index.html');
            });
        })
    );
});