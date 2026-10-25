/* ===== 21-tengah.js: PANORAMA TENGAH PAPAN (Fase 1) =====
   Mengubah tengah papan (#ctr) menjadi adegan hidup:
   - langit + cuaca mengikuti stress level 5 fase dari mesin berita (nChaos / nPh / NPH)
   - siluet kota Indonesia (Monas, gedung, rumah gadang, kelapa)
   - HUD atas: suasana nasional + Dana APBN
   - ticker berita di bawah: berita terbaru, ekonomi berlaku, presiden, proyek, krisis
   - FASE 2: proyek tol (crane, ruas dibangun bertahap, mangkrak, resmi dibuka) dari jumlah aset negara
   - FASE 2b: hutan di belakang kota. Seri berita "Kebakaran Hutan dan Lahan" (NW.kh) membakar petak hutan, kabut asap menyelimuti kota,
     Presiden memilih atasi (helikopter water bombing) atau biarkan, lalu bekas hutan menjadi kebun sawit
   - FASE 2c: warga kecil di jalur depan kota; aktivitasnya mengikuti berita terbaru (NW.ev) dan tahap karhutla
   Murni tampilan: tidak mengubah aturan, state, atau simpanan (keadaan hutan NW.kh ditulis oleh 05-berita.js). Semua elemen aria-hidden (informasi yang sama
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

  /* ---------- FASE 2b: HUTAN (kebakaran hutan -> bekas hutan jadi lahan sawit) ----------
     Murni visual, dibaca dari NW.kh yang ditulis seri berita "Kebakaran Hutan dan Lahan" (05-berita.js).
     Bukit hutan di belakang kota dibagi KHN petak. Nilai petak: 0 hutan hijau, 1 terbakar, 2 hangus,
     3 dibuka & ditanami bibit sawit, 4 kebun sawit dewasa. Kabut asap & helikopter water bombing mengikuti tahap seri. */
  const KHN = typeof KH_N == "number" ? KH_N : 8,
    FH = 114;
  const rr = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const f1 = (n) => (Math.round(n * 10) / 10).toString();
  const hy = (x) => 60 - 12 * Math.sin((x / 300) * Math.PI * 1.25 + 0.5) - 4 * Math.sin(x / 23);
  const palma = (x, yb, h) => {
    const t = yb - h;
    return (
      `<g><path class="o1 pk1" fill="none" d="M${f1(x)} ${f1(yb)}Q${f1(x + 1.2)} ${f1(yb - h / 2)} ${f1(x)} ${f1(t)}"/>` +
      `<path class="o1 fr1" d="M${f1(x)} ${f1(t)}Q${f1(x - 6)} ${f1(t - 3.4)} ${f1(x - 9.4)} ${f1(t + 3.6)}Q${f1(x - 4)} ${f1(t - 0.6)} ${f1(x)} ${f1(t)}Z"/>` +
      `<path class="o1 fr1" d="M${f1(x)} ${f1(t)}Q${f1(x + 6)} ${f1(t - 3.4)} ${f1(x + 9.4)} ${f1(t + 3.6)}Q${f1(x + 4)} ${f1(t - 0.6)} ${f1(x)} ${f1(t)}Z"/>` +
      `<path class="o1 fr1" d="M${f1(x)} ${f1(t)}Q${f1(x - 3)} ${f1(t - 8)} ${f1(x - 7)} ${f1(t - 7)}Q${f1(x - 2)} ${f1(t - 4.6)} ${f1(x)} ${f1(t)}Z"/>` +
      `<path class="o1 fr1" d="M${f1(x)} ${f1(t)}Q${f1(x + 3)} ${f1(t - 8)} ${f1(x + 7)} ${f1(t - 7)}Q${f1(x + 2)} ${f1(t - 4.6)} ${f1(x)} ${f1(t)}Z"/>` +
      `<circle class="bn" cx="${f1(x - 1.2)}" cy="${f1(t + 1.6)}" r="1.3"/><circle class="bn" cx="${f1(x + 1.4)}" cy="${f1(t + 2)}" r="1.3"/></g>`
    );
  };
  const FOREST = (() => {
    const W = 300 / KHN,
      bx = (i, d) => (i <= 0 || i >= KHN ? i * W : i * W + (rr(i * 7 + d) - 0.5) * 7);
    let plots = "",
      outline = `M0 ${f1(hy(0))}`;
    let base = `M0 ${FH}L0 ${f1(hy(0))}`;
    for (let x = 4; x <= 300; x += 4) {
      outline += `L${x} ${f1(hy(x))}`;
      base += `L${x} ${f1(hy(x))}`;
    }
    base += `L300 ${FH}Z`;
    for (let i = 0; i < KHN; i++) {
      const x0 = i * W,
        x1 = x0 + W;
      /* batas antarpetak bergerigi (bukan garis lurus) supaya petak yang terbakar menyatu dengan lereng */
      let gr = `M${f1(bx(i, 0))} ${f1(hy(bx(i, 0)))}`;
      for (let x = bx(i, 0) + 4; x < bx(i + 1, 0); x += 4) gr += `L${f1(x)} ${f1(hy(x))}`;
      [0, 11, 22, 34].forEach((d) => {
        const x = bx(i + 1, d);
        gr += `L${f1(x)} ${f1(hy(x) + d)}`;
      });
      for (let x = bx(i + 1, 34) - 4; x > bx(i, 34); x -= 4) gr += `L${f1(x)} ${f1(hy(x) + 34)}`;
      [34, 22, 11].forEach((d) => {
        const x = bx(i, d);
        gr += `L${f1(x)} ${f1(hy(x) + d)}`;
      });
      gr += "Z";
      let tr = "",
        fl = "",
        sm = "",
        ch = "",
        sb = "",
        sw = "";
      for (let k = 0; k < 5; k++) {
        const x = x0 + (k + 0.5) * (W / 5) + (rr(i * 11 + k) - 0.5) * 3,
          yb = hy(x) + 2,
          th = 9 + rr(i * 5 + k + 3) * 7,
          cy = yb - th - 2,
          rx = 5.4 + rr(i * 7 + k) * 2,
          ry = 4.4 + rr(i * 3 + k + 1) * 1.5;
        tr += `<g><rect class="o1 tk" x="${f1(x - 0.8)}" y="${f1(cy)}" width="1.6" height="${f1(yb - cy)}"/><ellipse class="o1 cn c${k % 3}" cx="${f1(x)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}"/><ellipse class="cl2 c${k % 3}" cx="${f1(x - rx * 0.35)}" cy="${f1(cy + 0.8)}" rx="${f1(rx * 0.5)}" ry="${f1(ry * 0.55)}"/></g>`;
        ch += `<path class="hk" d="M${f1(x)} ${f1(yb)}L${f1(x)} ${f1(cy + 1)}M${f1(x)} ${f1(cy + 3)}l-2.6 -2.4M${f1(x)} ${f1(cy + 5)}l2.4 -2.2"/>`;
        if (k < 4)
          fl +=
            `<g class="fmg" style="animation-delay:-${(rr(i * 13 + k) * 1.4).toFixed(2)}s"><path class="o1 fm" d="M${f1(x)} ${f1(cy - 7)}C${f1(x + 4)} ${f1(cy - 3)} ${f1(x + 4.4)} ${f1(cy + 1)} ${f1(x)} ${f1(cy + 2.6)}C${f1(x - 4.4)} ${f1(cy + 1)} ${f1(x - 4)} ${f1(cy - 3)} ${f1(x)} ${f1(cy - 7)}Z"/>` +
            `<path class="fm2" d="M${f1(x)} ${f1(cy - 3)}C${f1(x + 2)} ${f1(cy - 1)} ${f1(x + 2)} ${f1(cy + 1)} ${f1(x)} ${f1(cy + 2)}C${f1(x - 2)} ${f1(cy + 1)} ${f1(x - 2)} ${f1(cy - 1)} ${f1(x)} ${f1(cy - 3)}Z"/></g>`;
        if (k < 4) sm += `<circle class="sc" cx="${f1(x)}" cy="${f1(cy - 4)}" r="3.6" style="animation-delay:-${(rr(i * 17 + k) * 7).toFixed(2)}s"/>`;
      }
      /* lahan dibuka: barisan tanah + bibit sawit mengikuti lereng */
      [7, 14, 21].forEach((d) => {
        let p = "";
        for (let x = x0 + 1; x <= x1 - 1; x += 6) p += (p ? "L" : "M") + `${f1(x)} ${f1(hy(x) + d)}`;
        sb += `<path class="so" d="${p}"/>`;
      });
      for (let j = 0; j < 6; j++) {
        const x = x0 + 3 + (j * (W - 6)) / 5,
          y = hy(x) + 6 + (j % 2) * 7;
        sb += `<path class="sd" d="M${f1(x)} ${f1(y)}v-3M${f1(x)} ${f1(y - 1.6)}l-2 -1.6M${f1(x)} ${f1(y - 1.6)}l2 -1.6"/>`;
      }
      for (let j = 0; j < 4; j++) {
        const x = x0 + 4.5 + (j * (W - 9)) / 3;
        sw += palma(x, hy(x) + 3 + (j % 2) * 1.5, 11 + (j % 2) * 2);
      }
      plots += `<g class="pt s0"><path class="gr" d="${gr}"/><g class="tr">${tr}</g><g class="ch">${ch}</g><g class="sb">${sb}</g><g class="sw">${sw}</g><g class="fl">${fl}</g><g class="sm">${sm}</g></g>`;
    }
    /* sayap lereng: bukit diperpanjang melewati tepi kiri/kanan (svg overflow:visible) supaya di panel lebar
       bukitnya tetap membentang penuh sampai tepi panel, bukan hanya di tengah */
    const y0 = hy(0),
      y1 = hy(300),
      wl = `M-700 ${f1(y0 + 12)}C-400 ${f1(y0 + 8)} -200 ${f1(y0 + 1)} 0 ${f1(y0)}`,
      wr = `M300 ${f1(y1)}C500 ${f1(y1 - 1)} 700 ${f1(y1 + 5)} 1000 ${f1(y1 + 10)}`,
      wings =
        `<path class="hb hw" d="${wl}L0 ${FH}L-700 ${FH}Z"/><path class="hb hw" d="${wr}L1000 ${FH}L300 ${FH}Z"/>` +
        `<path class="hl" d="${wl}"/><path class="hl" d="${wr}"/>`;
    return `<svg viewBox="0 0 300 ${FH}" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${wings}<path class="hb" d="${base}"/>${plots}<path class="hl" d="${outline}"/></svg>`;
  })();

  /* helikopter water bombing (muncul bila Presiden memilih "Atasi") */
  const HELI =
    `<svg viewBox="0 0 64 36" aria-hidden="true"><g class="hb">` +
    `<path class="o1" d="M8 13Q8 6 20 6H32Q38 6 40 11L54 10V14L40 15Q38 20 30 20H18Q8 20 8 13Z" style="fill:#fffdf6"/>` +
    `<path class="o1" d="M13 8H24V13H10Q9 9 13 8Z" style="fill:#9bd6f5"/>` +
    `<path class="o1" d="M54 8L60 4V16L54 14Z" style="fill:#c9281d"/>` +
    `<path class="o1" d="M16 23H34" fill="none"/><path class="o1" d="M20 20V23M30 20V23" fill="none"/>` +
    `<g class="rt"><path class="o1" d="M3 4H46" fill="none"/></g><path class="o1" d="M24 4V6" fill="none"/>` +
    `<path class="o1" d="M25 23V27" fill="none"/><path class="o1" d="M20.5 27H29.5L28 32H22Z" style="fill:#4a90d9"/>` +
    `<g class="dr"><circle cx="22" cy="33" r="1.3"/><circle cx="25" cy="33" r="1.3"/><circle cx="28" cy="33" r="1.3"/></g></g></svg>`;

  /* ---------- FASE 2c: WARGA KECIL ----------
     Orang-orang kecil di jalur depan kota melakukan aktivitas sesuai berita terbaru (NW.ev) dan sesuai tahap kebakaran hutan.
     Tanpa berita baru, mereka mengikuti suasana nasional (5 fase). Semua digambar dari kode; tidak menambah state aturan. */
  const SKIN = ["#f1c9a0", "#d9a273", "#b57a4c", "#7a4a2a"],
    SHIRT = ["#c9281d", "#2f6bff", "#1b7f3a", "#f4b400", "#7a52d0", "#e8e2d0", "#f7941d", "#2aa5a0"],
    PKC = ["#c9281d", "#2f6bff", "#f7941d", "#1b7f3a"];
  /* alat peraga: slot h = kepala, x = di atas kepala, b = menimpa badan, a = di tangan kanan (ikut ayunan), g = di tanah */
  const PR = {
    helm: ["h", `<path class="o1" d="M-3.3 -16.4Q0 -20.8 3.3 -16.4Z" style="fill:#f4b400"/><rect class="o1" x="-3.9" y="-16.9" width="7.8" height="1.1" style="fill:#f4b400"/>`],
    helmm: ["h", `<path class="o1" d="M-3.3 -16.4Q0 -20.8 3.3 -16.4Z" style="fill:#e0301e"/><rect class="o1" x="-3.9" y="-16.9" width="7.8" height="1.1" style="fill:#e0301e"/>`],
    caping: ["h", `<path class="o1" d="M-6.4 -16.2L0 -22L6.4 -16.2Z" style="fill:#d9b86a"/>`],
    topi: ["h", `<path class="o1" d="M-3 -16.6Q0 -20 3 -16.6Z" style="fill:#2f6bff"/><path class="ln" d="M2.6 -16.6H6"/>`],
    peci: ["h", `<path class="o1" d="M-2.9 -17.4H2.9L2.6 -19.2H-2.6Z" style="fill:#111"/>`],
    ikat: ["h", `<rect x="-2.9" y="-17.6" width="5.8" height="1.2" style="fill:#c9281d"/>`],
    masker: ["h", `<rect class="o1" x="-2.3" y="-14.6" width="4.6" height="2.2" rx=".7" style="fill:#fffdf6"/>`],
    rompi: ["b", `<path d="M-2.7 -12.5L-2.9 -7H2.9L2.7 -12.5Z" style="fill:#f7941d"/><path d="M-1 -12.8V-7M1 -12.8V-7" style="stroke:#fffdf6;stroke-width:.9px;fill:none"/>`],
    rompim: ["b", `<path d="M-2.7 -12.5L-2.9 -7H2.9L2.7 -12.5Z" style="fill:#e0301e"/><path d="M-1 -12.8V-7M1 -12.8V-7" style="stroke:#fffdf6;stroke-width:.9px;fill:none"/>`],
    ember: ["a", `<path class="o1" d="M2.2 -7.4H5.8L5 -3.6H3Z" style="fill:#4a90d9"/><path class="ln" d="M2.2 -7.4Q4 -9.8 5.8 -7.4"/>`],
    jerigen: ["a", `<rect class="o1" x="2.4" y="-9" width="4" height="5" style="fill:#f7941d"/><rect class="o1" x="3.1" y="-9.9" width="1.8" height="1" style="fill:#c9281d"/>`],
    kamera: ["a", `<rect class="o1" x="2.6" y="-10" width="3.6" height="2.6" style="fill:#333"/><circle cx="4.4" cy="-8.7" r=".8" style="fill:#9bd6f5"/>`],
    mic: ["a", `<path class="ln" d="M3.6 -7L5.8 -10.6"/><circle class="o1" cx="6.1" cy="-11" r="1.2" style="fill:#c9281d"/>`],
    ponsel: ["a", `<rect class="o1" x="3.4" y="-9.6" width="1.9" height="3.2" rx=".4" style="fill:#222"/>`],
    clip: ["a", `<rect class="o1" x="2.6" y="-10.4" width="3.8" height="4.8" style="fill:#fffdf6"/><path class="ln" d="M3.5 -8.8H5.6M3.5 -7.3H5.6"/>`],
    tas: ["a", `<path class="o1" d="M2.4 -7H6.4L6 -2.6H2.9Z" style="fill:#e8d3a0"/><path class="ln" d="M3.2 -7Q4.4 -9.2 5.6 -7"/>`],
    kardus: ["a", `<rect class="o1" x="1.8" y="-10" width="5.4" height="4.2" style="fill:#c99a5b"/><path class="ln" d="M1.8 -8.6H7.2"/>`],
    bendera: ["a", `<path class="ln" d="M3.8 -6V-25"/><rect class="o1" x="3.8" y="-25" width="7.4" height="2.2" style="fill:#c9281d"/><rect class="o1" x="3.8" y="-22.8" width="7.4" height="2.2" style="fill:#fffdf6"/>`],
    kipas: ["a", `<path class="o1" d="M3.2 -9.4L7.6 -12.4L7.8 -8Z" style="fill:#f4b400"/>`],
    egrek: ["a", `<path class="ln" d="M3.6 -7L8.2 -26"/><path class="o1" d="M7.6 -26.4L11.4 -24.4L8.6 -22.8Z" style="fill:#b8b8b8"/>`],
    tandan: ["a", `<path class="o1" d="M2.2 -7.2H7L6.2 -3.4H3Z" style="fill:#b5541c"/><circle class="o1" cx="3.6" cy="-8" r="1.2" style="fill:#f7941d"/><circle class="o1" cx="5.6" cy="-8.3" r="1.2" style="fill:#f7941d"/>`],
    selang: ["a", `<path class="ln" d="M3.6 -7L8.4 -9.4"/><path class="wt" d="M8.4 -9.4Q14 -13 19 -6"/>`],
    bibit: ["a", `<path class="ln" d="M3.9 -7V-3.6"/><path class="o1" d="M3.9 -3.6Q1.6 -5.4 1.8 -3.2ZM3.9 -3.6Q6.2 -5.4 6 -3.2Z" style="fill:#3d9a4a"/>`],
    emas: ["a", `<path class="o1" d="M2.4 -7.6H6.6L5.6 -9.8H3.4Z" style="fill:#f4b400"/>`],
    cangkul: ["a", `<path class="ln" d="M3.6 -7L7.4 -1.6"/><path class="o1" d="M6.6 -1.6L10.4 -2L9.2 .6Z" style="fill:#999"/>`],
    plak: ["x", `<g class="pk"><path class="ln" d="M0 -17V-23"/><rect class="o1" x="-6" y="-31" width="12" height="8.4" style="fill:var(--pkc,#c9281d)"/><path class="wl" d="M-3.8 -28.4H3.8M-3.8 -26H2"/></g>`],
    tanya: ["x", `<text class="qm" x="0" y="-20" text-anchor="middle">?</text>`],
    seru: ["x", `<text class="qm" x="0" y="-20" text-anchor="middle">!</text>`],
    payung: ["x", `<path class="o1" d="M-8 -19Q0 -29 8 -19Z" style="fill:var(--pkc,#2f6bff)"/><path class="ln" d="M0 -19V-12"/>`],
    koper: ["g", `<rect class="o1" x="-9" y="-5" width="5.4" height="5" style="fill:#7a4a24"/>`],
    bola: ["g", `<circle class="o1 bl" cx="7" cy="-2" r="2" style="fill:#fffdf6"/>`],
  };
  /* benda tetap di jalur (antrean berbaris di sebelah kirinya) */
  const SP = {
    pompa: `<rect class="o1" x="-4" y="-17" width="8" height="17" style="fill:#c9281d"/><rect class="o1" x="-3" y="-14.5" width="6" height="5" style="fill:#9bd6f5"/><path class="ln" d="M4 -10Q8.4 -10 8.4 -5V-2"/><rect class="o1" x="-5.5" y="-1.4" width="11" height="1.4" style="fill:#555"/>`,
    loket: `<rect class="o1" x="-9" y="-8" width="18" height="8" style="fill:#fffdf6"/><path class="o1" d="M-11 -8L-8 -17H8L11 -8Z" style="fill:#c9281d"/><rect class="o1" x="-6.5" y="-12" width="5" height="4" style="fill:#c99a5b"/><rect class="o1" x="1" y="-12" width="5" height="4" style="fill:#c99a5b"/>`,
    tps: `<rect class="o1" x="-8" y="-14" width="16" height="14" style="fill:#fffdf6"/><path class="o1" d="M-9 -14L0 -21L9 -14Z" style="fill:#2f6bff"/><rect class="o1" x="-3" y="-8" width="6" height="8" style="fill:#7a4a24"/><rect class="o1" x="9.5" y="-5" width="5" height="5" style="fill:#ddd"/>`,
    lapak: `<rect class="o1" x="-10" y="-7" width="20" height="7" style="fill:#d9b86a"/><path class="o1" d="M-12 -7L-9 -17H9L12 -7Z" style="fill:#f7941d"/><path class="wl" d="M-4 -17L-6 -7M0 -17V-7M4 -17L6 -7"/><circle class="o1" cx="-5" cy="-8.6" r="1.6" style="fill:#c9281d"/><circle class="o1" cx="0" cy="-8.6" r="1.6" style="fill:#f4b400"/><circle class="o1" cx="5" cy="-8.6" r="1.6" style="fill:#3d9a4a"/>`,
    truk: `<rect class="o1" x="-13" y="-10" width="17" height="8" style="fill:#fffdf6"/><circle class="o1" cx="-9" cy="-11" r="2.2" style="fill:#f7941d"/><circle class="o1" cx="-4.6" cy="-11.4" r="2.2" style="fill:#f7941d"/><circle class="o1" cx="-0.4" cy="-11" r="2.2" style="fill:#f7941d"/><path class="o1" d="M4 -10H10L13.4 -5.4V-2H4Z" style="fill:#c9281d"/><circle cx="-8" cy="-1.6" r="2.4" style="fill:#111"/><circle cx="8.6" cy="-1.6" r="2.4" style="fill:#111"/>`,
  };
  const f = (a, ...p) => ({ a, p });
  /* aktivitas: c = keterangan (tampil di ticker), s = benda tetap, x = posisi benda, q = berbaris antre, f = para warga
     anim: wk jalan, rn lari, id diam, wv melambai, pl mengacungkan poster, wr bekerja, ju melompat, co batuk, sp menyemprot air */
  const SCN = {
    tenang: { c: "Warga menikmati suasana tenang", f: [f("wk"), f("wk", "topi"), f("ju", "kid", "bola"), f("ju", "kid"), f("wv"), f("wk", "tas"), f("rn")] },
    sibuk: { c: "Warga sibuk bekerja dan berbelanja", f: [f("wk", "tas"), f("wk", "tas", "topi"), f("wk", "ponsel"), f("wv"), f("wk"), f("wk", "tas"), f("ju", "kid")] },
    gerah: { c: "Cuaca panas, warga mulai gerah", f: [f("wk", "kipas"), f("wk", "kipas", "topi"), f("id", "kipas"), f("wv"), f("wk", "topi"), f("wk", "ponsel"), f("id")] },
    resah: { c: "Warga resah dan mulai berkumpul", f: [f("id", "plak"), f("wk", "ponsel"), f("id", "tanya"), f("wk", "payung"), f("id", "plak", "ikat"), f("wk"), f("co")] },
    rusuh: { c: "Situasi rusuh, warga berlarian", f: [f("rn", "tas"), f("rn"), f("rn", "ponsel"), f("pl", "plak", "ikat"), f("pl", "plak", "ikat"), f("co"), f("wk", "payung")] },
    sawit: { c: "Harga sawit naik, petani memanen", s: "truk", x: 270, f: [f("wr", "caping", "egrek"), f("wr", "caping", "egrek"), f("id", "caping", "tandan"), f("wk", "caping", "tandan"), f("id", "caping"), f("wk", "topi")] },
    wisata: { c: "Wisatawan membludak", f: [f("wk", "topi", "kamera"), f("wk", "tas", "koper"), f("id", "kamera"), f("wv", "topi"), f("wk", "kamera", "topi"), f("ju", "kid"), f("wk", "koper")] },
    proyek: { c: "Pekerja proyek sibuk membangun", f: [f("wr", "helm", "rompi", "cangkul"), f("wr", "helm", "rompi", "cangkul"), f("id", "helm", "rompi", "clip"), f("wk", "helm", "rompi"), f("wr", "helm", "cangkul"), f("id", "helm", "rompi")] },
    pilkada: { c: "Warga mencoblos di TPS", s: "tps", x: 285, q: 1, f: [f("id"), f("id", "peci"), f("id"), f("wk", "bendera"), f("wv"), f("wk", "peci"), f("id", "topi")] },
    bansos: { c: "Warga antre bantuan sosial", s: "loket", x: 285, q: 1, f: [f("id", "kardus"), f("id"), f("id", "kardus"), f("id", "topi"), f("wk", "kardus"), f("wv")] },
    amal: { c: "Donasi CSR dibagikan ke warga", s: "loket", x: 285, q: 1, f: [f("id", "kardus"), f("id"), f("id", "kardus"), f("wv"), f("wk", "tas")] },
    pajak: { c: "Warga antre membayar pajak darurat", s: "loket", x: 285, q: 1, f: [f("id", "clip"), f("id", "clip"), f("id"), f("id", "ponsel"), f("wk", "tas"), f("co")] },
    bbm: { c: "Antre BBM di SPBU", s: "pompa", x: 285, q: 1, f: [f("id", "jerigen"), f("id", "jerigen"), f("id", "ponsel"), f("id", "jerigen"), f("wk", "jerigen"), f("co")] },
    pasar: { c: "Harga naik, warga mengeluh di pasar", s: "lapak", x: 285, q: 1, f: [f("id", "tas"), f("wv", "tas"), f("id", "kardus"), f("wv"), f("wk", "tas"), f("id", "tanya")] },
    modal: { c: "Pedagang menerima modal usaha", s: "lapak", x: 285, f: [f("wv"), f("wv", "topi"), f("id", "tas"), f("wk", "tas"), f("ju", "kid")] },
    syukur: { c: "Warga bersyukur dan bersuka cita", f: [f("ju"), f("ju", "emas"), f("wv"), f("ju", "kid"), f("wk", "emas"), f("wv"), f("wk")] },
    lesu: { c: "Warga lesu dan cemas", f: [f("id", "kardus"), f("id", "ponsel"), f("wk", "tas"), f("id"), f("wk", "kardus"), f("id", "tanya")] },
    demo: { c: "Warga berdemo di jalan", f: [f("pl", "plak", "ikat"), f("pl", "plak", "ikat"), f("pl", "plak"), f("pl", "plak", "ikat"), f("wv", "ikat"), f("wk", "bendera"), f("rn")] },
    audit: { c: "Petugas memeriksa dan menagih pajak", f: [f("id", "clip", "peci"), f("id", "clip", "peci"), f("wk", "kamera"), f("id", "tas"), f("wk", "clip", "peci")] },
    wartawan: { c: "Wartawan mengejar kabar", f: [f("wk", "mic"), f("wk", "mic"), f("id", "kamera"), f("id", "kamera"), f("id", "peci"), f("rn", "kamera")] },
    blusukan: { c: "Presiden blusukan, warga menyambut", f: [f("wv"), f("wv"), f("wv", "topi"), f("wk", "kamera"), f("id", "bendera"), f("ju", "kid"), f("id", "peci")] },
    bebas: { c: "Keluarga menyambut yang dibebaskan", f: [f("wv"), f("wv", "bendera"), f("ju"), f("ju", "kid"), f("wk")] },
    libur: { c: "Warga berlibur dan berpiknik", f: [f("wk", "tas", "topi"), f("ju", "kid", "bola"), f("ju", "kid", "bola"), f("wv"), f("wk", "koper"), f("wk", "topi")] },
    pinjol: { c: "Warga cemas urusan pinjol", f: [f("id", "ponsel"), f("id", "ponsel"), f("id", "ponsel", "tanya"), f("wk", "ponsel"), f("id")] },
    bingung: { c: "Warga bingung nama kota berubah", f: [f("id", "tanya"), f("id", "tanya"), f("wk", "tanya", "ponsel"), f("id", "tanya"), f("wk")] },
    kh0: { c: "Warga melihat titik api di kejauhan", f: [f("id", "ponsel"), f("id", "ponsel", "tanya"), f("wv"), f("id", "seru"), f("wk", "ponsel"), f("id")] },
    kh1atasi: { c: "Petugas dan warga memadamkan api", x: 150, f: [f("sp", "helmm", "rompim", "selang"), f("sp", "helmm", "rompim", "selang"), f("wr", "ember", "helm"), f("wr", "ember"), f("wk", "ember"), f("id", "helmm", "rompim", "clip")] },
    kh1biarkan: { c: "Api meluas, warga mengungsi", f: [f("rn", "masker", "tas"), f("rn", "masker", "tas"), f("rn", "masker"), f("co", "masker"), f("wk", "masker", "kardus"), f("id", "masker", "seru")] },
    kh2atasi: { c: "Api padam, warga lega", f: [f("ju"), f("wv"), f("ju", "kid"), f("wv"), f("id", "masker"), f("wk", "ember"), f("wk")] },
    kh2biarkan: { c: "Asap pekat: warga terbatuk dan memprotes", f: [f("co", "masker"), f("co", "masker"), f("pl", "plak", "masker"), f("pl", "plak", "masker"), f("id", "masker", "tanya"), f("wk", "masker")] },
    kh3: { c: "Bekas hutan dibuka dan ditanami sawit", f: [f("wr", "caping", "cangkul"), f("wr", "caping", "cangkul"), f("wr", "caping", "cangkul"), f("wk", "caping", "bibit"), f("wk", "caping", "bibit"), f("id", "helm", "rompi", "clip")] },
    kh4: { c: "Sawit berbuah, panen dimulai", s: "truk", x: 270, f: [f("wr", "caping", "egrek"), f("wr", "caping", "egrek"), f("wk", "caping", "tandan"), f("wk", "caping", "tandan"), f("id", "helm", "clip"), f("id", "caping", "tandan")] },
  };
  /* id berita -> aktivitas (id "evN" = berita ekonomi dasar, "arc-..." = seri bersambung) */
  const EVSC = {
    ev0: "pasar", ev1: "lesu", ev2: "sawit", ev3: "bbm", ev4: "wisata", ev5: "proyek", ev6: "proyek", ev7: "demo", ev8: "pilkada", ev9: "pasar", ev10: "lesu", ev11: "syukur", ev12: "syukur", ev13: "lesu", ev14: "proyek", ev15: "audit",
    bansos: "bansos", csr: "amal", endorse: "modal", blusukan: "blusukan", monoprotes: "demo", kppu: "audit", pajakkaya: "audit", endus: "wartawan", reshuffle: "wartawan", amnesti: "bebas", pinjol: "pinjol", rupiah: "pasar", libur: "libur", namakota: "bingung", kupon: "lesu", napas: "pajak", jembatan: "proyek",
    "arc-kasus": "wartawan", "arc-tol": "proyek", "arc-gelap": "demo",
  };
  const BASESC = ["tenang", "sibuk", "gerah", "resah", "rusuh"];
  const isWalk = (s) => s.a == "wk" || s.a == "rn";
  const BASEY = 29;
  /* satu orang: kaki di (0,0), tinggi ±18 satuan */
  const orang = (s, i) => {
    const sl = (k) =>
      s.p
        .map((n) => PR[n])
        .filter((x) => x && x[0] == k)
        .map((x) => x[1])
        .join("");
    const c = SHIRT[(i * 3 + 1) % SHIRT.length],
      sk = SKIN[(i * 5 + 2) % SKIN.length],
      sp = s.a == "rn" ? 0.28 : 0.5 + (i % 3) * 0.06;
    return (
      `<g class="fk ${s.a}" style="--sp:${sp}s;--dl:-${((i * 0.37) % 2).toFixed(2)}s;--pkc:${PKC[i % 4]};--ac:${c}">` +
      `<path class="ar a am" d="M-2.6 -12L-3.6 -7"/>` +
      `<path class="lg a" d="M-1.2 -6.6L-1.5 0"/><path class="lg b" d="M1.2 -6.6L1.5 0"/>` +
      `<g class="bd"><path class="o1" d="M-3 -6.8L-2.7 -12.6Q0 -13.5 2.7 -12.6L3 -6.8Z" style="fill:${c}"/>${sl("b")}` +
      `<circle class="o1" cx="0" cy="-15.6" r="2.7" style="fill:${sk}"/>${sl("h")}${sl("x")}</g>` +
      `<g class="ar b"><path class="am" d="M2.6 -12L3.6 -7"/>${sl("a")}</g>${sl("g")}</g>`
    );
  };
  const pasangOrang = (s, i, x, y, flip) => {
    const k = (s.p.includes("kid") ? 0.72 : 1) * 1.3; /* 1,3 = pembesaran agar warga terbaca di papan */
    return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${flip ? -k : k} ${k})">${orang(s, i)}</g>`;
  };
  /* diam = mode hemat (gerak dikurangi / FX low): semua orang berdiri di tempat, tanpa animasi */
  const folkSvg = (sc, diam) => {
    const list = sc.f.slice(0, diam ? 5 : 8),
      st = [],
      wk = [];
    list.forEach((s, i) => (diam || !isWalk(s) ? st : wk).push({ s: diam && isWalk(s) ? { ...s, a: "id" } : s, i }));
    let g = "";
    if (sc.s) g += `<g transform="translate(${sc.x} ${BASEY}) scale(1.25)" class="spc">${SP[sc.s]}</g>`;
    st.forEach((o, j) => {
      let x;
      if (sc.q) x = sc.x - 20 - j * 16;
      else {
        const cx = sc.s ? sc.x - 65 : sc.x || 200;
        x = cx + (j - (st.length - 1) / 2) * 19;
      }
      x = Math.max(14, Math.min(386, x));
      g += pasangOrang(o.s, o.i, x, BASEY - (j % 2) * 2, !sc.q && j % 2 == 1);
    });
    wk.forEach((o, w) => {
      const d = 26 + w * 5,
        l = w % 2 == 1;
      g += `<g class="mv ${l ? "l" : "r"}" style="--d:${d}s;animation-delay:-${((d * (w + 0.5)) / wk.length).toFixed(1)}s">${pasangOrang(o.s, o.i, 0, BASEY - (w % 2) * 2, l)}</g>`;
    });
    return `<svg viewBox="0 0 400 30" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${g}</svg>`;
  };

  const SKY =
    `<div class="sk" id="sk" aria-hidden="true">` +
    [0, 1, 2, 3, 4].map((i) => `<i class="sk-bg p${i}"></i>`).join("") +
    `<div class="sk-sun">${SUN}</div>` +
    `<div class="sk-bird">${BIRD}</div><div class="sk-bird b2">${BIRD}</div>` +
    `<div class="sk-cl c1">${CLOUD}</div><div class="sk-cl c2">${CLOUD}</div><div class="sk-cl c3">${CLOUD}</div>` +
    `<div class="sk-plane">${PLANE}</div><div class="sk-ball">${BALLOON}</div>${FW}<div class="sk-storm"></div><div class="sk-haze"></div><div class="sk-glow"></div><div class="sk-forest" id="sk-forest">${FOREST}</div><div class="sk-heli">${HELI}</div>` +
    `<div class="sk-ground"></div><div class="sk-city">${CITY}</div><div class="sk-train">${KERETA}</div><div class="sk-road">${ROAD}</div><div class="sk-town" id="sk-town"></div><div class="sk-asap"><i></i><i></i><i></i></div><div class="sk-folk" id="sk-folk"></div>` +
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
  let last = { ph: -1, c: -1, ap: "", tk: "", lite: null, sc: null };

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
      const k = khData();
      if (k && k.s >= 0) {
        const c = (v) => k.pl.filter((x) => x === v).length,
          h = [];
        if (c(1)) h.push(c(1) + " petak hutan terbakar");
        if (c(2)) h.push(c(2) + " petak hangus");
        if (c(3) + c(4)) h.push(c(3) + c(4) + " petak jadi lahan sawit");
        if (h.length) it.push(["Hutan", h.join(" · ")]);
      }
    } catch (e) {}
    if (last.sc && last.sc.c) it.push(["Warga", last.sc.c]);
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

  /* ---------- Fase 2b/2c: hutan, asap, dan warga ---------- */
  const khData = () => {
    try {
      return NW.kh && Array.isArray(NW.kh.pl) ? NW.kh : null;
    } catch (e) {
      return null;
    }
  };
  /* tingkat kabut asap 0..3 menurut tahap seri & pilihan pemerintah */
  const asapLv = (k) => {
    if (!k || k.s < 0) return 0;
    const b = k.ch == "biarkan";
    if (k.s == 0) return 1;
    if (k.s == 1) return b ? 3 : 2;
    if (k.s == 2) return b ? 3 : 1;
    return k.s == 3 && b ? 1 : 0;
  };
  const KHNOTE = [
    ["Titik api terdeteksi di hutan", 1],
    ["Kebakaran meluas: pemerintah memutuskan", 1],
    ["", 0],
    ["Bekas hutan dibuka jadi lahan sawit", 0],
    ["Kebun sawit mulai berproduksi", 0],
  ];
  function paintForest() {
    const k = khData(),
      key = k ? k.pl.join("") + "|" + k.s + "|" + k.ch : "-";
    if (key === last.kh) return;
    const baru = last.kh !== undefined && last.kh !== "" && last.khS !== undefined;
    last.kh = key;
    const pts = ctr.querySelectorAll(".sk-forest .pt");
    pts.forEach((g, i) => g.setAttribute("class", "pt s" + (k && k.pl[i] > 0 ? k.pl[i] : 0)));
    ctr.dataset.asap = String(asapLv(k));
    ctr.dataset.heli = k && k.ch == "atasi" && k.s == 1 ? "1" : "0";
    ctr.dataset.fire = k && k.pl.includes(1) ? "1" : "0";
    const s = k ? k.s : -1;
    if (baru && s !== last.khS && s >= 0) {
      let t = KHNOTE[s] ? KHNOTE[s][0] : "",
        bad = KHNOTE[s] ? !!KHNOTE[s][1] : false;
      if (s == 2) {
        t = k.ch == "atasi" ? "Api padam, sebagian hutan selamat" : "Kabut asap pekat selimuti negeri";
        bad = k.ch != "atasi";
      }
      if (t) pjNote(t, bad);
    }
    last.khS = s;
  }
  /* aktivitas warga yang sedang tampil: tahap karhutla yang masih panas > berita terbaru > suasana nasional */
  function pickScene(ph) {
    let ev = null,
      key = null,
      r = 0;
    try {
      ev = NW.ev;
      r = rnd;
    } catch (e) {}
    const k = khData(),
      kkey = k && k.s >= 0 ? "kh" + k.s + (k.s == 1 || k.s == 2 ? k.ch : "") : null;
    if (kkey && SCN[kkey]) {
      if (ev && ev.i == "arc-karhutla" && r - (k.r || 0) <= 2) key = kkey;
      else if (k.s >= 1 && k.s <= 2 && r - (k.r || 0) <= 3) key = kkey;
    }
    if (!key && ev && r - ev.r <= 2 && EVSC[ev.i]) key = EVSC[ev.i];
    if (!key) key = BASESC[ph] || "tenang";
    return { k: key, s: SCN[key] || SCN.tenang };
  }
  function paintFolk(ph) {
    const el = q("#sk-folk");
    if (!el) return;
    const sc = pickScene(ph),
      diam = lite() || RM.matches,
      key = sc.k + "|" + (diam ? 1 : 0);
    last.sc = sc.s;
    if (el.dataset.k === key) return;
    el.dataset.k = key;
    el.classList.remove("in");
    el.innerHTML = folkSvg(sc.s, diam);
    void el.offsetWidth;
    el.classList.add("in");
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
    paintForest();
    paintFolk(ph);

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
