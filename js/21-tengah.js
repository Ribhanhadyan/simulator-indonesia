/* ===== 21-tengah.js: PANORAMA TENGAH PAPAN (Fase 1) =====
   Mengubah tengah papan (#ctr) menjadi adegan hidup:
   - langit + cuaca mengikuti stress level 5 fase dari mesin berita (nChaos / nPh / NPH)
   - siluet kota Indonesia (Monas, gedung, rumah gadang, kelapa)
   - HUD atas: suasana nasional + Dana APBN
   - ticker berita di bawah: berita terbaru, ekonomi berlaku, presiden, proyek, krisis
   - FASE 2: proyek tol (crane, ruas dibangun bertahap, mangkrak, resmi dibuka) dari jumlah aset negara
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
    `</svg>`;

  /* ---------- FASE 2: PROYEK PEMERINTAH (Tol Trans-Nusantara) ----------
     Murni visual, diturunkan dari state yang sudah ada (tidak mengubah aturan, tidak menambah state simpanan):
     - tiap aset negara (nneg(): hasil PSN / penyitaan) = 1 ruas tol yang dibangun (maks SEG ruas)
     - ada aset negara baru  -> crane bekerja dan ruas digambar bertahap
     - fiskal ketat (FZ.L >= PJ_STALL) -> proyek MANGKRAK: crane & ruas berhenti, papan merah muncul
     - program Presiden "Percepat" membangun lebih cepat, "Efisiensi" lebih lambat
     - semua ruas jadi -> tol resmi dibuka (konfeti), mobil & truk melintas di ruas yang sudah jadi */
  const SEG = 6,
    SW = 50,
    PJ_STALL = 0.35;
  const car = (x, y, w, col, d, dl, rev) =>
    `<g class="car${rev ? " b2" : ""}" style="--cd:${d}s;animation-delay:${dl}s"><rect class="o1" x="${x}" y="${y}" width="${w}" height="${w > 10 ? 6 : 4}" rx="1" style="fill:${col}"/>` +
    `<circle class="wh" cx="${x + 2}" cy="${y + (w > 10 ? 6 : 4)}" r="1.2"/><circle class="wh" cx="${x + w - 2}" cy="${y + (w > 10 ? 6 : 4)}" r="1.2"/></g>`;
  const ROAD = (() => {
    let g = "";
    for (let i = 0; i < SEG; i++) {
      const x = i * SW;
      g +=
        `<g class="sg" style="--x:${x}px">` +
        [9, 34].map((px) => `<rect class="o pl" x="${x + px - 1.6}" y="21" width="3.2" height="15"/>`).join("") +
        `<rect class="o dk2" x="${x}" y="14" width="${SW}" height="7"/>` +
        `<path class="rl" d="M${x} 11.8H${x + SW}"/><path class="ds" d="M${x + 2} 17.6H${x + SW - 2}"/></g>`;
    }
    return (
      `<svg class="rd" viewBox="0 0 300 36" preserveAspectRatio="xMidYMax meet" aria-hidden="true">` +
      g +
      `<g class="gate"><rect class="o1" x="2" y="5" width="7" height="9" style="fill:#fffdf6"/><rect class="o1" x="2" y="5" width="7" height="2.6" style="fill:var(--brand)"/></g>` +
      `<g class="cars">` +
      car(0, 9.6, 9, "var(--brand)", 9, -1) +
      car(0, 9.6, 9, "var(--blue)", 12, -6) +
      car(0, 7.6, 14, "#f7941d", 15, -3, 1) +
      car(0, 9.6, 9, "var(--gold)", 11, -9, 1) +
      `</g>` +
      /* crane: dasar di x=0 (digeser lewat CSS), tinggi sampai y=-8 */
      `<g class="cr"><g class="dst"><circle cx="-9" cy="33" r="3"/><circle cx="-13" cy="31" r="2.4"/><circle cx="-5" cy="32" r="2"/></g>` +
      `<path class="o cn" d="M-12 36L-10 30L-8 36Z"/><path class="o cn" d="M-17 36L-15 30L-13 36Z"/>` +
      `<rect class="o crc" x="-1.8" y="-6" width="3.6" height="42"/>` +
      `<path class="lt" d="M-1.8 2L1.8 8M-1.8 8L1.8 2M-1.8 12L1.8 18M-1.8 18L1.8 12M-1.8 22L1.8 28M-1.8 28L1.8 22"/>` +
      `<g class="jb"><rect class="o crc" x="-17" y="-8.6" width="42" height="2.8"/><rect class="o cw" x="-19" y="-7.6" width="6" height="5"/>` +
      `<path class="cab" d="M21 -5.8V3.6"/><rect class="o hk" x="19" y="3.6" width="4" height="3"/></g>` +
      `<g class="stl"><rect class="o1" x="-19" y="-24" width="38" height="10"/><path class="o1" d="M-1 -14V-8.6" fill="none"/><text x="0" y="-16.4">MANGKRAK</text></g></g>` +
      `</svg>`
    );
  })();

  const SUN =
    `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="ray">` +
    [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="50" y1="6" x2="50" y2="16" transform="rotate(${a} 50 50)"/>`).join("") +
    `</g><circle class="disc" cx="50" cy="50" r="26"/></svg>`;
  const CLOUD = `<svg viewBox="0 0 60 30" aria-hidden="true"><path d="M8 27C1 27 1 17 9 16C9 8 19 6 23 12C26 3 39 4 41 13C49 10 57 16 53 23C53 26 50 27 48 27Z"/></svg>`;
  const BIRD = `<svg viewBox="0 0 20 10" aria-hidden="true"><path d="M1 2Q5 1 10 7Q15 1 19 2"/></svg>`;
  const BOLT = `<svg viewBox="0 0 30 60" aria-hidden="true"><path d="M18 1L4 32H14L9 59L27 22H16Z"/></svg>`;

const PLANE = `<svg viewBox="0 0 60 20" aria-hidden="true"><path d="M2 10H12" stroke-dasharray="3 3"/><path d="M16 9L40 7Q52 7 56 10Q52 13 40 13L16 11Z" fill="#fffdf6"/><path d="M30 8L24 1H29L38 8M30 12L24 19H29L38 12" fill="#c9281d"/><path d="M18 9L14 4H18L22 9" fill="#c9281d"/></svg>`;
  const BALLOON = `<svg viewBox="0 0 24 34" aria-hidden="true"><path d="M12 1C5 1 2 7 3 12C4 17 9 20 12 22C15 20 20 17 21 12C22 7 19 1 12 1Z" fill="#f4b400"/><path d="M12 1C8 5 8 17 12 22C16 17 16 5 12 1Z" fill="#c9281d"/><path d="M9 22L10 27H14L15 22" fill="none"/><rect x="9.5" y="27" width="5" height="4" fill="#7a4a24"/></svg>`;
  const FW = `<div class="sk-fw" id="sk-fw">${[0, 1, 2].map((n) => `<i class="b b${n}">${Array.from({ length: 10 }, (_, k) => `<u style="--a:${k * 36}deg"></u>`).join("")}</i>`).join("")}</div>`;
  const KERETA = `<svg viewBox="0 0 120 14" aria-hidden="true">${[0, 1, 2].map((i) => `<rect x="${i * 30}" y="2" width="27" height="9" rx="1.5" fill="${["#f4b400", "#fffdf6", "#c9281d"][i]}" stroke="#111" stroke-width="1.2"/><path d="M${i * 30 + 4} 5H${i * 30 + 23}" stroke="#2a6fb5" stroke-width="2.4"/>`).join("")}<path d="M90 11V4Q90 2 93 2H110L118 7V11Z" fill="#c9281d" stroke="#111" stroke-width="1.2"/><path d="M100 5H108L111 8H100Z" fill="#9bd6f5" stroke="#111" stroke-width=".8"/><circle cx="12" cy="11.5" r="2" fill="#111"/><circle cx="42" cy="11.5" r="2" fill="#111"/><circle cx="72" cy="11.5" r="2" fill="#111"/><circle cx="96" cy="11.5" r="2" fill="#111"/><circle cx="110" cy="11.5" r="2" fill="#111"/></svg>`;

  const SKY =
    `<div class="sk" id="sk" aria-hidden="true">` +
    [0, 1, 2, 3, 4].map((i) => `<i class="sk-bg p${i}"></i>`).join("") +
    `<div class="sk-sun">${SUN}</div>` +
    `<div class="sk-bird">${BIRD}</div><div class="sk-bird b2">${BIRD}</div>` +
    `<div class="sk-cl c1">${CLOUD}</div><div class="sk-cl c2">${CLOUD}</div><div class="sk-cl c3">${CLOUD}</div>` +
    `<div class="sk-plane">${PLANE}</div><div class="sk-ball">${BALLOON}</div>${FW}<div class="sk-storm"></div><div class="sk-haze"></div>` +
    `<div class="sk-ground"></div><div class="sk-city">${CITY}</div><div class="sk-train">${KERETA}</div><div class="sk-road">${ROAD}</div><div class="sk-town" id="sk-town"></div>` +
    `<div class="sk-rain r1"></div><div class="sk-rain r2"></div>` +
    `<div class="sk-sir m"></div><div class="sk-sir b"></div>` +
    `<div class="sk-bolt">${BOLT}</div><div class="sk-flash"></div></div>`;
  const HUD =
    `<div class="hud" id="hud" aria-hidden="true"><span class="ph"><i class="dot"></i><em id="hud-n">Stabil</em><span class="mt"><i></i></span></span>` +
    `<span class="ap">APBN <b id="hud-a">Rp0</b><em id="hud-u" hidden></em></span></div>` +
    `<div class="mon" id="mon" aria-hidden="true"><div class="fw">${"<i></i>".repeat(8)}</div><b class="mt">Kekayaan</b><div class="bars" id="mon-b"></div><i class="ped"></i></div>` +
    `<div class="pj-note" id="pj-note" aria-hidden="true"></div>` +
    `<div class="pj-conf" id="pj-conf" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="--l:${(i * 6.1 + 3) % 98}%;--c:${["#f4b400", "#c9281d", "#2f6bff", "#1b7f3a", "#fffdf6"][i % 5]};animation-delay:-${((i * 0.37) % 3).toFixed(2)}s"></i>`).join("")}</div>` +
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

  /* ---------- logika proyek (lihat penjelasan di atas) ---------- */
  const RM = matchMedia("(prefers-reduced-motion:reduce)");
  const pj = { init: false, shown: 0, building: -1, timer: 0, left: 0, t0: 0, stall: false, noteT: 0, confT: 0, pend: false };
  const pjDur = () => {
    if (lite() || RM.matches) return 0.5;
    let d = 7;
    try {
      d *= PRES.pg == "cepat" ? 0.65 : PRES.pg == "efisiensi" ? 1.4 : 1;
    } catch (e) {}
    return d;
  };
  const pjNote = (t, bad) => {
    const n = q("#pj-note");
    if (!n) return;
    n.textContent = t;
    n.classList.toggle("bad", !!bad);
    n.classList.add("on");
    clearTimeout(pj.noteT);
    pj.noteT = setTimeout(() => n.classList.remove("on"), 4200);
  };
  const pjDone = () => {
    const c = q("#pj-conf");
    if (!c || lite() || RM.matches) return;
    c.classList.add("on");
    clearTimeout(pj.confT);
    pj.confT = setTimeout(() => c.classList.remove("on"), 6500);
  };
  const pjInfo = () => {
    if (!pj.shown && pj.building < 0 && !pj.pend) return null;
    return `Tol Trans-Nusantara ${pj.shown}/${SEG}` + (pj.shown >= SEG ? " · resmi dibuka" : pj.building >= 0 ? (pj.stall ? " · MANGKRAK, kas APBN seret" : " · ruas baru dibangun") : pj.pend && pj.stall ? " · MANGKRAK, menunggu kas APBN pulih" : "");
  };
  function pjDraw(tgt) {
    const svg = q(".sk-road svg");
    if (!svg) return;
    svg.querySelectorAll(".sg").forEach((g, i) => {
      g.classList.toggle("done", i < pj.shown);
      g.classList.toggle("bld", i === pj.building);
    });
    svg.classList.toggle("has", pj.shown > 0 || pj.building >= 0);
    svg.style.setProperty("--W", pj.shown * SW + "px");
    pj.pend = tgt > pj.shown || pj.building >= 0;
    const cr = svg.querySelector(".cr");
    cr.classList.toggle("show", pj.pend);
    cr.classList.toggle("mv", pj.building >= 0);
    if (pj.building >= 0) {
      cr.style.setProperty("--x0", pj.building * SW + "px");
      cr.style.setProperty("--x1", (pj.building + 1) * SW + "px");
    }
    cr.style.setProperty("--cx", (pj.building >= 0 ? pj.building + 1 : pj.shown) * SW + "px");
    ctr.classList.toggle("pj-stall", pj.stall && pj.pend);
  }
  /* kembang api perayaan (tol rampung) */
  let fwT = 0;
  function kembangApi() {
    const el = q("#sk-fw");
    if (!el || lite()) return;
    el.classList.remove("go");
    void el.offsetWidth;
    el.classList.add("go");
    clearTimeout(fwT);
    fwT = setTimeout(() => el.classList.remove("go"), 4200);
  }
  function pjFinish() {
    pj.timer = 0;
    pj.shown = pj.building + 1;
    pj.building = -1;
    if (pj.shown >= SEG) {
      pjNote("Tol Trans-Nusantara resmi dibuka!");
      kembangApi();
      pjDone();
    } else pjNote(`Ruas tol ${pj.shown}/${SEG} selesai`);
    pjStep();
    paintTicker();
  }
  function pjStep() {
    let tgt = 0;
    try {
      tgt = Math.min(SEG, nneg());
    } catch (e) {
      return;
    }
    let stall = false;
    try {
      stall = FZ.L >= PJ_STALL;
    } catch (e) {}
    if (!pj.init || tgt < pj.shown || (pj.building >= 0 && tgt <= pj.building)) {
      /* muat simpanan / game baru / aset negara berkurang: langsung ke keadaan akhir, tanpa animasi */
      clearTimeout(pj.timer);
      pj.timer = 0;
      pj.building = -1;
      pj.shown = tgt;
      pj.init = true;
      pj.stall = stall;
      pjDraw(tgt);
      return;
    }
    const was = pj.stall;
    pj.stall = stall;
    if (pj.building >= 0) {
      if (stall && pj.timer) {
        clearTimeout(pj.timer);
        pj.timer = 0;
        pj.left = Math.max(300, pj.left - (Date.now() - pj.t0));
      } else if (!stall && !pj.timer) {
        pj.t0 = Date.now();
        pj.timer = setTimeout(pjFinish, pj.left);
      }
    } else if (pj.shown < tgt && !stall) {
      const d = pjDur();
      pj.building = pj.shown;
      pj.left = d * 1000;
      pj.t0 = Date.now();
      pj.timer = setTimeout(pjFinish, pj.left);
      const svg = q(".sk-road svg");
      if (svg) svg.style.setProperty("--bt", d + "s");
      pjNote(`PSN: ruas tol ${pj.building + 1}/${SEG} dibangun`);
    }
    pjDraw(tgt);
    if (stall && !was && pj.pend) pjNote("Proyek mangkrak: kas APBN seret", true);
    else if (!stall && was && pj.pend) pjNote("Kas APBN pulih: proyek dilanjutkan");
  }

  function ticker() {
    const it = [];
    hist.forEach((h) => it.push(["Berita", h]));
    try {
      if (ECO && ECO.d) it.push(["Ekonomi", `${ECO.n} (${ECO.d} putaran lagi)`]);
    } catch (e) {}
    try {
      if (PRES.id >= 0 && P[PRES.id]) it.push(["Istana", `Presiden ${P[PRES.id].n}`]);
    } catch (e) {}
    const pi = pjInfo();
    if (pi) it.push(["Proyek", pi]);
    try {
      if (crS()) it.push(["Krisis", `Tahap ${crS()}: sewa ${kali(crM())}, gaji ${kali(crG())}`]);
    } catch (e) {}
    try {
      if (NG.d > 0) it.push(["Utang", `Utang negara ${fm(NG.d)} dari plafon ${fm(NG_MAX)}`]);
    } catch (e) {}
    try {
      if (FZ.L >= 0.05) it.push(["Fiskal", `${fzLabel(FZ.L)[0]}: pajak ${kali(fzTax())}`]);
    } catch (e) {}
    if (!it.length) it.push(["Info", "Belum ada kabar penting. Negara masih tenang."]);
    return it;
  }

  /* ticker (dibangun ulang hanya bila isinya berubah, supaya gulirannya tidak terputus) */
  /* Isi ticker baru diterapkan di batas putaran (animationiteration) supaya teks tidak melompat di tengah jalan. */
  let tkWait = null;
  function tkApply() {
    const t = q("#tvs-t");
    if (!t || !tkWait) return;
    t.innerHTML = tkWait.html;
    t.style.setProperty("--dur", tkWait.dur);
    tkWait = null;
  }
  function paintTicker() {
    const items = ticker(),
      key = JSON.stringify(items);
    if (key === last.tk) return;
    last.tk = key;
    const t = q("#tvs-t");
    if (!t) return;
    const one = `<span>${items.map((x) => `<b>${esc(x[0])}</b>${esc(x[1])}`).join('<b style="margin:0 .9em">◆</b>')}</span>`;
    const len = items.reduce((a, x) => a + x[0].length + x[1].length + 6, 0);
    tkWait = { html: one + one.replace("<span>", '<span aria-hidden="true">'), dur: Math.max(22, Math.round(len * 0.33)) + "s" };
    let run = false;
    try {
      run = !!t.innerHTML && t.getAnimations().some((a) => a.playState === "running");
    } catch (e) {}
    if (!run) {
      tkApply();
      return;
    }
    if (!t.dataset.bound) {
      t.dataset.bound = "1";
      t.addEventListener("animationiteration", tkApply);
    }
    clearTimeout(paintTicker.tm);
    paintTicker.tm = setTimeout(tkApply, 70000); /* jaga-jaga bila animasi berhenti */
  }

  /* ---------- Fase 3: kampung (Kopdes, dapur MBG, Kios Gelap) + tugu kekayaan ----------
     Semua turunan dari state yang sudah ada; tidak ada aturan baru. */
  const S1 = 'stroke="#111" stroke-width="1.3" stroke-linejoin="round"';
  const kopdesSp = (x, col, tg, n) =>
    `<g class="sp${n}" transform="translate(${x} 40)"><rect x="-11" y="-14" width="22" height="14" fill="#fffdf6" ${S1}/><path d="M-14-14L0-24L14-14Z" fill="${col}" ${S1}/>` +
    `<rect x="-8" y="-11" width="16" height="3.6" fill="#f4b400" stroke="#111" stroke-width=".8"/><rect x="-3" y="-7" width="6" height="7" fill="#7a4a24" stroke="#111" stroke-width=".8"/>` +
    (tg ? `<path d="M0-24V-33L8-30.5L0-28" fill="#c9281d" ${S1}/>` : "") +
    `</g>`;
  const mbgSp = (x, stall, n) =>
    `<g class="sp${n}" transform="translate(${x} 40)"><rect x="-15" y="-13" width="30" height="13" fill="#ffe08a" ${S1}/><rect x="-15" y="-15" width="30" height="3" fill="#c9281d" ${S1}/>` +
    `<rect x="6" y="-24" width="5" height="10" fill="#d8d2c4" ${S1}/>` +
    `<rect x="-11" y="-9" width="9" height="5" fill="#9bd6f5" stroke="#111" stroke-width=".8"/><rect x="0" y="-9" width="9" height="5" fill="#9bd6f5" stroke="#111" stroke-width=".8"/>` +
    (stall
      ? `<path d="M-5-30L5-20M5-30L-5-20" stroke="#c9281d" stroke-width="2.4" stroke-linecap="round"/>`
      : `<g class="stm"><circle cx="8.5" cy="-28" r="2.6"/><circle cx="8.5" cy="-28" r="2.6"/><circle cx="8.5" cy="-28" r="2.6"/></g>`) +
    `</g>`;
  const bandarSp = (x, st, n) =>
    `<g class="sp${n} bd ${st}" transform="translate(${x} 40)"><rect x="-10" y="-17" width="20" height="17" fill="#3a2a5c" ${S1}/>` +
    `<path d="M-12-17L-9-24H9L12-17Z" fill="#fffdf6" ${S1}/><path d="M-6-24L-7-17M0-24V-17M6-24L7-17" stroke="#7a52d0" stroke-width="2"/>` +
    (st === "tutup"
      ? `<path d="M-8-14H8M-8-11H8M-8-8H8M-8-5H8" stroke="#8d8d8d" stroke-width="1.2"/>`
      : `<rect x="-7" y="-14" width="14" height="9" fill="#17102b" stroke="#111" stroke-width=".8"/><circle cx="0" cy="-11" r="2.6" fill="#e8b98a"/><path d="M-4-5Q0-9.5 4-5Z" fill="#111"/>`) +
    (st === "razia" ? `<circle class="bs a" cx="-5" cy="-27" r="2.6"/><circle class="bs b" cx="5" cy="-27" r="2.6"/>` : "") +
    `</g>`;
  const paintTown = () => {
    const el = q("#sk-town");
    if (!el) return;
    let kd = [],
      mb = 0,
      stall = false,
      bd = "",
      tg = 0;
    try {
      kd = Object.keys(own)
        .filter((i) => own[i].kd && P[own[i].o])
        .map((i) => P[own[i].o].c);
      mb = Object.keys(own).reduce((a, i) => a + (own[i].mb || 0), 0);
      stall = P.some((p) => !p.x && (p.mt || 0) > 0);
      tg = kdTgAll();
      if (bdBuka()) bd = bandar.tiarap ? "razia" : bdKepepet() ? "kepepet" : "buka";
    } catch (e) {}
    const k = [kd.join(","), mb, stall ? 1 : 0, tg > 0 ? 1 : 0, bd].join("|");
    if (el.dataset.k === k) return;
    el.dataset.k = k;
    let g = "";
    const now = new Set(),
      old = last.sp || new Set(),
      nw_ = (id) => (now.add(id), old.has(id) || !last.spInit ? "" : " new");
    kd.slice(0, 4).forEach((c, i) => (g += kopdesSp(72 + i * 25, c, tg > 0, nw_("k" + i))));
    for (let i = 0; i < Math.min(2, Math.ceil(mb / 2)); i++) g += mbgSp(240 + i * 36, stall, nw_("m" + i));
    if (bd) g += bandarSp(184, bd, nw_("b"));
    last.sp = now;
    last.spInit = 1;
    el.innerHTML = g ? `<svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMax meet">${g}</svg>` : "";
  };
  const paintMon = () => {
    const b = q("#mon-b"),
      m = q("#mon");
    if (!b || !m) return;
    let L = [];
    try {
      L = P.filter((p) => !p.x).map((p) => ({ c: p.c, v: Math.max(0, nw(p)) }));
    } catch (e) {}
    const mx = Math.max(1, ...L.map((x) => x.v)),
      top = L.length ? L.reduce((a, x, i) => (x.v > L[a].v ? i : a), 0) : -1;
    const k = L.map((x) => x.c + Math.round((x.v / mx) * 24)).join(",") + "|" + top;
    if (b.dataset.k === k) return;
    b.dataset.k = k;
    m.hidden = !L.length;
    const lc = top >= 0 && L.length > 1 ? L[top].c : "";
    if (lc && last.lead && lc !== last.lead && !lite()) {
      m.style.setProperty("--fc", lc);
      m.classList.remove("win");
      void m.offsetWidth;
      m.classList.add("win");
    }
    last.lead = lc;
    b.innerHTML = L.map((x, i) => `<span class="mbr${i === top && L.length > 1 ? " lead" : ""}" style="--h:${Math.max(8, Math.round((x.v / mx) * 100))}%;--bc:${x.c}"></span>`).join("");
  };

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
    let ut = 0;
    try {
      ut = NG.d || 0;
    } catch (e) {}
    const apk = ap + "|" + ut;
    if (apk !== last.ap) {
      last.ap = apk;
      const a = q("#hud-a"),
        u = q("#hud-u");
      if (a) a.textContent = ap;
      if (u) {
        u.hidden = !ut;
        u.textContent = ut ? "utang " + fm(ut) : "";
      }
    }

    /* proyek pemerintah (tol) */
    pjStep();
    paintTown();
    paintMon();

    /* judul berita terbaru */
    try {
      const h = NW.last;
      if (h && h !== hist[0]) {
        hist.unshift(h);
        hist.length = Math.min(hist.length, 3);
      }
    } catch (e) {}

    paintTicker();
  }

  /* ---------- panel "Situasi negara" (samping meter stress): isi barisnya = pesan giliran di tengah papan ----------
     15-ux.js menulis judul berita ke #nh .nt setiap render; kita menimpanya dengan teks #now (mis. "Budi melempar 5 + 4 = 9").
     Judul berita lengkap tetap ada di dalam panel (dibuka) dan di ticker. */
  const syncNow = () => {
    const nt = document.querySelector("#nh .nt"),
      n = document.querySelector("#now");
    if (!nt || !n) return;
    const t = n.textContent.trim();
    if (t && nt.textContent !== t) nt.textContent = t;
  };
  try {
    const nh = document.querySelector("#nh"),
      nw = document.querySelector("#now");
    const mo = new MutationObserver(syncNow);
    if (nh) mo.observe(nh, { childList: true, subtree: true, characterData: true });
    if (nw) mo.observe(nw, { childList: true, subtree: true, characterData: true });
  } catch (e) {}

  /* dipanggil setiap render() selesai (render sudah dibungkus 15-ux.js; kita bungkus sekali lagi) */
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    try {
      update();
      syncNow();
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
