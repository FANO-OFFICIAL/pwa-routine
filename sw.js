const CACHE_NAME = 'langues-app-cache-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './icons/apple-touch-icon.png'
];

// Étape d'installation : mise en cache des ressources de l'application
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Étape de fetch : servir les ressources depuis le cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si la ressource est dans le cache, on la retourne
                if (response) {
                    return response;
                }
                // Sinon, on la récupère sur le réseau
                return fetch(event.request);
            })
    );
});

// Étape d'activation : nettoyage des anciens caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
