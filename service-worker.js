const CACHE_NAME = 'cvdlab-cache-0.0.4'

const files = [
  'https://unpkg.com/pantarei@1.7.0/dist/webcomponents',
  'https://unpkg.com/pantarei@1.7.0/dist/pantarei',

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

self.addEventListener('activate', function(event) {

  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
