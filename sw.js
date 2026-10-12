const CACHE = "simulator-id-v3";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "css/01-tokens.css",
  "css/02-base.css",
  "css/03-layout.css",
  "css/04-board.css",
  "css/05-panel.css",
  "css/06-modal.css",
  "css/07-guide.css",
  "css/08-online.css",
  "css/09-mobile.css",
  "css/10-desktop.css",
  "css/11-market.css",
  "css/12-icons.css",
  "js/01-fiskal.js",
  "js/02-data-game.js",
  "js/03-tampilan.js",
  "js/04-aset.js",
  "js/05-berita.js",
  "js/06-bank-peran.js",
  "js/07-transaksi.js",
  "js/08-pengaturan.js",
  "js/09-market.js",
  "js/10-permainan.js",
  "js/11-interaksi.js",
  "js/12-panduan.js",
  "js/12a-kopdes.js",
  "js/13-multiplayer.js",
  "js/14-ikon-emoji.js",
  "js/15-ux.js",
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
