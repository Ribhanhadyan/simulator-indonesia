const CACHE = "simulator-id-v28";
/* file inti: gagal satu tidak membatalkan instalasi (dulu cache.addAll gagal total bila ada 1 file hilang) */
const CORE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
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
  "css/13-replay.css",
  "css/14-tengah.css",
  "assets-visual.css",
  "assets-visual.js",
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
  "js/16-replay.js",
  "js/17-bandar.js",
  "js/18-sambung-aset.js",
  "js/19-stabil.js",
  "js/20-developer.js",
  "js/21-tengah.js",
];
/* aset gambar: dicache saat instalasi (best-effort) agar efek visual tetap muncul saat offline */
const IMAGES = [
  "png/fx/abu-a.png",
  "png/fx/abu-b.png",
  "png/fx/asap.png",
  "png/fx/foil-emas.png",
  "png/fx/foil-kilau.png",
  "png/fx/glow-biru.png",
  "png/fx/glow-emas.png",
  "png/fx/glow-merah.png",
  "png/fx/glow-putih.png",
  "png/fx/grain.png",
  "png/fx/hangus-sheet.png",
  "png/fx/jejak-jalur.png",
  "png/fx/jejak-kanan.png",
  "png/fx/jejak-kiri.png",
  "png/fx/kaca-retak.png",
  "png/fx/pita-merah.png",
  "png/fx/retak-layar.png",
  "png/fx/scanline.png",
  "png/fx/sirene-biru.png",
  "png/fx/sirene-merah.png",
  "png/fx/vignette.png",
  "png/ikon/amplop-tangan.png",
  "png/ikon/bocoran.png",
  "png/ikon/cuciuang.png",
  "png/ikon/informan.png",
  "png/ikon/lotre.png",
  "png/ikon/tutupmulut.png",
  "png/karakter/bandar-mata.png",
  "png/karakter/bandar.png",
  "png/karakter/oknum-sheet.png",
  "png/kartu/frame-kemampuan.png",
  "png/kartu/frame-peran.png",
  "png/kartu/frame-rak1.png",
  "png/kartu/frame-rak2.png",
  "png/kartu/frame-rak3.png",
  "png/kartu/frame-rak4.png",
  "png/kartu/frame-rak5.png",
  "png/latar/bokeh.png",
  "png/latar/debu.png",
  "png/latar/kertas-gelap.png",
  "png/latar/kertas-papan.png",
  "png/latar/koran-tile.png",
  "png/latar/meja-modal.png",
  "png/pion/pion-1.png",
  "png/pion/pion-2.png",
  "png/pion/pion-3.png",
  "png/pion/pion-4.png",
  "png/pion/pion-5.png",
  "png/pion/pion-6.png",
  "png/pion/pion-ott.png",
  "png/tiles/bandar.png",
  "png/tiles/bebas.png",
  "png/tiles/berita.png",
  "png/tiles/kesempatan.png",
  "png/tiles/mk.png",
  "png/tiles/ott.png",
  "png/tiles/pajak.png",
  "png/tiles/penjara.png",
  "png/tiles/properti.png",
  "png/tiles/start.png",
  "png/uang/bendera-sheet.png",
  "png/uang/peti-buka.png",
  "png/uang/peti-tutup.png",
  "png/uang/uang-lusuh.png",
  "png/ui/emblem-bandar.png",
  "png/ui/emblem-negara.png",
  "png/ui/emblem-oknum.png",
];

/* Install: berkas inti WAJIB selesai (diambil langsung dari jaringan, bukan cache HTTP lama);
   gambar di-cache di latar belakang dan tidak menahan aktivasi, jadi update tidak terasa lama. */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => {
      const get = (u) => fetch(new Request(u, { cache: "reload" })).then((r) => (r.ok ? c.put(u, r) : null));
      Promise.allSettled(IMAGES.map(get)); /* sengaja tidak di-await */
      return Promise.allSettled(CORE.map(get));
    }).then(() => self.skipWaiting()),
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

/* Cache dulu (instan, juga saat offline / jaringan lambat), lalu perbarui diam-diam di latar belakang.
   Versi baru tetap terbit lewat kenaikan nama CACHE di atas (install memuat ulang semua berkas inti). */
const swr = (e, r, key) =>
  caches.match(key || r, { ignoreSearch: true }).then((m) => {
    const net = fetch(r)
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const cp = res.clone();
          caches.open(CACHE).then((c) => c.put(key || r, cp)).catch(() => {});
        }
        return res;
      })
      .catch(() => null);
    if (m) {
      e.waitUntil(net);
      return m;
    }
    return net.then((res) => res || (r.mode === "navigate" ? caches.match("index.html") : Response.error()));
  });

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(swr(e, r, r.mode === "navigate" ? "index.html" : null));
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(swr(e, r));
  }
});
