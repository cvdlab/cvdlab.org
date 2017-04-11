const CACHE = 'cvdlab-cache-0.0.1'

const files = [
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

  '/scripts/ga.js',
  '/scripts/page.js',
  '/scripts/tawk.js'
]

self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Install')
  event.waitUntil(precache())
})

self.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Activate')
  event.waitUntil(clear_caches())
  return self.clients.claim()
})

self.addEventListener('fetch', function (event) {
  console.log('[ServiceWorker] Fetch', event.request.url)
  event.respondWith(from_cache(event.request))
  event.waitUntil(update(event.request))
})

function precache () {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(files)
  })
}

function clear_caches () {
  return caches.keys().then((keys) => {
    return Promise.all(keys.map((key) => {
      if (key !== CACHE) {
        console.log('[ServiceWorker] Removing old cache', key)
        return caches.delete(key)
      }
    }))
  })
}

function from_cache (request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    })
  })
}

function update (request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response)
    })
  })
}