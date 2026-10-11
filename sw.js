const CACHE = "simulator-id-v1";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `css/${String(n).padStart(2, "0")}-${["tokens", "base", "layout", "board", "panel", "modal", "guide", "online", "mobile", "desktop", "market", "icons"][n - 1]}.css`),
  ...["fiskal", "data-game", "tampilan", "aset", "berita", "bank-peran", "transaksi", "pengaturan", "market", "permainan", "interaksi", "panduan", "multiplayer", "ikon-emoji", "ux"].map(
    (s, i) => `js/${String(i + 1).padStart(2, "0")}-${s}.js`,
  ),
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(
      fetch(r)
        .then((res) => {
          if (res.ok) {
            const cp = res.clone();
            caches.open(CACHE).then((c) => c.put(r, cp));
          }
          return res;
        })
        .catch(() => caches.match(r).then((m) => m || (r.mode === "navigate" ? caches.match("index.html") : Response.error()))),
    );
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(
      caches.match(r).then(
        (m) =>
          m ||
          fetch(r).then((res) => {
            const cp = res.clone();
            caches.open(CACHE).then((c) => c.put(r, cp));
            return res;
          }),
      ),
    );
  }
});
