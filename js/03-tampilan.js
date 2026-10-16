const PIP = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const cleanName = (s) =>
  String(s || "")
    .replace(/[<>&"'`\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12);
const dice = (a, b) => ($("#dice").innerHTML = [a, b].map((v) => `<div class="die">${[...Array(9)].map((_, k) => `<i class="${PIP[v].includes(k) ? "p" : ""}"></i>`).join("")}</div>`).join(""));
/* tulis innerHTML hanya bila berubah: menghindari layout ulang dan pemindaian emoji yang sia-sia */
const setH = (el, h) => {
  if (el._h === h) return;
  el._h = h;
  el.innerHTML = h;
};
const say = (t) => {
  log.unshift(t);
  if (typeof RPLB !== "undefined" && RPLB.length < 200) RPLB.push(t);
  log.length = Math.min(log.length, 40);
  const L = $("#log"),
    d = document.createElement("div");
  d.innerHTML = t;
  L.insertBefore(d, L.firstChild);
  while (L.childElementCount > 40) L.lastElementChild.remove();
  $("#now").textContent = t;
};
const pin = (c, n) =>
  `<svg class="pn" viewBox="0 0 24 34"><path d="M12 33C12 33 2 20 2 12a10 10 0 0 1 20 0c0 8-10 21-10 21z" fill="${c}" stroke="#111" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="#fff" stroke="#111" stroke-width="1"/><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#111" font-family="Oswald,sans-serif">${n}</text>`.replace(
    /<text[^>]*>[^<]*<\/text>/,
    typeof n == "number" ? "$&" : '<use href="#ic-shield-03" x="7" y="7" width="10" height="10" fill="#111"/>',
  ) + "</svg>";
const AX = (k) => (k + 0.2) / 13.2;
const POLS = [{ pos: 27, k: pin("#1a237e", "👮") }];
function FX() {
  P.forEach((p, k) => {
    if (p.pc !== undefined && p.cash !== p.pc) {
      const d = p.cash - p.pc,
        c = document.querySelectorAll("#pl .pc")[k];
      if (c && Math.abs(d) >= 1e4) {
        const r = c.getBoundingClientRect(),
          e = document.createElement("div");
        e.className = "pop " + (d > 0 ? "up" : "dn");
        e.textContent = (d > 0 ? "💰 +" : "💸 −") + fm(Math.abs(d));
        e.style.left = Math.max(4, r.right - 150) + "px";
        e.style.top = Math.max(4, r.top - 14) + "px";
        document.body.appendChild(e);
        setTimeout(() => e.remove(), 2300);
      }
    }
    p.pc = p.cash;
  });
}
const PINEL = new Map(),
  RMO = matchMedia("(prefers-reduced-motion:reduce)");
function PINS() {
  FX();
  const L = P.filter((p) => !p.x)
    .map((p) => ({ o: p, pos: p.pos, cur: p.id == cur }))
    .concat(POLS.map((x) => ({ o: x, pos: x.pos, pol: 1 })));
  const host = $("#pins"),
    sp = typeof SET != "undefined" ? SET.sp : 1,
    ms = Math.max(40, Math.min(240, 150 * sp)),
    live = new Set();
  L.forEach((e) => {
    const p = e.o,
      i = e.pos,
      [r, c] = pos(i),
      same = L.filter((q) => q.pos == i),
      d = (same.indexOf(e) - (same.length - 1) / 2) * 3,
      x = c == 1 ? 0 : c == 12 ? 100 : AX(c) * 100,
      y = r == 1 ? 0 : r == 12 ? 100 : AX(r) * 100;
    const a = i == 0 ? 135 : i < 11 ? 180 : i == 11 ? 225 : i < 22 ? 270 : i == 22 ? 315 : i < 33 ? 360 : i == 33 ? 405 : 450;
    p.rot = p.rot === undefined ? a : p.rot + ((((a - p.rot) % 360) + 540) % 360) - 180;
    let el = PINEL.get(p);
    if (!el) {
      el = document.createElement("div");
      el.innerHTML = p.k;
      host.appendChild(el);
      PINEL.set(p, el);
    }
    live.add(p);
    const gap = el._i === undefined ? 0 : Math.min((i - el._i + NN) % NN, (el._i - i + NN) % NN),
      far = gap > 3;
    el.style.transitionDuration = (far ? 420 : ms) + "ms";
    el.style.transitionTimingFunction = far ? "cubic-bezier(.4,0,.2,1)" : "linear";
    el.className = "pw" + (e.cur ? " cur" : "") + (e.pol ? " pol" : "");
    if (r == 1 || r == 12) {
      el.style.left = `calc(${x}% + ${d} * var(--u))`;
      el.style.top = `${y}%`;
    } else {
      el.style.left = `${x}%`;
      el.style.top = `calc(${y}% + ${d} * var(--u))`;
    }
    el.style.transform = `rotate(${p.rot}deg)`;
    if (gap > 0 && !far && !RMO.matches) {
      const s = el.firstElementChild;
      if (s && s.animate) s.animate([{ transform: "translateY(0)" }, { transform: "translateY(-28%)" }, { transform: "translateY(0)" }], { duration: ms, easing: "ease-out" });
    }
    el._i = i;
  });
  PINEL.forEach((el, p) => {
    if (!live.has(p)) {
      el.remove();
      PINEL.delete(p);
    }
  });
}
const pos = (i) => (i <= 11 ? [12, 12 - i] : i < 22 ? [23 - i, 1] : i <= 33 ? [1, i - 21] : [i - 32, 12]);
const GL = { br: "A", lb: "B", pk: "C", or: "D", rd: "E", yl: "F", gr: "G", db: "H" },
  GK = Object.keys(G),
  gl = (t) => (t.g ? GL[t.g] : t.t == "r" ? "I" : t.t == "u" ? "J" : ""),
  gtag = (i) => {
    const l = gl(T[i]);
    return l ? "[" + l + "] " : "";
  };
T.forEach((t, i) => {
  const e = document.createElement("div"),
    [r, c] = pos(i);
  e.id = "t" + i;
  e.style.gridArea = r + "/" + c;
  e.className = "t " + (i % 11 == 0 ? "cn" : ["bo", "le", "to", "ri"][(i / 11) | 0]) + (["la", "bu", "ap", "mk"].includes(t.t) ? " " + t.t : "");
  e.innerHTML =
    (gl(t) ? `<b class="gl">${gl(t)}</b>` : "") +
    (t.g ? `<div class="bar" style="background:${G[t.g][0]}"></div>` : "") +
    `<div class="in">${t.i ? `<i>${t.i}</i>` : ""}<span>${t.n}</span><em class="ab">${(t.t == "r" ? t.n.split(" ")[1] : t.n.split(" ")[0]).slice(0, 6)}</em>${t.p ? `<small>${sh(t.p)}</small>` : ""}${t.t == "go" ? "<small>Terima Rp2 jt</small>" : t.t == "jl" ? "<small>Hanya lewat</small>" : ""}</div><div class="tk"></div>`;
  $("#board").appendChild(e);
});
const cnt = (p, ty) => T.reduce((a, t, i) => a + (t.t == ty && own[i]?.o == p ? 1 : 0), 0);
const mono = (i, p) => T.every((t, j) => t.g != T[i].g || own[j]?.o == p);
const grp = (i) => (T[i].g ? T.map((t, j) => j).filter((j) => T[j].g == T[i].g) : [i]);
const rent = (i, sum) => Math.round((rent0(i, sum) * ECO.m * (ECO.g[T[i].g] || 1) * (T[i].t == "r" ? ECO.r : 1) * crM()) / 1e3) * 1e3;
function rent0(i, sum) {
  const t = T[i],
    o = own[i];
  if (t.t == "s") return o.h ? t.r[o.h] : t.r[0] * (mono(i, o.o) ? 2 : 1);
  const n = cnt(o.o, t.t);
  return t.t == "r" ? 25 * K * 2 ** (n - 1) : sum * K * (n > 1 ? 10 : 4);
}
function render() {
  try {
    const em = $("#t" + T.findIndex((t) => t.t == "mk")),
      buka = bdBuka();
    em.classList.toggle("tutup", !buka);
    em.title = buka ? "" : "Kios Gelap tutup (buka setelah peran dibagikan, putaran 3)";
  } catch (e) {} /* bdBuka belum siap saat render pertama */
  T.forEach((t, i) => {
    const e = $("#t" + i),
      o = own[i];
    e.style.boxShadow = o ? `inset 0 0 0 .45em ${o.o == NEG ? "#555" : P[o.o].c}` : "";
    e.toggleAttribute("data-st", !!o && o.o == NEG);
    e.style.opacity = o?.m ? 0.5 : 1;
    if (t.g) setH(e.querySelector(".bar"), (o?.h > 4 ? '<b class="h H" title="Hotel"></b>' : '<b class="h" title="Rumah"></b>'.repeat(o?.h || 0)) + '<b class="h M" title="MBG"></b>'.repeat(o?.mb || 0) + (o?.kd ? '<b class="h KD" title="Kopdes Merah Putih">KD</b>' : ""));
    setH(
      e.querySelector(".tk"),
      P.filter((p) => !p.x && p.pos == i)
        .map((p) => `<span class="${p.id == cur ? "cur" : ""}">${p.k}</span>`)
        .join(""),
    );
  });
  PINS();
  {
    const w = P[cur];
    0 && `${w.k} Giliran ${w.n} (${R(w).n})${w.b ? " 🤖" : ""} · ${w.jail >= 0 ? "sedang di penjara" : "kas " + fm(w.cash)}`;
    0 &&
      `📰 <b>${ECO.n}</b>${ECO.d ? ` (${ECO.d} putaran lagi)` : ""}<br>🏛️ Dana APBN: ${fm(POOL)}${FZ.L >= 0.05 ? " · " + fzLabel(FZ.L)[1] + " " + fzLabel(FZ.L)[0] + " (pajak ×" + fx(fzTax()) + ")" : ""} · Putaran ${rnd}${SET.rl ? "/" + SET.rl : ""}<br>🏗️ Aset negara: ${nneg()} properti (sewanya masuk APBN)<br>${LV.i} Level ${LV.n}${DIR < 0 ? " · 🔁 arah terbalik" : ""} · ${crS() ? "📉 Krisis tahap " + crS() + ": sewa ×" + fx(crM()) + ", gaji ×" + fx(crG()) : SET.cr ? "krisis mulai putaran " + LV.st : "krisis dimatikan"}<br>👮 OTT (${POLS.length} pion) di ${POLS.map((x) => T[x.pos].n).join(", ")}<br>${PRES.id >= 0 ? `👑 Presiden: <b>${P[PRES.id].n}</b> (periode ${PRES.t}/2)` : "👑 Belum ada presiden"} · 🗳️ pemilu setelah putaran ${Math.ceil(rnd / 5) * 5}`;
  }
  {
    const kb = $("#kbj");
    kb.style.display = PRES.id >= 0 ? "" : "none";
    kb.disabled = !(isP(P[cur]) && !PRES.used && !P[cur].b);
  }
  setH($("#pl"), P.map(
    (p, k) =>
      `<div class="pc${k == cur ? " on" : ""}${p.x ? " out" : ""}" style="border-color:${p.c}"><div><span>${p.k}</span> <b>${p.n}</b>${p.id == PRES.id ? " 👑" : ""}${p.cards ? " 🔑×" + p.cards : ""}${p.jail >= 0 ? " ⛓️" : ""}</div><div class="rl">${R(p).i} ${R(p).n}</div>${nmb(p) || p.mt ? `<div class="rl mbt">🍱 MBG ×${nmb(p)} · insentif ${fm(nmb(p) * MBG_PAY)} (dari APBN) tiap lewat MULAI${p.mt ? " · ⚠️ tunggakan " + fm(p.mt) : ""}</div>` : ""}${p.kor > 0 ? `<div class="rl">🕵️ Jejak korupsi ${fm(p.kor)} · diincar OTT</div>` : ""}${p.imun || p.gk ? `<div class="rl">${p.imun ? "⚖️ kebal hukum 1× " : ""}${p.gk ? "🩺 berobat gratis 1×" : ""}</div>` : ""}${cardChip(p)}${kdChip(p)}${p.sb ? `<div class="rl">🏭 Saham BUMN ×${p.sb} · dividen ${fm(p.sb * DIV())} tiap lewat MULAI</div>` : ""}<div class="cash">${fm(p.cash)}</div>${p.loans.length ? `<div class="dbt">🏦 Utang ${fm(p.loans.reduce((a, l) => a + l.pr, 0))} · jatuh tempo ${Math.min(...p.loans.map((l) => l.n))} giliran</div>` : ""}<div class="ch">${Object.keys(
        own,
      )
        .filter((i) => own[i].o == k)
        .map((i) => `<s data-i="${i}" style="background:${T[i].g ? G[T[i].g][0] : "#333"};opacity:${own[i].m ? 0.35 : 1};color:${T[i].g ? "#111" : "#fff"}">${gl(T[i])}</s>`)
        .join("")}</div></div>`,
  ).join(""));
}
const rw = (a, b) => `<div class="rw"><span>${a}</span><b>${b}</b></div>`,
  sec = (h, b) => `<div class="sec"><h4>${h}</h4>${b}</div>`;
const TY = { s: "Properti Kota", r: "Stasiun Kereta", u: "Utilitas", x: "Pajak", c: "Kartu", k: "Kartu", gm: "Tambang", rp: "Karier", la: "Lelang", mk: "Kios Gelap", bu: "BUMN", ap: "Transportasi" },
  NT = {
    mk: "Lapak gelap milik Bandar (buka setelah peran dibagikan): Lotre Receh selalu ada, ditambah kartu abu-abu, barang terlarang, barang baru, dan kartu khusus perannya. Uang masuk Kas Bandar. Bandar menyesuaikan peluang menurut kebiasaan belimu.",
    la: "Satu properti yang belum terjual dipilih acak, lalu langsung dilelang ke semua pemain.",
    bu: "Beli saham BUMN (maks 3 per pemain). Pemegang saham menerima dividen tiap lewat MULAI; dividen turun saat krisis.",
    ap: "Terbang gratis ke stasiun kereta mana pun (sewa berlaku bila milik pemain lain), atau tetap di sini.",
    go: "Lewat atau mendarat di sini: terima gaji.",
    jl: "Hanya mampir, atau menunggu bila ditahan.",
    fp: "Pilih korupsi atau tidak. Korupsi: gelapkan sebagian kas APBN (total dadu × " + BANSOS_PCT + "%, maks " + fm(PCT_MAKS) + "), tapi jadi buruan pion OTT. Tidak korupsi: tidak terjadi apa-apa.",
    gj: "Langsung masuk penjara, tanpa gaji MULAI.",
    c: "Ambil satu kartu Kesempatan.",
    k: "Ambil satu kartu Dana Umum.",
    rp: "Dapatkan peran acak (politisi, PNS, dll.) dengan kemampuan khusus. Peran lama langsung diganti.",
    gm: "Gali emas: tradisional (gratis, hasil kecil) atau alat berat (Rp1.000.000, hasil besar, bisa longsor). Hasil dikali harga emas.",
  };
const EFF = (p, c) => {
  const a = c[1],
    v = c[2],
    w = c[3];
  return a == "z"
    ? "Negara membeli paksa 1 propertimu (acak): ganti rugi 1,25× harga + nilai bangunan. Properti jadi aset negara, sewanya masuk APBN"
    : a == "y"
      ? "Negara menyita 1 propertimu yang paling bernilai tanpa ganti rugi. Sewanya masuk APBN"
      : a == "c"
        ? "Langsung masuk penjara, lalu negara menyita 1 propertimu yang paling bernilai (hasil korupsi)"
        : a == "m"
          ? v > 0
            ? "Terima " + fm(kartuNom(p, c).amt) + " dari bank"
            : kartuNom(p, c).free
              ? "Gratis, berobat ditanggung kartu Konsultasi"
              : "Bayar " + fm(kartuNom(p, c).amt) + " (masuk Dana Bansos)"
          : a == "e"
            ? "Terima " + fm(v * K) + " dari tiap pemain"
            : a == "g"
              ? "Pindah ke " + T[v].n + (v < p.pos ? " (lewat MULAI, terima gaji)" : "")
              : a == "b"
                ? "Mundur 3 petak"
                : a == "j"
                  ? "Langsung masuk penjara, tanpa gaji MULAI"
                  : a == "f"
                    ? "Simpan kartu ini untuk keluar penjara gratis"
                    : a == "h"
                      ? "Bayar " + fm(v * K) + " per rumah dan " + fm(w * K) + " per hotel"
                      : a == "d"
                        ? "Sisa pokok semua pinjamanmu dipotong " + v + "% (tanpa utang: terima Rp300.000)"
                        : a == "i"
                          ? "Cicilan bank berikutnya bebas bunga (butuh pinjaman aktif)"
                          : a == "k"
                            ? "Terima pinjaman KUR Rp3.000.000, bunga 1% per giliran, tenor 10 giliran"
                            : a == "p"
                              ? "Denda " + v + "% dari total sisa utangmu (tanpa utang: aman)"
                              : "Terima 5% dari kasmu (maks Rp1.000.000)";
};
function info(i) {
  const t = T[i],
    o = own[i],
    g = t.g,
    hc = g ? G[g][1] * K : 0,
    mu = ECO.m * (ECO.g[g] || 1) * (t.t == "r" ? ECO.r : 1);
  let h = `<h3 style="${g ? `background:${G[g][0]};color:${g == "lb" || g == "yl" ? "#111" : "#fff"}` : ""}">${t.i || ""} ${t.n}</h3><div class="sub">${TY[t.t] || "Petak Khusus"}${gl(t) ? " · Grup " + gl(t) : ""}</div>`;
  if (t.p && t.t != "x" && t.t != "bu") h += sec("Harga", rw("Harga beli", fm(t.p)) + rw("Nilai gadai", fm(t.p / 2)));
  if ("sru".includes(t.t)) h += gInfo(i);
  if (t.t == "s")
    h +=
      sec("Sewa", rw("Tanah kosong", fm(t.r[0])) + rw("Set lengkap (\u00d72)", fm(t.r[0] * 2)) + [1, 2, 3, 4].map((n) => rw("\ud83c\udfe0 " + n + " rumah", fm(t.r[n]))).join("") + rw("\ud83c\udfe8 Hotel", fm(t.r[5]))) +
      sec("Pembangunan", rw("Biaya per rumah / hotel", fm(hc)) + rw("Syarat", "Tanah milik sendiri")) +
      sec("🍱 MBG (Makan Bergizi Gratis)", rw("Harga", fm(MBG_COST)) + rw("insentif (dari APBN)", "+" + fm(MBG_PAY) + " tiap lewat MULAI, bila kas APBN cukup") + rw("Maks per properti", MBG_MAX));
  else if (t.t == "r") h += sec("Sewa", rw("Punya 1 stasiun", "Rp250.000") + rw("Punya 2", "Rp500.000"));
  else if (t.t == "u") h += sec("Sewa", rw("Punya 1", "4\u00d7 dadu \u00d7 Rp10.000") + rw("Punya 2", "10\u00d7 dadu \u00d7 Rp10.000"));
  else if (t.t == "x") h += sec("Tagihan", rw("Pajak", fm(t.p)));
  else h += sec("Keterangan", '<p class="ct">' + NT[t.t] + "</p>");
  if ("sru".includes(t.t)) {
    if (mu != 1) h += sec("Berita ekonomi", rw(ECO.n, "sewa \u00d7" + (+mu.toFixed(2)).toString().replace(".", ",")));
    if (crS()) h += sec("Krisis ekonomi", rw("Tahap " + crS(), "sewa ×" + fx(crM())));
    h += sec(
      "Status",
      o
        ? rw("Pemilik", OW(o)) +
            (t.t == "s" ? rw("Bangunan", o.h > 4 ? "\ud83c\udfe8 Hotel" : o.h ? "\ud83c\udfe0 \u00d7" + o.h : "Kosong") + (o.mb ? rw("MBG", "Aktif 🍱") : "") : "") +
            (o.m ? rw("Kondisi", "Digadai") : "") +
            (o.o == NEG ? rw("Hasil sewa", "Masuk Dana APBN") : "")
        : rw("Pemilik", "Belum dimiliki"),
    );
  }
  return h;
}
function infoLegacy(i) {
  const t = T[i],
    o = own[i],
    g = t.g;
  let h = `<h3 style="${g ? `background:${G[g][0]};color:${g == "lb" || g == "yl" ? "#111" : "#fff"}` : ""}">${t.i || ""} ${t.n}</h3>`;
  if (t.t == "s")
    h += `<p>Harga ${fm(t.p)}</p><p>Sewa ${fm(t.r[0])} (2× jika satu set lengkap)<br>🏠1 ${fm(t.r[1])} · 🏠2 ${fm(t.r[2])}<br>🏠3 ${fm(t.r[3])} · 🏠4 ${fm(t.r[4])}<br>🏨 Hotel ${fm(t.r[5])}<br>Biaya rumah ${fm(G[g][1] * K)} per unit</p>`;
  else if (t.t == "r") h += `<p>Harga ${fm(t.p)}</p><p>Sewa 1 stasiun Rp250.000<br>2: Rp500.000 · 3: Rp1.000.000 · 4: Rp2.000.000</p>`;
  else if (t.t == "u") h += `<p>Harga ${fm(t.p)}</p><p>Sewa 4× angka dadu × Rp10.000<br>10× jika memiliki keduanya</p>`;
  else if (t.t == "x") h += `<p>Bayar ${fm(t.p)}</p>`;
  if (o) h += `<p><b>Pemilik: ${P[o.o].n}</b>${o.h ? " · 🏠" + o.h : ""}${o.m ? " · digadai" : ""}</p>`;
  return h;
}
function ask(html, btns, w) {
  w = w || P[cur];
  if (w?.b)
    return (async () => {
      mod.onclick = null;
      await sleep(500);
      const ok = btns.filter((b) => !b[2]);
      return pick(w, ok)[1];
    })();
  return new Promise((res) => {
    mod.onclick = null;
    mod.innerHTML = html + '<div class="mb">' + btns.map((b, i) => `<button data-i="${i}" ${b[2] ? "disabled" : ""}>${b[0]}</button>`).join("") + "</div>";
    ov.hidden = false;
    mod.querySelectorAll(".mb button").forEach(
      (x) =>
        (x.onclick = () => {
          ov.hidden = true;
          res(btns[x.dataset.i][1]);
        }),
    );
  });
}
