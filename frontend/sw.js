// frontend/sw.js
const CACHE_NAME = 'todo-app-cache-v1';
const urlsToCache = [
    '/', // Represents frontend/index.html if served from frontend/
    'index.html',
    'app.js',
    // CDNs are handled by trying to cache them in the fetch event if not already cached by browser
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                console.log('SW: Opened cache for install');
                const localAssetRequests = urlsToCache.map(url => new Request(url, { mode: 'no-cors' }));

                const cdnUrls = [
                    'https://cdn.jsdelivr.net/npm/react@17/umd/react.development.js',
                    'https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.development.js',
                    'https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js',
                    'https://cdn.tailwindcss.com'
                ];
                const cdnAssetRequests = cdnUrls.map(url => new Request(url, { mode: 'cors' }));

                try {
                    await cache.addAll(localAssetRequests);
                    console.log('SW: Local assets cached successfully.');
                } catch (error) {
                    console.error('SW: Failed to cache local assets:', error);
                }

                for (const request of cdnAssetRequests) {
                    try {
                        // Fetch with 'cors' mode for CDNs to get a proper response for caching
                        const response = await fetch(request.clone()); // Clone request for fetch
                        if (response && response.ok && response.type === 'cors') {
                            await cache.put(request, response);
                            // console.log('SW: Cached CDN asset:', request.url);
                        } else if (response && !response.ok) {
                            // console.warn(`SW: Failed to fetch CDN asset (status: ${response.status}): ${request.url}`);
                        } else if (response && response.type === 'opaque') {
                            // console.warn(`SW: Opaque response for CDN asset (not cached by SW): ${request.url}. Browser may still cache it.`);
                            // To cache opaque responses (use with caution): await cache.put(request, response);
                        }
                    } catch (error) {
                        console.error('SW: Error fetching/caching CDN asset:', request.url, error);
                    }
                }
                console.log('SW: CDN asset caching attempt complete.');
            })
            .catch(err => {
                console.error("SW: Error opening cache during install: ", err);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Ensure new SW activates immediately
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const requestURL = new URL(event.request.url);

    // Cache strategy for local assets (app shell) relative to SW scope (frontend/)
    let isLocalAsset = false;
    if (requestURL.origin === self.location.origin) {
        // Determine path relative to the service worker's scope
        // self.registration.scope is like 'http://localhost:xxxx/frontend/'
        // requestURL.pathname is like '/frontend/index.html' or '/frontend/app.js'
        // We want the part after the scope, e.g., 'index.html' or 'app.js' or '' for scope root
        let path = requestURL.pathname;
        if (path.startsWith(self.registration.scope.substring(self.location.origin.length))) {
             path = path.substring(self.registration.scope.substring(self.location.origin.length).length);
        }
        if (path === '' && urlsToCache.includes('/')) { // Request for the scope root
            isLocalAsset = true;
        } else if (urlsToCache.includes(path)) { // Request for specific file in urlsToCache
            isLocalAsset = true;
        }
    }


    if (isLocalAsset) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        // console.log('SW: Serving from cache (local):', event.request.url);
                        return response;
                    }
                    // console.log('SW: Fetching from network (local):', event.request.url);
                    return fetch(event.request.clone()).then(networkResponse => { // Clone request
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                        return networkResponse;
                    }).catch(err => {
                        console.error("SW: Fetch error for app shell:", event.request.url, err);
                        // Optionally, return a fallback offline page: return caches.match('offline.html');
                    });
                })
        );
    } else if (event.request.url.startsWith('https://cdn.jsdelivr.net')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    // console.log('SW: CDN from cache:', event.request.url);
                    return cachedResponse;
                }
                // console.log('SW: CDN from network:', event.request.url);
                const networkResponse = await fetch(new Request(event.request.url, { mode: 'cors' }));
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'cors') {
                    // console.log('SW: Caching CDN response:', event.request.url);
                    await cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(err => {
                console.error("SW: Fetch error for CDN:", event.request.url, err);
            })
        );
    }
    // For other requests (like API calls), let them go to the network.
});
