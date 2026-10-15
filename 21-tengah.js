/* ===== 21-tengah.js: PANORAMA TENGAH PAPAN (Fase 1) =====
   Mengubah tengah papan (#ctr) menjadi adegan hidup:
   - langit + cuaca mengikuti stress level 5 fase dari mesin berita (nChaos / nPh / NPH)
   - siluet kota Indonesia (Monas, gedung, rumah gadang, kelapa) dengan slot kosong #sk-slot untuk proyek (Fase 2)
   - HUD atas: suasana nasional + Dana APBN
   - ticker berita di bawah: berita terbaru, ekonomi berlaku, presiden, krisis
   Murni tampilan: tidak mengubah aturan, state, atau simpanan. Semua elemen aria-hidden (informasi yang sama
   sudah ada di panel Situasi negara & log). Dimuat SETELAH 20-developer.js (bergantung pada render() yang
   dibungkus 15-ux.js). Mode hemat (gerak dikurangi / FX_LEVEL low) dikendalikan CSS lewat kelas .tg-lite. */
(() => {
  const ctr = document.querySelector("#ctr");
  if (!ctr) return;

  /* ---------- siluet kota (SVG dibangun dari kode supaya jendela tidak ditulis satu per satu) ---------- */
  const wins = (x, y, w, h, cols, rows, skip) => {
    let s = "";
    const cw = w / cols,
      rh = h / rows;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (skip && (r * 7 + c * 3 + x) % skip == 0) continue;
        s += `<rect class="w" x="${(x + c * cw + cw * 0.22).toFixed(1)}" y="${(y + r * rh + rh * 0.2).toFixed(1)}" width="${(cw * 0.5).toFixed(1)}" height="${(rh * 0.5).toFixed(1)}"/>`;
      }
    return s;
  };
  const palm = (x, h) =>
    `<g><path class="o" fill="none" d="M${x} 100 Q${x + 3} ${100 - h * 0.5} ${x + 1} ${100 - h}"/>` +
    `<path class="o fp" d="M${x + 1} ${100 - h} Q${x - 9} ${100 - h - 3} ${x - 13} ${100 - h + 6} Q${x - 6} ${100 - h - 1} ${x + 1} ${100 - h}Z"/>` +
    `<path class="o fp" d="M${x + 1} ${100 - h} Q${x + 11} ${100 - h - 3} ${x + 15} ${100 - h + 6} Q${x + 8} ${100 - h - 1} ${x + 1} ${100 - h}Z"/>` +
    `<path class="o fp" d="M${x + 1} ${100 - h} Q${x - 3} ${100 - h - 11} ${x - 9} ${100 - h - 9} Q${x - 2} ${100 - h - 7} ${x + 1} ${100 - h}Z"/>` +
    `<path class="o fp" d="M${x + 1} ${100 - h} Q${x + 5} ${100 - h - 11} ${x + 11} ${100 - h - 9} Q${x + 4} ${100 - h - 7} ${x + 1} ${100 - h}Z"/></g>`;

  /* Monas di kiri (x=62) supaya tidak tertutup dadu & pesan yang selalu ada di tengah papan */
  const MX = 62;
  const CITY =
    `<svg viewBox="0 0 300 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">` +
    palm(10, 34) +
    /* MONAS */
    `<rect class="o f4" x="${MX - 22}" y="92" width="44" height="8"/><rect class="o f4" x="${MX - 16}" y="85" width="32" height="7"/>` +
    `<path class="o f4" d="M${MX - 6} 85L${MX - 2} 36H${MX + 2}L${MX + 6} 85Z"/>` +
    `<rect class="o f4" x="${MX - 11}" y="55" width="22" height="5"/>` +
    `<g class="flame"><path class="o fg" d="M${MX} 19C${MX - 5} 26 ${MX - 5} 31 ${MX} 35C${MX + 5} 31 ${MX + 5} 26 ${MX} 19Z"/></g>` +
    /* rumah-rumah kecil */
    `<path class="o f3" d="M92 100V86L101 78L110 86V100Z"/><rect class="w" x="98" y="90" width="6" height="6"/>` +
    `<path class="o f1" d="M110 100V84L118 77L126 84V100Z"/><rect class="w" x="115" y="88" width="6" height="6"/>` +
    /* gedung DPR (kubah) */
    `<rect class="o f1" x="130" y="76" width="40" height="24"/>` +
    `<path class="o f4" d="M138 76a12 12 0 0 1 24 0Z"/>` +
    `<path class="o" fill="none" d="M150 64V57"/><path class="o fr" d="M150 57h7v4h-7Z"/>` +
    wins(132, 82, 36, 16, 6, 2, 0) +
    /* gedung tengah-kanan (rendah) */
    `<rect class="o f2" x="174" y="58" width="22" height="42"/>` +
    wins(174, 58, 22, 42, 3, 7, 4) +
    `<rect class="o f3" x="198" y="72" width="20" height="28"/>` +
    wins(198, 72, 20, 28, 3, 4, 5) +
    /* gedung kanan (tinggi) */
    `<rect class="o f2" x="222" y="44" width="22" height="56"/><path class="o" fill="none" d="M233 44V34"/>` +
    wins(222, 44, 22, 56, 3, 8, 4) +
    `<rect class="o f1" x="246" y="60" width="24" height="40"/>` +
    wins(246, 60, 24, 40, 4, 5, 5) +
    /* rumah gadang */
    `<rect class="o f3" x="272" y="86" width="24" height="14"/>` +
    `<path class="o fr" d="M268 86L272 74Q276 78 280 78Q284 78 288 78Q292 78 296 74L300 86Z"/>` +
    `<rect class="w" x="281" y="90" width="6" height="10"/>` +
    palm(84, 24) +
    /* FASE 2: slot proyek pemerintah (jalan tol, crane, dll) akan digambar di sini */
    `<g id="sk-slot"></g>` +
    `</svg>`;

  const SUN =
    `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="ray">` +
    [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="50" y1="6" x2="50" y2="16" transform="rotate(${a} 50 50)"/>`).join("") +
    `</g><circle class="disc" cx="50" cy="50" r="26"/></svg>`;
  const CLOUD = `<svg viewBox="0 0 60 30" aria-hidden="true"><path d="M8 27C1 27 1 17 9 16C9 8 19 6 23 12C26 3 39 4 41 13C49 10 57 16 53 23C53 26 50 27 48 27Z"/></svg>`;
  const BIRD = `<svg viewBox="0 0 20 10" aria-hidden="true"><path d="M1 2Q5 1 10 7Q15 1 19 2"/></svg>`;
  const BOLT = `<svg viewBox="0 0 30 60" aria-hidden="true"><path d="M18 1L4 32H14L9 59L27 22H16Z"/></svg>`;

  const SKY =
    `<div class="sk" id="sk" aria-hidden="true">` +
    [0, 1, 2, 3, 4].map((i) => `<i class="sk-bg p${i}"></i>`).join("") +
    `<div class="sk-sun">${SUN}</div>` +
    `<div class="sk-bird">${BIRD}</div><div class="sk-bird b2">${BIRD}</div>` +
    `<div class="sk-cl c1">${CLOUD}</div><div class="sk-cl c2">${CLOUD}</div><div class="sk-cl c3">${CLOUD}</div>` +
    `<div class="sk-storm"></div><div class="sk-haze"></div>` +
    `<div class="sk-ground"></div><div class="sk-city">${CITY}</div>` +
    `<div class="sk-rain r1"></div><div class="sk-rain r2"></div>` +
    `<div class="sk-sir m"></div><div class="sk-sir b"></div>` +
    `<div class="sk-bolt">${BOLT}</div><div class="sk-flash"></div></div>`;
  const HUD =
    `<div class="hud" id="hud" aria-hidden="true"><span class="ph"><i class="dot"></i><em id="hud-n">Stabil</em><span class="mt"><i></i></span></span>` +
    `<span class="ap">APBN <b id="hud-a">Rp0</b></span></div>` +
    `<div class="tvs" id="tvs" aria-hidden="true"><span class="lb">Berita</span><div class="vw"><div class="tr" id="tvs-t"></div></div></div>`;

  /* pasang ke #ctr (aman dipanggil ulang: mis. bila isi #ctr diganti oleh mode Online) */
  const pasang = () => {
    if (!ctr.querySelector("#sk")) ctr.insertAdjacentHTML("afterbegin", SKY);
    if (!ctr.querySelector("#hud")) ctr.insertAdjacentHTML("beforeend", HUD);
  };

  /* ---------- data ---------- */
  const q = (s) => ctr.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const kali = (n) => "×" + (Math.round(n * 100) / 100).toString().replace(".", ",");
  const hist = []; /* judul berita terbaru (maks 3), terbaru di depan */
  let last = { ph: -1, c: -1, ap: "", tk: "", lite: null };

  const lite = () => {
    try {
      return window.FX_LEVEL === "low";
    } catch (e) {
      return false;
    }
  };

  function ticker() {
    const it = [];
    hist.forEach((h) => it.push(["Berita", h]));
    try {
      if (ECO && ECO.d) it.push(["Ekonomi", `${ECO.n} (${ECO.d} putaran lagi)`]);
    } catch (e) {}
    try {
      if (PRES.id >= 0 && P[PRES.id]) it.push(["Istana", `Presiden ${P[PRES.id].n}`]);
    } catch (e) {}
    try {
      if (crS()) it.push(["Krisis", `Tahap ${crS()}: sewa ${kali(crM())}, gaji ${kali(crG())}`]);
    } catch (e) {}
    try {
      if (FZ.L >= 0.05) it.push(["Fiskal", `${fzLabel(FZ.L)[0]}: pajak ${kali(fzTax())}`]);
    } catch (e) {}
    if (!it.length) it.push(["Info", "Belum ada kabar penting. Negara masih tenang."]);
    return it;
  }

  function update() {
    pasang();
    let c, ph;
    try {
      c = nChaos();
      ph = nPh(c);
    } catch (e) {
      return; /* game belum siap (menu awal) */
    }

    /* suasana */
    if (ph !== last.ph) {
      ctr.dataset.ph = ph;
      last.ph = ph;
      try {
        const z = NPH[ph];
        const n = q("#hud-n");
        if (n) n.textContent = z[0];
        ctr.style.setProperty("--pc", z[2]);
      } catch (e) {}
    }
    if (c !== last.c) {
      last.c = c;
      ctr.style.setProperty("--c", c + "%");
    }
    const lt = lite();
    if (lt !== last.lite) {
      last.lite = lt;
      ctr.classList.toggle("tg-lite", lt);
    }

    /* Dana APBN */
    let ap = "";
    try {
      ap = fm(POOL);
    } catch (e) {}
    if (ap !== last.ap) {
      last.ap = ap;
      const a = q("#hud-a");
      if (a) a.textContent = ap;
    }

    /* judul berita terbaru */
    try {
      const h = NW.last;
      if (h && h !== hist[0]) {
        hist.unshift(h);
        hist.length = Math.min(hist.length, 3);
      }
    } catch (e) {}

    /* ticker (dibangun ulang hanya bila isinya berubah, supaya gulirannya tidak terputus) */
    const items = ticker(),
      key = JSON.stringify(items);
    if (key !== last.tk) {
      last.tk = key;
      const t = q("#tvs-t");
      if (t) {
        const one = `<span>${items.map((x) => `<b>${esc(x[0])}</b>${esc(x[1])}`).join('<b style="margin:0 .9em">◆</b>')}</span>`;
        t.innerHTML = one + one.replace("<span>", '<span aria-hidden="true">');
        const len = items.reduce((a, x) => a + x[0].length + x[1].length + 6, 0);
        t.style.setProperty("--dur", Math.max(22, Math.round(len * 0.33)) + "s");
      }
    }
  }

  /* dipanggil setiap render() selesai (render sudah dibungkus 15-ux.js; kita bungkus sekali lagi) */
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    try {
      update();
    } catch (e) {
      console.error("Panorama tengah", e);
    }
    return r;
  };
  pasang();
  try {
    update();
  } catch (e) {}
})();
