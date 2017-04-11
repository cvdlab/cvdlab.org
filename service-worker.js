var cacheName = 'cvdlab'

var filesToCache = [
  '/data/alumni.js',
  '/data/collaborators.js',
  '/data/courses.js',
  '/data/founders.js',
  '/data/hello.js',
  '/data/menus.js',
  '/data/pages.js',
  '/data/projects.js',
  '/data/theses.js',

  '/elements/app-container.html',
  '/elements/app-link.html',
  '/elements/page-0000.html',
  '/elements/page-0001.html',
  '/elements/page-0002.html',
  '/elements/page-0101.html',
  '/elements/page-0201.html',
  '/elements/page-0301.html',
  '/elements/page-0401.html',
  '/elements/page-0501.html',
  '/elements/page-0601.html',
  '/elements/part-cookies.html',
  '/elements/part-footer.html',
  '/elements/part-header-desktop.html',
  '/elements/part-header-mobile.html',
  '/elements/part-header.html',
  '/elements/part-up.html',

  '/scripts/fetch.js',
  '/scripts/ga.js',
  '/scripts/page.js',
  '/scripts/router.js',
  '/scripts/tawk.js'
]

self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Install')

  let caching = caches.open(cacheName).then((cache) => {
    console.log('[ServiceWorker] Caching app shell')
    return cache.addAll(filesToCache)
  })

  event.waitUntil(caching)
})

self.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Activate')

  let caching = caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key !== cacheName) {
        console.log('[ServiceWorker] Removing old cache', key)
        return caches.delete(key)
      }
    }))
  })

  event.waitUntil(caching)

  return self.clients.claim();
})

self.addEventListener('fetch', function (event) {
  console.log('[ServiceWorker] Fetch', event.request.url)

  let caching = caches.match(event.request).then((response) => {
    return response || fetch(event.request)
  })

  event.respondWith(caching)
})