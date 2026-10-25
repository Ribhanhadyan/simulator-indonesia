/* ===== [F2] KIOS GELAP: Bandar (NPC) yang mengelola Market =====
   Petak bertipe "mk" tetap (kompatibel simpanan lama); yang berubah nama tampilan, isi rak, harga, dan arah uang.
   Bandar membaca kebiasaan beli tiap pemain (tier tamu -> langganan -> pecandu) lalu menggeser peluang lotre:
   umpan -> jerat -> panen. Kas Bandar menarik razia lewat arc berita NW.arc. Uang fiktif, jadi sah sebagai satire.
   Catatan penyesuaian dari dokumen rancangan:
   - Modal awal Bandar dibuat 20% dari (jumlah pemain x uang awal), bukan 150%, dan modal reboot 10%. Dengan 150% kas tidak
     pernah menembus ambang sorotan 150% (total uang pemain kalah besar, kunjungan ke petak mk jarang), jadi razia tak akan
     terjadi. Kasbon Bandar (opsional di dokumen) tidak dibuat.
   - Tiap tick Bandar dihitung per putaran; "beruntun" dihitung per KUNJUNGAN ke Kios (petak mk jarang didarati). */

/* tabel peluang [kalah, x1,5, x3, x8] dalam persen; balik modal = sum(peluang x pengali) */
const BD_TABEL = {
  tamu: [50, 32, 13, 5] /* balik 127% */,
  langganan: [65, 22, 10, 3] /* balik 87%: tabel inilah yang DIPAJANG di kios */,
  pecandu: [78, 14, 6, 2] /* balik 55% */,
  tiarap: [72, 18, 8, 2] /* balik 67% */,
};
const BD_RAZIA_HARI = 8; /* jeda reboot setelah tumbang (putaran) */

const bdModal = (n, kecil) => Math.round(((kecil ? 0.1 : 0.2) * n * (SET.cash || 15e6)) / 1e5) * 1e5;
function bandarBaru(kecil) {
  const m = bdModal(Math.max(1, P.length), kecil);
  return {
    kas: m,
    modalAwal: m,
    tiarap: false,
    jam: 0 /* umur Bandar sejak buka (putaran) */,
    upetiTerakhir: 0,
    rebootSetelah: null,
    riwayat: [],
    masuk: 0 /* pemasukan putaran ini */,
    keluar: 0 /* hadiah dibayar putaran ini */,
    markup: 1 /* kenaikan harga akibat skandal */,
    mkSampai: 0,
    cd: 0 /* jeda sebelum razia berikutnya */,
    gen: 1,
    dibuka: false,
    kp: false /* sedang kepepet */,
    tSampai: 0 /* batas aman tiarap */,
  };
}
let bandar = bandarBaru();
/* statistik per pemain (semua dengan fallback agar simpanan lama tetap terbaca) */
function bdStat(p) {
  p.lot = p.lot || 0;
  p.kartu = p.kartu || 0;
  p.beruntun = p.beruntun || 0;
  p.beliLagiSetelahKalah = p.beliLagiSetelahKalah || 0;
  p.tier = p.tier || "tamu";
  p.cuciUangDipakai = !!p.cuciUangDipakai;
  p.sepi = p.sepi || 0;
  p.kupon = p.kupon || 0;
  return p;
}
function bandarReset() {
  bandar = bandarBaru();
  P.forEach(bdStat);
}
function bandarLoad(sv) {
  bandar = Object.assign(bandarBaru(), sv && typeof sv == "object" ? sv : {});
  if (!Array.isArray(bandar.riwayat)) bandar.riwayat = [];
  if (!(bandar.modalAwal > 0)) bandar.modalAwal = bandarBaru().modalAwal;
  P.forEach(bdStat);
}
const bdBuka = () => rnd >= 3 && bandar.rebootSetelah == null;
const bdKepepet = () => bdBuka() && bandar.kas < 0.25 * bandar.modalAwal;
const bdN = (p) => (p.lot || 0) + (p.kartu || 0);
function bdTier(p) {
  const n = bdN(p);
  if (n >= 6 && ((p.beruntun || 0) >= 2 || (p.beliLagiSetelahKalah || 0) >= 3)) return "pecandu";
  return n >= 3 ? "langganan" : "tamu";
}
/* tabel peluang yang BERLAKU untuk pemain (tersembunyi, kecuali tabel Langganan yang dipajang) */
function bdTabel(p) {
  if (bdKepepet()) return BD_TABEL.pecandu;
  if (bandar.tiarap) return BD_TABEL.tiarap;
  return BD_TABEL[bdTier(p || {})] || BD_TABEL.tamu;
}
const bdFase = () => nPh(nChaos());
/* pengali harga: fase kekacauan, razia (+20%), kepepet (+25%), efek skandal */
function bdMul() {
  return (1 + 0.05 * bdFase()) * (bdKepepet() ? 1.25 : 1) * (bandar.tiarap ? 1.2 : 1) * (rnd <= bandar.mkSampai ? bandar.markup : 1);
}
const bd1e4 = (x) => Math.max(1e4, Math.round(x / 1e4) * 1e4);
/* harga akhir + promo yang dipakai. Saat razia semua promo hilang. */
function bdHarga(p, k) {
  const c = CARD[k],
    dasar = c.hd ? c.hd(p) : c.p,
    tetap = bd1e4(dasar * bdMul());
  let f = 1,
    lb = "";
  if (!bandar.tiarap) {
    if (bandar.jam < 2 && 0.85 < f) (f = 0.85), (lb = "promo pembukaan −15%");
    if (!c.lotre && c.rak != 0 && bdTier(p) == "tamu" && (p.kartu || 0) >= 1 && (p.kartu || 0) <= 2 && 0.6 < f) (f = 0.6), (lb = "paket −40%");
    if (p.kupon && 1 - p.kupon < f) (f = 1 - p.kupon), (lb = "kupon −" + Math.round(p.kupon * 100) + "%");
  }
  /* bonus berhenti tepat di petak Kios Gelap (aktif selama kunjungan itu, juga saat razia) */
  const mb = p.mkBonus;
  if (mb) {
    if (mb.d && 1 - mb.d < f) (f = 1 - mb.d), (lb = "diskon menginjak petak −" + Math.round(mb.d * 100) + "%");
    if (mb.sp === k && 0.5 < f) (f = 0.5), (lb = "⭐ barang spesial −50%");
  }
  return { h: f < 1 ? bd1e4(tetap * f) : tetap, tetap, lb, kupon: lb.startsWith("kupon") };
}
const bdTerima = (a) => {
  bandar.kas += a;
  bandar.masuk += a;
};
function bdBayar(a) {
  const g = Math.max(0, Math.min(a, bandar.kas));
  bandar.kas -= g;
  bandar.keluar += g;
  return g;
}
/* catat satu pembelian (dipanggil dari Kios) */
function bdCatat(p, lotre, zonk) {
  bdStat(p);
  if (lotre) {
    if (p.lKalah) p.beliLagiSetelahKalah++;
    p.lKalah = !!zonk;
    p.lot++;
  } else p.kartu++;
  p.sepi = 0;
  p.tier = bdTier(p);
}
/* akhir kunjungan: hitung beruntun */
function bdKunjungan(p, beli) {
  bdStat(p);
  p.beruntun = beli ? p.beruntun + 1 : 0;
  p.tier = bdTier(p);
}

/* ---------- Informan OTT & Bocoran Berita ---------- */
function bdInformanTeks() {
  const ps = POLS.map((x, i) => "Pion OTT " + (i + 1) + " di " + T[x.pos].n).join("; "),
    kj = P.filter((x) => !x.x && (x.kor || 0) > 0).map((x) => x.n + " (" + fm(x.kor) + ")");
  return ps + ". Berjejak korupsi: " + (kj.length ? kj.join(", ") : "tidak ada") + ".";
}
/* pratinjau berita putaran depan. Berita utama yang diintip dikunci di NW.pre supaya berita benar-benar terbit. */
function bdBocoranTeks() {
  try {
    const ph = bdFase();
    if (NW.arc) {
      const d = NARC[NW.arc.id],
        s = d.st[NW.arc.s];
      if (rnd + 1 < NW.arc.nx) return "Seri «" + d.t + "» sedang jeda; belum ada berita putaran depan.";
      const tx = typeof s.tx == "function" ? s.tx({ p: P[NW.arc.p] || null, a: 0, jl: "", tw: false }) : s.tx;
      return "Seri «" + d.t + "» bagian " + (NW.arc.s + 1) + ": " + nPl(tx);
    }
    if (NW.cd - 1 > 0) return "Tidak ada berita berdampak putaran depan.";
    const m = nMain(ph);
    if (!m) return "Tidak ada berita berdampak putaran depan.";
    NW.pre = m.id;
    const tx = typeof m.tx == "function" ? m.tx(m.cx) : m.tx,
      fx = m.ev != null ? EV[m.ev].n : typeof m.fx == "function" ? m.fx(m.cx) : m.fx || "";
    return nPl(tx) + (fx ? " Dampak: " + nPl(fx) : "") + " (seri baru bisa menyela)";
  } catch (e) {
    return "Bocoran kabur, tidak ada kabar jelas.";
  }
}
/* dipakai news(): berita utama yang sudah diintip */
function bdBocor() {
  if (!NW.pre) return null;
  const x = NMN.find((i) => i.id === NW.pre);
  NW.pre = null;
  if (!x) return null;
  const cx = x.c ? x.c() : {};
  return cx ? { ...x, cx, w: 1 } : null;
}

/* ---------- Arc berita razia (dipicu tick Bandar saat kas > 150% modal) ---------- */
const bdPres = () => (PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x ? P[PRES.id] : null);
NARC.razia = {
  t: "Razia Kios Gelap",
  lo: 9,
  hi: -1 /* tidak pernah terpilih acak; hanya dipicu bandarTick */,
  st: [
    {
      b: 2,
      tx: () => "Media menyorot lapak lotre gelap <b>Kios Gelap</b> yang makin gemuk. Aparat mulai mengumpulkan laporan.",
      fx: () => "Bandar mulai waspada dan menaikkan setoran ke oknum",
      run: async () => {
        bandar.upetiTerakhir = Math.round((bandar.kas * 0.04) / 1e3) * 1e3;
        const g = bdBayar(bandar.upetiTerakhir);
        say("🕶️ Bandar menyetor " + fm(g) + " ke oknum agar laporan melambat");
      },
    },
    {
      b: 3,
      tx: () => "Razia digelar di lokasi <b>Kios Gelap</b>. Bandar tiarap sementara.",
      fx: () => "Tiarap: harga +20%, promo hilang, maks 1 kartu per pemain per putaran, peluang lotre diseragamkan",
      run: async () => {
        bandar.tiarap = true;
        bandar.tSampai = rnd + 6;
        say("🚨 Razia! Kios Gelap tiarap: harga +20%, tanpa promo, maks 1 kartu/pemain/putaran");
      },
    },
    {
      b: 4,
      tx: () => "Bandar dan aparat berhadapan. Kas <b>Kios Gelap</b> jadi taruhan.",
      fx: () => (bdPres() ? "Presiden menentukan sikap: terima upeti atau tindak Bandar" : "Tanpa Presiden, hasil ditentukan perimbangan kekuatan"),
      run: async () => bdKonfrontasi(),
    },
  ],
};
async function bdKonfrontasi() {
  const pr = bdPres(),
    up = Math.round((bandar.kas * 0.12) / 1e5) * 1e5;
  let tindak = null;
  if (pr && !pr.b) {
    const a = await ask(
      `<h3>🕶️ Keputusan Presiden</h3><div class="sub">${pr.n}</div>` +
        sec("Situasi", '<p class="ct">Bandar menawarkan upeti ' + fm(up) + " supaya razia dihentikan. Menindak berarti kas Bandar disita ke APBN, tapi bisa memicu perlawanan oknum. Upeti masuk ke kantongmu sebagai jejak korupsi dan diincar OTT.</p>"),
      [
        ["Terima upeti " + fm(up), "u"],
        ["Tindak Bandar", "t"],
      ],
      pr,
    );
    tindak = a == "t";
  } else if (pr) tindak = Math.random() < ((pr.kor || 0) > 0 ? 0.25 : 0.55);
  const r = Math.random();
  let out;
  if (tindak === true) out = r < 0.85 ? "a" : "c";
  else if (tindak === false) out = r < 0.85 ? "b" : "c";
  else out = r < 0.4 ? "a" : r < 0.75 ? "b" : "c";
  const cm = (t) => say("🕶️ " + t);
  let isi;
  if (out == "a") {
    /* negara menang: kas disita ke APBN, Bandar tumbang lalu reboot */
    const s = Math.round((bandar.kas * 0.85) / 1e3) * 1e3,
      pel = P.filter((x) => !x.x && x.pelapor);
    POOL += s;
    bandar.kas = 0;
    bandar.rebootSetelah = rnd + BD_RAZIA_HARI;
    bandar.upetiTerakhir = 0;
    pel.forEach((x) => {
      const g = Math.min(POOL, 1e6);
      POOL -= g;
      x.cash += g;
    });
    isi = "🏛️ <b>Negara menang.</b> Kas Bandar " + fm(s) + " disita ke Dana APBN. Kios Gelap tutup, kemungkinan buka lagi dengan modal kecil sekitar " + BD_RAZIA_HARI + " putaran." + (pel.length ? " Pelapor (" + pel.map((x) => x.n).join(", ") + ") menerima imbalan Rp1.000.000." : "");
  } else if (out == "b") {
    /* Bandar menang: upeti cair, harga naik, skandal */
    const g = bdBayar(up);
    bandar.markup = 1.15;
    bandar.mkSampai = rnd + 5;
    NW.bump += 6;
    if (tindak === false && pr) {
      pr.cash += g;
      pr.kor = (pr.kor || 0) + g;
    }
    isi = "💰 <b>Bandar menang.</b> Razia dihentikan setelah upeti " + fm(g) + " cair" + (tindak === false && pr ? " ke kantong Presiden " + pr.n + " (tercatat sebagai jejak korupsi)" : "") + ". Harga kios naik 15% selama 5 putaran dan skandal memanaskan suasana.";
  } else {
    /* perang oknum: kas terkuras, pion OTT berpencar, kacau */
    bdBayar(Math.round(bandar.kas * 0.4));
    bandar.markup = 1.1;
    bandar.mkSampai = rnd + 3;
    NW.bump += 10;
    POLS.forEach((x) => (x.pos = (Math.random() * NN) | 0));
    isi = "⚔️ <b>Perang oknum.</b> Dua kubu saling jegal; kas Bandar terkuras 40%, pion OTT berpencar ke mana-mana, dan harga kios naik 10% selama 3 putaran.";
  }
  bandar.tiarap = false;
  bandar.cd = 6;
  P.forEach((x) => (x.pelapor = 0));
  cm(nPl(isi));
  bandar.riwayat.push({ r: rnd, e: "razia-" + out });
  await nt(`<h3>🕶️ Akhir Razia Kios Gelap</h3><div class="sub">Putaran ${rnd}</div>${sec("Hasil", '<p class="ct">' + isi + "</p>")}`);
  render();
}

/* ---------- tick akhir putaran (dipanggil tepat setelah polisi()) ---------- */
async function bandarTick() {
  if (rnd < 3) return;
  const ev = [];
  const alive = P.filter((x) => !x.x);
  /* statistik pemain: berhenti 2 putaran -> kupon pancing balik */
  for (const p of alive) {
    bdStat(p);
    p.sepi++;
    p.tier = bdTier(p);
    if (bdBuka() && p.sepi == 2 && bdN(p) >= 3 && !p.kupon) {
      p.kupon = 0.3;
      ev.push("🎁 Kios Gelap mengirim kupon diskon 30% untuk <b>" + p.n + "</b>: \"Kangen belanja? Kami kangen kamu.\"");
    }
  }
  if (bandar.rebootSetelah != null) {
    if (rnd >= bandar.rebootSetelah) {
      const gen = bandar.gen + 1;
      bandar = bandarBaru(true);
      bandar.gen = gen;
      bandar.dibuka = true;
      ev.push("🕶️ <b>Kios Gelap</b> buka lagi dengan lapak lebih kecil dan promo pembukaan. Wajah lama, trik lama.");
    }
  } else {
    if (!bandar.dibuka) {
      bandar.dibuka = true;
      bandar.jam = 0;
      ev.push("🕶️ <b>Kios Gelap</b> buka di petak Market. Promo pembukaan: harga miring dan hadiah lotre murah hati.");
    } else bandar.jam++;
    /* setoran oknum 10-25% pemasukan, naik saat tekanan tinggi */
    const tek = Math.min(1, (bdFase() / 4) * 0.6 + (bandar.kas > 1.5 * bandar.modalAwal ? 0.4 : 0)),
      set = bdBayar(Math.round((bandar.masuk * (0.1 + 0.15 * tek)) / 1e3) * 1e3);
    bandar.upetiTerakhir = set;
    bandar.riwayat.push({ r: rnd, masuk: bandar.masuk, keluar: bandar.keluar, setoran: set, kas: Math.round(bandar.kas) });
    if (bandar.riwayat.length > 12) bandar.riwayat.shift();
    bandar.masuk = bandar.keluar = 0;
    if (bandar.cd > 0) bandar.cd--;
    if (bandar.tiarap && rnd > bandar.tSampai) bandar.tiarap = false; /* pengaman bila arc batal */
    if (bandar.kas <= 0) {
      /* kas habis dibayar sebagai hadiah: Bandar tumbang sendiri */
      bandar.kas = 0;
      bandar.tiarap = false;
      bandar.rebootSetelah = rnd + BD_RAZIA_HARI;
      if (NW.arc && NW.arc.id == "razia") NW.arc = null;
      ev.push("💸 <b>Kios Gelap</b> bangkrut dihajar hadiah lotre. Lapak tutup, Bandar menghilang.");
    } else {
      const kp = bdKepepet();
      if (kp && !bandar.kp) ev.push("🥵 <b>Kios Gelap</b> kepepet kas: harga naik dan peluang lotre dibuat seketat mungkin.");
      bandar.kp = kp;
      /* sorotan: kas > 150% modal memicu arc razia */
      if (bandar.kas > 1.5 * bandar.modalAwal && !bandar.tiarap && !NW.arc && bandar.cd <= 0) NW.arc = { id: "razia", s: 0, p: -1, nx: rnd };
    }
  }
  if (ev.length) await nt('<h3>📰 Kabar Kios Gelap</h3><div class="sub">Putaran ' + rnd + "</div>" + sec("Kabar", ev.map((x) => '<p class="ct">' + x + "</p>").join("")));
  render();
}
/* ===== [/F2] ===== */
