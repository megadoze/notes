const staticCacheName = "static-site-1";
const dynamicCacheName = "dynamyc-site-1";

const ASSETS = [
  "/",
  "/index.html",
  "/src/index.css",
  "/src/App.tsx",
  "/src/main.tsx",
  "/src/assets/img/notes.avif",
  "/src/pages/main/MainPage.jsx",
  "/src/pages/main/main.css",
  "/src/pages/login/LoginPage.jsx",
  "/src/pages/login/login.css",
];

// self.addEventListener("install", async (event) => {
//   const cache = await caches.open(staticCacheName);
//   await cache.addAll(ASSETS);
// });
self.addEventListener("install", async (event) => {
  let cacheUrls = async () => {
    const cache = await caches.open(staticCacheName);
    return cache.addAll(ASSETS);
  };
  event.waitUntil(cacheUrls());
});

self.addEventListener("activate", async (event) => {
  const cachesKeysArr = await caches.keys();
  await Promise.all(
    cachesKeysArr
      .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
      .map((key) => caches.delete(key))
  );
});

self.addEventListener("fetch", (event) => {
  // event.respondWith(cacheFirst(event.request));
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request).then((response) => {
          return caches.open(dynamicCacheName).then((cache) => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        })
      );
    })
  );
});

// async function cacheFirst(request) {
//   const cached = await caches.match(request);
//   try {
//     return (
//       cached ??
//       (await fetch(request).then((response) => {
//         return response || networkFirst(request);
//       }))
//     );
//   } catch (error) {
//     // console.log("error", error);
//     return networkFirst(request);
//   }
// }

// async function networkFirst(request) {
//   const cache = await caches.open(dynamicCacheName);
//   try {
//     const response = await fetch(request);
//     console.log(response);

//     await cache.put(request, response.clone());
//     return response;
//   } catch (error) {
//     console.log("error:", error);
//     const cached = await cache.match(request);
//     return cached || (await caches.match("/offline.html"));
//   }
// }
