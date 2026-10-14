/* ===== assets-visual.js — efek visual Simulator Indonesia (tanpa dependensi) =====
   Pakai: <link rel="stylesheet" href="assets-visual.css"><script src="assets-visual.js"></script>
   lalu panggil initKiosGelapFX() sekali setelah game load. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // tingkat efek global: 'low' | 'med' | 'high'
  // perangkat lemah (RAM/CPU kecil) atau mode hemat data -> efek berat (canvas, blend-mode layar penuh, blur) dimatikan
  const lemah = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || !!(navigator.connection && navigator.connection.saveData);
  window.FX_LEVEL = window.FX_LEVEL || (RM || lemah ? 'low' : 'med');
  const lv = () => ({ low: 0, med: 1, high: 2 }[window.FX_LEVEL] ?? 1);
  const $ = (s, r = document) => r.querySelector(s);
  const el = (c, p = document.body, tag = 'div') => { const e = document.createElement(tag); e.className = c; p.appendChild(e); return e; };
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const anim = (e, kf, o) => (lv() === 0 ? null : e.animate(kf, o)); // WAAPI, mati di level low
  let root, layers = {}, cv, ctx, raf, last = 0, dust = [];

  // ---- lapisan layar ----
  const LAYER = { vignette: 'fx-vignette', abu: 'fx-abu', retak: 'fx-retak', kaca: 'fx-kaca', sirM: 'fx-sirene-m', sirB: 'fx-sirene-b', scan: 'fx-scan', grain: 'fx-grain' };
  // status -> lapisan yang menyala (minimal level efek)
  const STATE = {
    kekacauan: [['vignette', 0], ['abu', 2]],
    ott: [['sirM', 0], ['sirB', 1]],
    skandal: [['kaca', 1]],
    razia: [['vignette', 0]],
    'bandar-tinggi': [['vignette', 0]],
  };
  const active = {};
  function setState(name, on = true) {
    active[name] = on;
    document.body.classList.toggle('fx-' + name, on && (name === 'razia' || name === 'bandar-tinggi'));
    const need = {};
    Object.keys(active).forEach(k => active[k] && (STATE[k] || []).forEach(([l, min]) => { if (lv() >= min) need[l] = 1; }));
    Object.keys(layers).forEach(l => layers[l].classList.toggle('on', !!need[l] || l === 'grain' && lv() >= 1));
  }

  // ---- partikel ambient (canvas 2D, throttle ~30 fps) ----
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (t - last < 33 || document.hidden) return; last = t;
    const W = innerWidth, H = innerHeight;
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    ctx.clearRect(0, 0, W, H);
    const n = [0, 18, 40][lv()]; while (dust.length < n) dust.push({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.6, v: 0.1 + Math.random() * 0.3, a: Math.random() });
    dust.length = n;
    for (const d of dust) {
      d.y -= d.v; d.x += Math.sin((d.y + d.a * 99) / 40) * 0.2; if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
      ctx.fillStyle = `rgba(230,210,170,${0.15 + d.a * 0.3})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.3); ctx.fill();
    }
  }

  // jalankan/hentikan animasi partikel sesuai level efek (sebelumnya tidak pernah menyala lagi setelah level low)
  function syncLoop() {
    if (!cv) return;
    if (lv() && !raf) raf = requestAnimationFrame(loop);
    else if (!lv() && raf) { cancelAnimationFrame(raf); raf = 0; dust.length = 0; ctx.clearRect(0, 0, cv.width, cv.height); }
  }

  // ---- API ----
  const FX = {
    set: setState,
    /* petak: 'glow' | 'razia' | 'denyut' pada #t<i> */
    petak(i, jenis = 'glow') {
      const t = $('#t' + i); if (!t) return; const c = { glow: 'fx-glow', razia: 'fx-razia-kilat', denyut: 'fx-denyut' }[jenis];
      t.classList.remove(c); void t.offsetWidth; t.classList.add(c); setTimeout(() => t.classList.remove(c), 2000);
    },
    /* lampu kios menyala saat mendarat di mk */
    mkLampu(i) { const t = i == null ? $('.t.mk') : $('#t' + i); if (!t) return; t.classList.remove('mk-nyala'); void t.offsetWidth; t.classList.add('mk-nyala'); },
    /* kartu: buka(e, jackpot) / hangus(e) */
    kartuBuka(e, jackpot) { e.classList.add('buka'); if (jackpot && lv()) e.classList.add('jackpot'); },
    kartuHangus(e) { e.classList.add('hangus'); this.asap(e); },
    asap(e) {
      if (!lv()) return; const r = e.getBoundingClientRect();
      for (let k = 0; k < 3 * lv(); k++) {
        const s = el('', document.body); s.style.cssText = `position:fixed;left:${r.left + r.width / 2 - 32}px;top:${r.top + r.height * 0.5}px;width:64px;height:64px;pointer-events:none;z-index:945;background:url(png/fx/asap.png) -${(k % 4) * 64}px 0/256px 64px`;
        s.animate([{ transform: 'translateY(0) scale(.6)', opacity: .8 }, { transform: `translate(${(Math.random() - .5) * 40}px,-90px) scale(1.6)`, opacity: 0 }], { duration: 1400 + k * 200, delay: k * 150, easing: 'ease-out' }).onfinish = () => s.remove();
      }
    },
    jejakKaki(kartuEl, on = true) { let j = kartuEl.querySelector('.fx-jejak'); if (on && !j) el('fx-jejak', kartuEl); if (!on && j) j.remove(); },
    /* uang terbang dari elemen a ke elemen b (n lembar) */
    uang(a, b, n = 5) {
      if (!lv()) return; n = Math.min(n, 4 + 3 * lv());
      const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
      for (let k = 0; k < n; k++) {
        const u = el('fx-uang'); const x0 = A.left + A.width / 2, y0 = A.top + A.height / 2, x1 = B.left + B.width / 2, y1 = B.top + B.height / 2;
        const mx = (x0 + x1) / 2 + (Math.random() - .5) * 120, my = Math.min(y0, y1) - 60 - Math.random() * 60;
        u.animate([
          { transform: `translate(${x0}px,${y0}px) rotate(${Math.random() * 40 - 20}deg) scale(1)`, opacity: 1 },
          { transform: `translate(${mx}px,${my}px) rotate(${Math.random() * 180}deg) scale(1.1)`, opacity: 1, offset: .5 },
          { transform: `translate(${x1}px,${y1}px) rotate(${Math.random() * 360}deg) scale(.4)`, opacity: .2 }],
          { duration: 900 + Math.random() * 400, delay: k * 90, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'backwards' }).onfinish = () => u.remove();
      }
      b.classList.add('denyut'); setTimeout(() => b.classList.remove('denyut'), 1000);
    },
    /* APBN: uang jatuh dari atas ke bendera */
    apbn(bendera, n = 6) {
      if (!lv()) return; const B = bendera.getBoundingClientRect();
      for (let k = 0; k < n; k++) { const u = el('fx-uang'); const x = B.left + B.width / 2 + (Math.random() - .5) * 80;
        u.animate([{ transform: `translate(${x}px,-30px) rotate(${Math.random() * 60}deg)`, opacity: 1 }, { transform: `translate(${x + 20}px,${B.top}px) rotate(${Math.random() * 300}deg) scale(.5)`, opacity: .1 }],
          { duration: 1100, delay: k * 140, easing: 'ease-in', fill: 'backwards' }).onfinish = () => u.remove(); }
    },
    breaking(teks, ms = 7000) {
      const b = $('.fx-breaking') || (() => { const x = el('fx-breaking', $('#board') || document.body); x.innerHTML = '<span></span>'; x.setAttribute('role', 'status'); return x; })();
      b.firstChild.textContent = '● BREAKING ● ' + teks + ' ● ' + teks; b.classList.add('on'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('on'), ms);
    },
    skandal(headline, ms = 4000) {
      const s = $('.fx-skandal') || el('fx-skandal'); s.textContent = headline; s.classList.add('on'); setState('skandal', true);
      setTimeout(() => { s.classList.remove('on'); setState('skandal', false); }, ms);
    },
    /* transisi antar-fase: gulungan koran; cb dipanggil saat layar tertutup */
    wipe(cb) {
      const w = $('.fx-wipe') || el('fx-wipe'); if (!lv()) { cb && cb(); return; }
      w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); setTimeout(() => cb && cb(), 450);
    },
    /* layar akhir: 'negara' | 'bandar' | 'oknum' */
    hasil(jenis, judul, sub = '') {
      if (!['negara', 'bandar', 'oknum'].includes(jenis)) jenis = 'negara';
      const h = $('.fx-hasil') || el('fx-hasil'); h.className = 'fx-hasil ' + jenis;
      h.innerHTML = `<div><div class="fx-emblem ${jenis}"></div><h2 style="font:700 28px var(--font-d,Impact)">${esc(judul)}</h2><p>${esc(sub)}</p></div>`;
      requestAnimationFrame(() => h.classList.add('on'));
    },
    /* sparkline Kas Bandar: data = array angka; panas = true -> merah */
    sparkline(host, data, panas) {
      if (!host || !data || !data.length) return;
      const w = 100, h = 30, mn = Math.min(...data), mx = Math.max(...data) || 1, dx = w / Math.max(1, data.length - 1);
      const d = data.map((v, i) => (i ? 'L' : 'M') + (i * dx).toFixed(1) + ' ' + (h - 2 - ((v - mn) / (mx - mn || 1)) * (h - 4)).toFixed(1)).join('');
      host.innerHTML = `<svg class="fx-spark ${data[data.length - 1] > data[data.length - 2] ? 'naik' : ''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}" ${panas ? 'style="stroke:var(--c-alarm)"' : ''}/></svg>`;
    },
    /* opsional: pantau variabel global `bandar` tanpa mengubah kode game */
    autoPantau(ms = 1500) {
      clearInterval(FX._pantau);
      FX._pantau = setInterval(() => {
        if (typeof bandar === 'undefined') return;
        setState('razia', !!bandar.tiarap);
        setState('bandar-tinggi', bandar.modalAwal > 0 && bandar.kas / bandar.modalAwal > 1.5);
      }, ms);
    },
  };

  window.SimFX = FX;
  // inisialisasi tunggal; aman dipanggil berulang
  window.initKiosGelapFX = function () {
    if (root) return; document.documentElement.dataset.fx = window.FX_LEVEL;
    root = el('', document.body); root.id = 'fx-root';
    for (const k in LAYER) layers[k] = el(LAYER[k], root);
    cv = el('', root, 'canvas'); cv.classList.add('on'); ctx = cv.getContext('2d');
    layers.grain.classList.add('on'); syncLoop();
    // kelas bantu lotre untuk mode razia: tandai bagian Lotre di modal Kios Gelap (hanya #mod, ditunda ke frame berikutnya)
    const mod = document.getElementById('mod'); let lt = 0;
    if (mod) new MutationObserver(() => {
      if (lt) return;
      lt = requestAnimationFrame(() => {
        lt = 0;
        mod.querySelectorAll('.sec,[data-lotre]').forEach(n => { const h = n.matches('.sec') ? n.firstElementChild : n; n.classList.toggle('fx-lotre', !!h && /lotre/i.test(h.textContent)); });
      });
    }).observe(mod, { childList: true, subtree: true });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', e => window.setFXLevel(e.matches ? 'low' : 'med'));
  };
  window.setFXLevel = (l) => { if (!['low', 'med', 'high'].includes(l)) return; window.FX_LEVEL = l; document.documentElement.dataset.fx = l; Object.keys(active).forEach(k => setState(k, active[k])); syncLoop(); };
})();
