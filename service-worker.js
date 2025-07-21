// Service Worker untuk Game Titik Kerta Metamatik
// Version 1.0.0 - Offline Support & Caching

const CACHE_NAME = 'titik-kerta-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json'
];

// Install Event - Cache semua file penting
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('Service Worker: All files cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(function(error) {
                console.error('Service Worker: Caching failed:', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('Service Worker: Activated successfully');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch Event - Serve from cache when offline
self.addEventListener('fetch', function(event) {
    console.log('Service Worker: Fetching', event.request.url);
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request).then(function(response) {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone response for caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(function(error) {
                    console.log('Service Worker: Network request failed:', error);
                    
                    // Return offline page or default response for failed requests
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Background Sync for game data (if supported)
self.addEventListener('sync', function(event) {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'background-sync-game-data') {
        event.waitUntil(syncGameData());
    }
});

// Function to sync game data when online
function syncGameData() {
    console.log('Service Worker: Syncing game data...');
    // Here you could sync game statistics or saved games
    // For now, just resolve immediately since game is local
    return Promise.resolve();
}

// Push notification handler (for future features)
self.addEventListener('push', function(event) {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'Game Titik Kerta - Notifikasi baru!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Buka Game',
                icon: '/favicon.ico'
            },
            {
                action: 'close',
                title: 'Tutup',
                icon: '/favicon.ico'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Game Titik Kerta', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the game
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close notification
        console.log('Service Worker: Notification closed by user');
    }
});

// Message handler for communication with main thread
self.addEventListener('message', function(event) {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            cached: urlsToCache
        });
    }
});

// Error handler
self.addEventListener('error', function(event) {
    console.error('Service Worker: Error occurred:', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Utility function to update cache
function updateCache() {
    return caches.open(CACHE_NAME)
        .then(function(cache) {
            return cache.addAll(urlsToCache);
        });
}

// Utility function to clear all caches
function clearAllCaches() {
    return caches.keys()
        .then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        });
}

console.log('Service Worker: Script loaded successfully');
