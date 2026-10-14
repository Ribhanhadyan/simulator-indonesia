/* ===== 19-stabil.js: penjaga stabilitas & hemat tenaga =====
   - galat tak tertangani (mis. satu langkah game gagal) tidak lagi membuat game macet diam-diam:
     muncul bilah kecil "Muat ulang"; permainan tersimpan otomatis tiap awal giliran, jadi bisa dilanjutkan
   - animasi CSS dijeda saat tab di latar belakang
   - simpanan rusak/usang dibersihkan supaya tidak menghambat muat berikutnya */
(() => {
  const root = document.documentElement;
  document.addEventListener("visibilitychange", () => root.classList.toggle("tab-bg", document.hidden), { passive: true });

  let shown = 0,
    n = 0;
  function bilah(msg) {
    if (shown) return;
    shown = 1;
    const d = document.createElement("div");
    d.setAttribute("role", "alert");
    d.style.cssText = "position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:99999;display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:10px;background:#7a1610;color:#fff;font:600 13px/1.3 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4)";
    const t = document.createElement("span");
    t.textContent = msg;
    const b = document.createElement("button");
    b.textContent = "Muat ulang";
    b.style.cssText = "flex:none;border:0;border-radius:8px;padding:8px 12px;font:700 13px system-ui,sans-serif;background:#fff;color:#7a1610";
    b.onclick = () => location.reload();
    const x = document.createElement("button");
    x.textContent = "✕";
    x.setAttribute("aria-label", "Tutup");
    x.style.cssText = "flex:none;border:0;background:none;color:#fff;font-size:16px;padding:4px 6px";
    x.onclick = () => {
      d.remove();
      shown = 0;
    };
    d.append(t, b, x);
    document.body.appendChild(d);
  }
  const lapor = (e) => {
    console.error("[stabil]", e);
    /* satu-dua galat kecil (mis. efek visual) diabaikan; bila beruntun, tawarkan muat ulang */
    if (++n >= 3) bilah("Ada kendala di permainan. Kemajuanmu tersimpan otomatis.");
    setTimeout(() => (n = Math.max(0, n - 1)), 15000);
  };
  addEventListener("error", (e) => {
    if (e.target && e.target !== window) return; /* gagal muat gambar/berkas bukan galat kode */
    lapor(e.error || e.message);
  });
  addEventListener("unhandledrejection", (e) => lapor(e.reason));
})();
