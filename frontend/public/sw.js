// frontend/public/sw.js
const CACHE_NAME = 'todo-app-cache-v1';
// Updated urlsToCache for Vite structure
const urlsToCache = [
    '/', // The root, which serves index.html
    '/index.html', // Explicitly cache index.html (Vite serves this from public at root)
    // '/src/main.jsx', // This is a source file, Vite bundles it. Caching bundled assets is better.
    // Key assets Vite might generate (these are placeholders, actual names differ)
    // We will primarily rely on the fetch event to cache dynamically loaded assets from the same origin.
    '/vite.svg' // Example: public asset
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                console.log('SW: Opened cache for install');

                // For local assets, adjust paths to be relative to the SW's scope (root)
                // or ensure they are correctly requested by the app.
                // For Vite, index.html is at root, vite.svg is at root.
                // app.js (or rather its bundled version) will be requested from /assets/
                const localAssetRequests = urlsToCache.map(url => new Request(url, { mode: 'no-cors' }));

                const cdnUrls = [
                    'https://cdn.jsdelivr.net/npm/react@17/umd/react.development.js',
                    'https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.development.js',
                    'https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js',
                    'https://cdn.tailwindcss.com' // This is not used by Vite build, but was in old SW.
                                                  // In Vite, Tailwind is part of the CSS bundle.
                                                  // Keeping it here won't hurt for dev if CDN was accidentally linked.
                ];
                // Filter out Tailwind CSS from CDN caching if it's bundled by Vite,
                // unless specifically still using a CDN link for it somewhere (unlikely with Vite setup).
                const actualCdnUrlsToCache = cdnUrls.filter(url => !url.includes('tailwindcss.com'));
                const cdnAssetRequests = actualCdnUrlsToCache.map(url => new Request(url, { mode: 'cors' }));


                try {
                    await cache.addAll(localAssetRequests);
                    console.log('SW: App shell assets (index, vite.svg) cached successfully.');
                } catch (error) {
                    console.error('SW: Failed to cache app shell assets:', error);
                }

                for (const request of cdnAssetRequests) {
                    try {
                        const response = await fetch(request.clone());
                        if (response && response.ok && response.type === 'cors') {
                            await cache.put(request, response);
                        } else if (response && !response.ok) {
                            // console.warn(`SW: Failed to fetch CDN (status: ${response.status}): ${request.url}`);
                        }
                    } catch (error) {
                        console.error('SW: Error fetching/caching CDN asset:', request.url, error);
                    }
                }
                console.log('SW: CDN asset caching attempt complete (React, ReactDOM, Babel).');
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
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const requestURL = new URL(event.request.url);

    // Strategy for app shell files (served from root by Vite)
    if (requestURL.origin === self.location.origin &&
        (urlsToCache.includes(requestURL.pathname) || requestURL.pathname === '/')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) return response;
                    return fetch(event.request.clone()).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                        }
                        return networkResponse;
                    }).catch(err => {
                        console.error("SW: Fetch error for app shell:", event.request.url, err);
                    });
                })
        );
    // Strategy for JS/CSS chunks generated by Vite (same-origin, typically in /assets/)
    } else if (requestURL.origin === self.location.origin && requestURL.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) return cachedResponse;

                const networkResponse = await fetch(event.request.clone());
                if (networkResponse && networkResponse.status === 200) {
                    await cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(err => {
                console.error("SW: Fetch error for local asset:", event.request.url, err);
            })
        );
    // Strategy for CDN assets (React, ReactDOM, Babel)
    } else if (event.request.url.startsWith('https://cdn.jsdelivr.net')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) return cachedResponse;

                const networkResponse = await fetch(new Request(event.request.url, { mode: 'cors' }));
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'cors') {
                    await cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(err => {
                console.error("SW: Fetch error for CDN:", event.request.url, err);
            })
        );
    }
});
