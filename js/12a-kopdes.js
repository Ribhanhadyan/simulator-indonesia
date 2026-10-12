/* ===== KOPDES MERAH PUTIH =====
   Data per properti: own[i].kd = { w, sd, t, hut, n, g }
   w   = 1 Kopdes wajib (tidak bisa diserahkan), 0 tambahan
   sd  = saldo iuran tertahan (dibagi saat pemilik lewat MULAI)
   t   = tunggakan cicilan negara ke bank
   hut = piutang pemilik ke negara (talangan)
   n   = sisa tenor cicilan
   g   = jumlah putaran tunggakan berturut-turut */
const KDS = { ann: 0 };
const KD_CIL = 35e4,
  KD_RAPAT = 7,
  KD_TENGGAT = 3,
  KD_IURAN = 0.25,
  KD_GRACE = 3,
  KD_TG_W = 0.25,
  KD_TG_X = 0.5,
  KD_OWN = 0.6;
Object.assign(PRES, { pg: null, pgT: 0, pen: -1, penT: 0, pk: 0, pkT: 0, pj: -9 });

const kdList = (p) =>
    Object.keys(own)
      .map(Number)
      .filter((i) => own[i].o == p.id && own[i].kd),
  kdAktif = (p) => kdList(p).filter((i) => own[i].kd.n > 0).length,
  kdTg = (p) => kdList(p).reduce((a, i) => a + own[i].kd.t, 0),
  kdHut = (p) => kdList(p).reduce((a, i) => a + own[i].kd.hut, 0),
  kdTgAll = () => P.filter((x) => !x.x).reduce((a, p) => a + kdTg(p), 0),
  kdCand = (p) =>
    Object.keys(own)
      .map(Number)
      .filter((i) => own[i].o == p.id && T[i].t == "s" && !own[i].m && !own[i].kd),
  kdCil = () => Math.round((KD_CIL * (PRES.pg == "efisiensi" ? 0.5 : 1)) / 1e3) * 1e3,
  pgM = () => (PRES.pg == "cepat" ? 1.5 : PRES.pg == "efisiensi" ? 0.5 : 1);

const kdChip = (p) => {
  const n = kdN(p),
    tg = kdTg(p),
    ht = kdHut(p);
  if (n) return `<div class="rl">🏪 Kopdes ×${n}${tg ? " · tunggakan negara " + fm(tg) : ""}${ht ? " · piutang ke negara " + fm(ht) : ""}</div>`;
  if (KD_MAX && KDS.ann && !p.x && p.kdd != null) return `<div class="rl">🏪 Wajib bangun Kopdes sebelum putaran ${p.kdd}</div>`;
  return "";
};

/* ---------- siklus per putaran (dipanggil dari game() setelah news()) ---------- */
async function kopdesPutaran() {
  if (!KDS.ann) {
    if (rnd < KD_RAPAT) return;
    KDS.ann = rnd;
    say("🏪 Pemerintah meluncurkan program Kopdes Merah Putih");
    await nt(
      `<h3>🏪 Kopdes Merah Putih</h3><div class="sub">Putaran ${rnd}</div>` +
        sec("Program nasional", '<p class="ct">Pemerintah mewajibkan setiap warga pemilik properti kota membangun satu Kopdes. Cicilan pembangunan ditanggung APBN lewat bank negara.</p>') +
        sec("Kewajiban", rw("Kopdes wajib", "1 per pemain") + rw("Tenggat", KD_TENGGAT + " putaran sejak punya properti kota") + rw("Lalai", "negara menunjuk properti") + rw("Tambahan", "sukarela, maks 1 per petak")) +
        sec("Cara membangun", '<p class="ct">Buka 🏠 Aset › Program Pemerintah. Membangun gratis, tapi bila APBN menunggak cicilan, pemilik ikut menalangi.</p>'),
    );
  }
  /* 1. kewajiban membangun */
  for (const p of P.filter((x) => !x.x)) {
    if (kdN(p)) {
      p.kdd = null;
      continue;
    }
    const c = kdCand(p);
    if (!c.length) {
      p.kdd = null;
      continue;
    }
    if (p.kdd == null) p.kdd = rnd + KD_TENGGAT;
    if (p.b || rnd >= p.kdd) {
      const i = p.b ? c.reduce((a, b) => (T[b].p < T[a].p ? b : a)) : c[(Math.random() * c.length) | 0];
      own[i].kd = kdBaru(p);
      p.kdd = null;
      say(`🏪 ${p.b ? p.n + " membangun" : "Negara menunjuk " + p.n + " membangun"} Kopdes wajib di ${T[i].n}`);
      render();
    }
  }
  /* 2. cicilan ditanggung APBN; kekurangan = tunggakan */
  const cil = kdCil();
  for (const p of P.filter((x) => !x.x))
    for (const i of kdList(p)) {
      const k = own[i].kd;
      if (k.n > 0) {
        const bayar = Math.min(POOL, cil);
        POOL -= bayar;
        k.t += cil - bayar;
        k.n--;
      }
      k.g = k.t > 0 ? k.g + 1 : 0;
    }
  /* 3. APBN melunasi piutang pemilik bila ada kas */
  for (const p of P.filter((x) => !x.x))
    for (const i of kdList(p)) {
      const k = own[i].kd;
      if (k.hut > 0 && POOL > 0) {
        const r = Math.min(k.hut, POOL);
        POOL -= r;
        p.cash += r;
        k.hut -= r;
        say(`🏪 APBN melunasi piutang Kopdes ${T[i].n}: ${fm(r)} untuk ${p.n}`);
      }
    }
  /* 4. talangan pemilik atas tunggakan lewat masa tenggang */
  for (const p of P.filter((x) => !x.x)) {
    const due = [];
    for (const i of kdList(p)) {
      const k = own[i].kd;
      if (k.t > 0 && k.g > KD_GRACE) {
        const cap = Math.round((cil * (k.w ? KD_TG_W : KD_TG_X)) / 1e3) * 1e3,
          a = Math.min(k.t, cap);
        if (a > 0) due.push([i, a]);
      }
    }
    const tot = due.reduce((s, x) => s + x[1], 0);
    if (!tot || p.x) continue;
    if (!p.b)
      await nt(
        `<h3>🏪 Negara Menunggak Kopdes</h3><div class="sub">${p.n}</div>` +
          sec("Talangan", due.map(([i, a]) => rw(T[i].n + (own[i].kd.w ? " (wajib)" : ""), fm(a))).join("") + rw("Total", fm(tot))) +
          sec("Catatan", '<p class="ct">Kas APBN kurang untuk cicilan Kopdes. Kamu menalangi sebagian, tercatat sebagai piutang ke negara dan dibayar saat APBN pulih.</p>'),
      );
    if (await pay(p, tot, 0, 1)) {
      for (const [i, a] of due) {
        own[i].kd.t -= a;
        own[i].kd.hut += a;
      }
      say(`🏪 ${p.n} menalangi tunggakan Kopdes ${fm(tot)} (piutang ke negara)`);
    }
  }
  render();
}

/* ---------- bagi hasil saat pemilik lewat MULAI (dipanggil dari gaji()) ---------- */
function kopdesGaji(p) {
  if (!KD_MAX) return;
  for (const i of kdList(p)) {
    const k = own[i].kd;
    if (k.sd <= 0) continue;
    let s = k.sd;
    k.sd = 0;
    const lunas = Math.min(s, k.t);
    k.t -= lunas;
    s -= lunas;
    if (s <= 0) {
      say(`🏪 Iuran Kopdes ${T[i].n} ${fm(lunas)} dipakai melunasi tunggakan`);
      continue;
    }
    const ow = Math.min(0.9, Math.max(0.2, (KD_OWN - 0.2 * FZ.L) * (PRES.pg == "cepat" ? 1.5 : 1))),
      mine = Math.round((s * ow) / 1e3) * 1e3,
      gov = s - mine;
    p.cash += mine;
    if (gov > 0) toAPBN(gov, p);
    say(`🏪 Bagi hasil Kopdes ${T[i].n}: ${p.n} ${fm(mine)}, negara ${fm(gov)}${lunas ? " (lunasi tunggakan " + fm(lunas) + ")" : ""}`);
  }
}

/* ---------- bot ---------- */
function kopdesBot(p) {
  if (!KD_MAX || !KDS.ann || p.x) return;
  for (const i of kdList(p)) {
    const k = own[i].kd;
    if (!k.w && k.t > 2 * KD_CIL) {
      POOL += k.sd || 0;
      own[i].kd = 0;
      say(`🤖 ${p.n} menyerahkan Kopdes ${T[i].n} ke negara`);
    }
  }
  const lim = [2, 4, 1][SET.bs || 0];
  if (kdN(p) < lim && FZ.L < 0.35 && p.cash > 6e6 * BM()) {
    const c = kdCand(p);
    if (c.length) {
      const i = c.reduce((a, b) => (T[b].p > T[a].p ? b : a));
      own[i].kd = kdBaru(p);
      say(`🤖 ${p.n} membangun Kopdes di ${T[i].n}`);
    }
  }
  render();
}

/* ---------- timer kebijakan Presiden (dipanggil tiap awal putaran, sebelum news) ---------- */
function kdPresTick() {
  if (PRES.pgT && !--PRES.pgT) PRES.pg = null;
  if (PRES.penT && !--PRES.penT) PRES.pen = -1;
  if (PRES.pkT && !--PRES.pkT) PRES.pk = 0;
}

/* ---------- penyaluran bantuan negara lewat Kopdes ---------- */
const kdPen = (rec) => {
  const c = Object.keys(own)
    .map(Number)
    .filter((i) => own[i].kd && own[i].o != NEG && P[own[i].o] && !P[own[i].o].x && own[i].o != rec.id);
  if (!c.length) return null;
  if (PRES.pen >= 0 && PRES.penT) {
    const f = c.filter((i) => own[i].o == PRES.pen);
    if (f.length) return f[(Math.random() * f.length) | 0];
  }
  return c[(Math.random() * c.length) | 0];
};
async function salur(rec, a) {
  const a0 = a;
  let note = "";
  if (PRES.pk && PRES.pkT && PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x && !isP(rec) && rec.cash >= 1e6) {
    const cut = Math.round(a / 2 / 1e3) * 1e3;
    a -= cut;
    POOL += cut;
    NW.bump += 3;
    note = ` · dipangkas Presiden ${fm(cut)}`;
  }
  const si = KD_MAX ? kdPen(rec) : null;
  if (si == null) {
    rec.cash += a;
    if (note) say(`🏛️ Bantuan untuk ${rec.n}: dijanjikan ${fm(a0)}, diterima ${fm(a)}${note}`);
    render();
    return;
  }
  const ow = P[own[si].o],
    kom = Math.min(POOL, Math.round((a * 0.1) / 1e3) * 1e3),
    maks = Math.round((a * 0.3) / 1e3) * 1e3;
  POOL -= kom;
  ow.cash += kom;
  let tilap = 0;
  if (maks > 0) {
    if (ow.b) tilap = Math.random() < [0.25, 0.6, 0.05][SET.bs || 0] ? 1 : 0;
    else
      tilap = await ask(
        `<h3>🏪 Penyaluran Bantuan</h3><div class="sub">${ow.n}</div>` +
          sec("Bantuan negara", rw("Penerima", rec.n) + rw("Jumlah", fm(a)) + rw("Komisi untukmu", fm(kom))) +
          sec("Pilihan", '<p class="ct">Teruskan penuh, atau tilap hingga ' + fm(maks) + " (masuk kasmu, tercatat sebagai jejak korupsi dan diincar OTT).</p>"),
        [
          ["Teruskan penuh", 0],
          ["Tilap " + fm(maks), 1],
        ],
        ow,
      );
  }
  if (tilap) {
    ow.cash += maks;
    ow.kor = (ow.kor || 0) + maks;
    a -= maks;
  }
  rec.cash += a;
  say(`🏛️ Bantuan untuk ${rec.n} (dijanjikan ${fm(a0)}) disalurkan lewat Kopdes ${T[si].n} milik ${ow.n}: diterima ${fm(a)}${note}`);
  render();
}

/* ---------- keputusan Presiden: Program Pemerintah ---------- */
const progOk = () => (MBG_MAX && P.some((x) => !x.x && nmb(x) > 0)) || (KD_MAX && P.some((x) => !x.x && kdN(x) > 0));
async function programPres(p, bot) {
  const alive = P.filter((x) => !x.x),
    adaKd = KD_MAX && alive.some((x) => kdN(x) > 0),
    miskin = nPoor() === p,
    ok = {
      cepat: FZ.L < 0.65 && PRES.pg != "cepat",
      efisiensi: PRES.pg != "efisiensi",
      pen: adaKd,
      pk: !miskin && rnd - PRES.pj >= 2 && !PRES.pk,
      audit: alive.some((x) => x !== p),
    };
  let k;
  if (bot) k = FZ.L >= 0.35 && ok.efisiensi ? "efisiensi" : ok.audit && alive.some((x) => x !== p && (x.kor || 0) > 0) ? "audit" : ok.cepat && FZ.L < 0.2 ? "cepat" : ok.efisiensi ? "efisiensi" : ok.pen ? "pen" : null;
  else
    k = await ask(
      `<h3>🏛️ Program Pemerintah</h3><div class="sub">${p.n} · 1× per putaran</div>` +
        sec("Anggaran program", rw("📈 Percepat", "MBG ×1,5, bagi hasil pemilik Kopdes ×1,5 (3 putaran)") + rw("✂️ Efisiensi", "insentif MBG dan cicilan Kopdes −50% (3 putaran)")) +
        sec("Bantuan negara", rw("📍 Tunjuk penyalur", "bantuan lewat Kopdes pilihanmu") + rw("✂️ Pangkas bantuan", "penerima hanya dapat 50% (jika kasnya ≥ Rp1 jt)")) +
        sec("Pengawasan", rw("🔎 Audit", "jejak korupsi didenda; yang bersih dapat ganti nama baik")),
      [
        ["📈 Percepat", "cepat", !ok.cepat],
        ["✂️ Efisiensi", "efisiensi", !ok.efisiensi],
        ["📍 Tunjuk penyalur", "pen", !ok.pen],
        ["✂️ Pangkas bantuan", "pk", !ok.pk],
        ["🔎 Audit", "audit", !ok.audit],
        ["Batal", null],
      ],
      p,
    );
  if (!k) return false;
  if (k == "cepat" || k == "efisiensi") {
    PRES.pg = k;
    PRES.pgT = 3;
    say(`🏛️ Presiden ${p.n}: program pemerintah ${k == "cepat" ? "dipercepat (MBG ×1,5, bagi hasil Kopdes ×1,5)" : "diefisiensikan (insentif MBG dan cicilan Kopdes −50%)"}`);
  } else if (k == "pen") {
    const os = [...new Set(Object.keys(own).filter((i) => own[i].kd && own[i].o != NEG).map((i) => own[i].o))].map((id) => P[id]).filter((x) => x && !x.x);
    if (!os.length) return false;
    let q;
    if (bot) q = os.includes(p) ? p : os[(Math.random() * os.length) | 0];
    else {
      const id = await ask(
        `<h3>📍 Tunjuk Penyalur</h3><p>Pilih pemilik Kopdes yang menyalurkan bantuan berikutnya.</p>`,
        os.map((x) => [`${x.n} (Kopdes ×${kdN(x)})`, x.id]).concat([["Batal", -1]]),
        p,
      );
      if (id < 0) return false;
      q = P[id];
    }
    PRES.pen = q.id;
    PRES.penT = 2;
    say(`📍 Presiden ${p.n} menunjuk Kopdes milik ${q.n} sebagai penyalur bantuan berikutnya`);
  } else if (k == "pk") {
    PRES.pk = 1;
    PRES.pkT = 2;
    PRES.pj = rnd;
    say(`✂️ Presiden ${p.n} memangkas penyaluran bantuan berikutnya 50%`);
  } else if (k == "audit") {
    const cs = alive.filter((x) => x !== p);
    let q;
    if (bot) q = cs.reduce((a, b) => ((b.kor || 0) > (a.kor || 0) ? b : a));
    else {
      const id = await ask(
        `<h3>🔎 Audit Program</h3><p>Pilih pemain yang diperiksa. Jejak korupsi didenda; yang bersih mendapat ganti nama baik dari APBN.</p>`,
        cs.map((x) => [`${x.n}${(x.kor || 0) > 0 ? " 🕵️" : ""}`, x.id]).concat([["Batal", -1]]),
        p,
      );
      if (id < 0) return false;
      q = P[id];
    }
    if ((q.kor || 0) > 0) {
      const d = Math.max(5e5, Math.round((q.kor * 0.3) / 1e5) * 1e5);
      say(`🔎 Audit Presiden ${p.n}: ${q.n} terbukti menyimpang, denda ${fm(d)}`);
      await pay(q, d);
    } else {
      const g = Math.min(POOL, 5e5);
      POOL -= g;
      q.cash += g;
      say(`🔎 Audit Presiden ${p.n}: ${q.n} bersih, ganti nama baik ${fm(g)} dari APBN`);
    }
  }
  render();
  return true;
}

/* ---------- pembungkus fungsi lama (semuanya function declaration, jadi bisa ditimpa) ---------- */
{
  const _toNeg = toNeg,
    _bk = bankrupt,
    _bm = botManage;
  toNeg = function (i) {
    const o = own[i];
    if (o && o.kd) POOL += o.kd.sd || 0;
    const r = _toNeg.apply(this, arguments);
    if (o) o.kd = 0;
    return r;
  };
  bankrupt = function (p) {
    const ids = kdList(p);
    ids.forEach((i) => (POOL += own[i].kd.sd || 0));
    const r = _bk.apply(this, arguments);
    ids.forEach((i) => {
      if (own[i]) own[i].kd = 0;
    });
    return r;
  };
  botManage = function (p) {
    _bm.apply(this, arguments);
    kopdesBot(p);
  };
}
