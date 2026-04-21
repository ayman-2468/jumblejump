const CACHE = 'jumblejump-v2';
const FILES = ['/', '/index.html', '/login.html', '/css/theme.css', '/assets/logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});