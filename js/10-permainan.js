async function lelang(p) {
  const a = T.map((t, i) => i).filter((i) => ["s", "r", "u"].includes(T[i].t) && !own[i]);
  if (!a.length) {
    await nt("<h3>🔨 Lelang Properti</h3><p>Semua properti sudah terjual. Tidak ada yang dilelang.</p>");
    return;
  }
  const i = a[(Math.random() * a.length) | 0];
  await nt(`<h3>🔨 Lelang Properti</h3><div class="sub">${p.n}</div>${sec("Dilelang", rw(gtag(i) + T[i].n, fm(T[i].p)))}${gInfo(i)}${sec("Aturan", '<p class="ct">Semua pemain boleh menawar. Kenaikan tawaran 10% dari harga.</p>')}`);
  say(`🔨 Lelang dadakan: ${T[i].n}`);
  await auction(i);
}
async function bumn(p) {
  const pr = 2e6,
    mx = 3,
    n = p.sb || 0;
  const c = await ask(
    `<h3>🏭 Saham BUMN</h3><div class="sub">${p.n}</div>${sec("Penawaran", rw("Harga per saham", fm(pr)) + rw("Dividen tiap lewat MULAI", fm(DIV())) + rw("Saham milikmu", n + " / " + mx))}${sec("Catatan", "<p>Bayaran masuk Dana APBN. Dividen turun saat krisis.</p>")}<p>Uangmu: ${fm(p.cash)}</p>`,
    [
      ["Beli saham " + fm(pr), 1, p.cash < pr || n >= mx],
      ["Lewati", 0],
    ],
  );
  if (c && (await pay(p, pr))) {
    p.sb = n + 1;
    say(`🏭 ${p.n} membeli saham BUMN (${p.sb}/${mx})`);
    render();
  }
}
async function bandara(p) {
  const st = T.map((t, i) => i).filter((i) => T[i].t == "r" && i != p.pos),
    oth = (i) => own[i] && own[i].o != p.id && !own[i].m,
    lb = (i) => {
      const o = own[i];
      return "✈️ " + T[i].n + (!o ? " (kosong)" : o.o == NEG ? " (negara)" : o.o == p.id ? " (milikmu)" : " (milik " + P[o.o].n + ")");
    };
  const v = await ask(
    `<h3>✈️ Bandara</h3><div class="sub">${p.n}</div>${sec("Penerbangan", '<p class="ct">Terbang gratis ke stasiun kereta mana pun, atau tetap di sini.</p>')}`,
    st
      .filter((i) => !oth(i))
      .map((i) => [lb(i), i])
      .concat(
        [["Tetap di sini", -1]],
        st.filter(oth).map((i) => [lb(i), i]),
      ),
  );
  if (v >= 0) {
    if (v < p.pos) gaji(p);
    p.pos = v;
    say(`✈️ ${p.n} terbang ke ${T[v].n}`);
    render();
    await land(p, 7);
  }
}
const gInfo = (i) => {
  const t = T[i],
    l = gl(t),
    mem = t.g ? grp(i) : T.map((x, j) => j).filter((j) => T[j].t == t.t),
    k = GK.indexOf(t.g);
  return sec("Grup aset " + l, rw("Anggota", mem.map((j) => T[j].n).join(", ")) + (t.g ? rw("Nilai grup", "★".repeat(k + 1) + "☆".repeat(GK.length - k - 1)) : rw("Jenis", t.t == "r" ? "Stasiun" : "Utilitas")));
};
async function auction(i) {
  CT = i;
  const t = T[i],
    inc = t.p / 10,
    out = new Set(),
    live = () => P.filter((x) => !x.x && !out.has(x));
  let bid = 0,
    lead = null;
  while (live().length > 1 || (live().length == 1 && !lead))
    for (const q of live()) {
      if (q == lead) continue;
      if (live().length == 1 && lead) break;
      const c = await ask(
        `<h3>Lelang: ${gtag(i)}${t.n}</h3>${gInfo(i)}<p>Tawaran tertinggi: ${fm(bid)}${lead ? " oleh " + lead.n : ""}<br>Giliran ${q.k} ${q.n} (uang ${fm(q.cash)})</p>`,
        [
          [`Tawar ${fm(bid + inc)}`, 1, q.cash < bid + inc],
          ["Mundur", 0],
        ],
        q,
      );
      if (c) {
        bid += inc;
        lead = q;
      } else out.add(q);
    }
  if (lead) {
    lead.cash -= bid;
    own[i] = { o: lead.id, h: 0 };
    say(`${lead.n} memenangkan lelang ${gtag(i)}${t.n} (${fm(bid)})`);
  } else say(`${t.n} tidak terjual`);
  render();
}
function jail(p) {
  if (p.imun) {
    p.imun = 0;
    say(`⚖️ ${p.n} kebal hukum berkat pengacara (sekali pakai)`);
    render();
    return;
  }
  if (Math.random() < R(p).jl) {
    say(`${R(p).i} ${p.n} lolos dari penjara berkat perannya`);
    render();
    return;
  }
  p.pos = IJ;
  p.jail = 0;
  stat(p.id, "jail", 1);
  say(`⛓️ ${p.n} masuk penjara`);
  render();
}
async function move(p, n) {
  if (p.mul) {
    const m = p.mul;
    p.mul = 0;
    n = Math.max(1, Math.round(n * m));
    say(`🎲 Pengali dadu ×${m}: ${p.n} berjalan ${n} petak`);
  }
  for (let k = 0; k < n; k++) {
    p.pos = (p.pos + 1) % NN;
    if (!p.pos) gaji(p);
    render();
    await sleep(150);
  }
}
async function land0(p, sum) {
  const i = p.pos,
    t = T[i],
    o = own[i];
  CT = i;
  await sleep(500);
  if (POLS.some((x) => x.pos == i) && i != IJ && p.jail < 0) {
    await tangkap(p);
    if (p.jail >= 0) return;
  }
  if ("sru".includes(t.t)) {
    if (!o) {
      let c;
      const bp = cardBuy(p, t.p);
      for (;;) {
        c = await ask(info(i) + `<p>Uangmu: ${fm(p.cash)}</p>`, [
          [`Beli ${fm(bp)}${bp < t.p ? " (diskon 30%)" : ""}`, 1, p.cash < bp],
          ["Lelang", 0],
          ["🏦 Pinjam ke Bank", 2],
        ]);
        if (c != 2) break;
        await bank(P[cur]);
      }
      if (c) {
        p.cash -= bp;
        if (bp < t.p) {
          dropC(p, "dp");
          say(`🏷️ Diskon properti terpakai: hemat ${fm(t.p - bp)}`);
        }
        own[i] = { o: p.id, h: 0 };
        say(`${p.n} membeli ${gtag(i)}${t.n}`);
        render();
      } else await auction(i);
    } else if (o.o != p.id && !o.m) {
      let r = Math.round((rent(i, sum) * R(p).rp * (t.t != "s" ? R(p).rs : 1) * (o.o == NEG ? fzRent() : R(P[o.o]).ri)) / 1e3) * 1e3;
      const r0 = r;
      r = cardRent(p, r);
      const iur = o.kd && o.o != NEG ? Math.round((r0 * KD_IURAN) / 1e3) * 1e3 : 0;
      await ask(
        `<h3>Bayar Sewa</h3>${sec("Properti", rw(gtag(i) + t.n, ""))}${sec("Pemilik", rw(OW(o), ""))}${sec("Tagihan", rw("Sewa", fm(r0)) + (o.o == NEG && FZ.L >= 0.05 ? rw("🧮 Penyesuaian fiskal APBN", "sewa aset negara ×" + fx(fzRent())) : "") + (r < r0 ? rw("🛡️ Asuransi sewa", "−" + fm(r0 - r)) + rw("Kamu bayar", fm(r)) : "") + (iur ? rw("🏪 Iuran Kopdes (ditahan sampai pemilik lewat MULAI)", fm(iur)) : ""))}${o.o == NEG ? sec("Tujuan", '<p class="ct">Aset negara: sewa masuk Dana APBN</p>') : ""}`,
        [["Bayar", 1]],
      );
      say(`${p.n} bayar sewa ${fm(r)} ke ${o.o == NEG ? "Negara (APBN)" : P[o.o].n}`);
      stat(o.o == NEG ? -1 : o.o, "rent", r);
      await pay(p, r, o.o == NEG ? 0 : P[o.o]);
      if (iur && !p.x && o.kd && (await pay(p, iur, 0, 1))) {
        if (o.kd) o.kd.sd += iur;
        say(`🏪 ${p.n} membayar iuran Kopdes ${fm(iur)} (ditahan sampai ${P[o.o] ? P[o.o].n : "pemilik"} lewat MULAI)`);
      }
    }
  } else if (t.t == "x") {
    let a = Math.round(((i == IP ? Math.max(t.p, Math.round(p.cash / 1e5) * 1e4) : t.p) * R(p).tax * (isP(p) ? 0 : 1) * crM() * fzTax()) / 1e3) * 1e3;
    const a0 = a;
    if (a && hasC(p, "bp")) {
      dropC(p, "bp");
      a = 0;
      say(`🧾 ${p.n} bebas pajak berkat kartu`);
    }
    await ask(
      `<h3>${t.n}</h3>${sec("Pajak", rw(i == IP ? "Progresif 10% kas (min. " + fm(t.p) + ")" : "Tarif tetap", a0 && !a ? "Rp0 (🧾 bebas pajak)" : fm(a)) + (FZ.L >= 0.05 ? rw("🧮 Penyesuaian fiskal APBN", "pajak ×" + fx(fzTax())) : ""))}${sec("Tujuan", '<p class="ct">Masuk Dana APBN</p>')}`,
      [["Bayar", 1]],
    );
    await pay(p, a);
  } else if (t.t == "c" || t.t == "k") await draw(p, t.t, sum);
  else if (t.t == "rp") await getRole(p);
  else if (t.t == "la") await lelang(p);
  else if (t.t == "mk") await market(p);
  else if (t.t == "bu") await bumn(p);
  else if (t.t == "ap") await bandara(p);
  else if (t.t == "gm") await tambang(p);
  else if (t.t == "fp") await korupsi(p, sum);
  else if (t.t == "gj") {
    await ask("<h3>Masuk Penjara!</h3><p>Langsung ke penjara, tanpa melewati MULAI.</p>", [["OK", 1]]);
    jail(p);
  }
}
const nt = (h, w) => ask(h, [["OK", 1]], w && w.b ? w : P.find((x) => !x.b && !x.x) || { b: 1, n: "Sistem" });
const yn = (b, h, yes, okb) =>
  b.b
    ? okb
    : ask(
        h,
        [
          [yes, 1],
          ["Tolak", 0],
        ],
        b,
      );
const d2 = () => ((1 + Math.random() * 6) | 0) + ((1 + Math.random() * 6) | 0);
async function inter(a, b) {
  const ra = R(a).n,
    rb = R(b).n;
  if (ra == rb || a.x || b.x) return;
  const hd = (i, t) => `<h3>${i} ${t}</h3><div class="sub">${a.n} ⇄ ${b.n}</div>`;
  if (ra == "Politisi") {
    const m = 2e5;
    await nt(hd("🏛️", "Serangan Fajar") + sec("Kejadian", '<p class="ct">' + a.n + " membagi amplop ke " + b.n + "</p>") + sec("Efek", rw(a.n + " bayar", fm(m))));
    say(`🏛️ ${a.n} serangan fajar ke ${b.n}: ${fm(m)}`);
    await pay(a, m, b);
  } else if (ra == "Dokter") {
    const m = 1e5;
    if (b.cash < m) return;
    if (await yn(b, hd("🩺", "Konsultasi Dokter") + sec("Tawaran", rw("Biaya konsultasi", fm(m)) + rw("Imbalan", "Biaya kesehatan kartu berikutnya gratis")), "Bayar " + fm(m), b.cash - m >= 1e6)) {
      await pay(b, m, a);
      b.gk = 1;
      say(`🩺 ${b.n} konsultasi ke ${a.n} (${fm(m)})`);
    } else say(`🩺 ${b.n} menolak konsultasi ${a.n}`);
  } else if (ra == "Pengacara") {
    const m = 3e5;
    if (b.imun || b.cash < m) return;
    if (await yn(b, hd("⚖️", "Jasa Pengacara") + sec("Tawaran", rw("Biaya jasa", fm(m)) + rw("Imbalan", "Kebal OTT/penjara satu kali")), "Sewa " + fm(m), b.cash - m >= 5e6)) {
      await pay(b, m, a);
      b.imun = 1;
      say(`⚖️ ${b.n} menyewa ${a.n}: kebal hukum 1×`);
    } else say(`⚖️ ${b.n} menolak jasa ${a.n}`);
  } else if (ra == "TNI/Polri") {
    if (rb == "Politisi" || isP(b)) return;
    const m = 15e4;
    await nt(hd("🎖️", "Tilang") + sec("Kejadian", '<p class="ct">' + a.n + " menilang " + b.n + "</p>") + sec("Efek", rw(b.n + " bayar", fm(m))));
    say(`🎖️ ${a.n} menilang ${b.n}: ${fm(m)}`);
    await pay(b, m, a);
  } else if (ra == "Content Creator") {
    if (rb == "Politisi") {
      const m = 15e4;
      await nt(hd("📱", "Skandal Viral") + sec("Kejadian", '<p class="ct">Kolaborasi ' + a.n + " dan " + b.n + " viral sebagai skandal</p>") + sec("Efek", rw("Masing-masing bayar", fm(m)) + rw("Tujuan", "Dana APBN")));
      say(`📱 Skandal ${a.n} & ${b.n}: denda ${fm(m)} masing-masing`);
      await pay(a, m);
      if (!b.x) await pay(b, m);
    } else {
      const m = 1e5;
      a.cash += m;
      b.cash += m;
      render();
      await nt(hd("📱", "Kolaborasi Viral") + sec("Kejadian", '<p class="ct">Konten bareng ' + a.n + " dan " + b.n + " viral</p>") + sec("Efek", rw("Masing-masing terima", fm(m))));
      say(`📱 Kolaborasi ${a.n} & ${b.n}: +${fm(m)} masing-masing`);
    }
  } else if (ra == "Atlet") {
    const m = 2e5;
    if (a.cash < m || b.cash < m) return;
    if (!(await yn(b, hd("🏅", "Tantangan Duel") + sec("Tantangan", '<p class="ct">' + a.n + " menantang " + b.n + " adu lempar dadu</p>") + sec("Taruhan", rw("Pemenang menerima", fm(m))), "Terima duel", b.cash - m >= 4e6))) {
      say(`🏅 ${b.n} menolak duel ${a.n}`);
      return;
    }
    const x = d2(),
      y = d2(),
      w = x > y ? a : y > x ? b : null;
    await nt(hd("🏅", "Hasil Duel") + sec("Lemparan", rw(a.n, x) + rw(b.n, y)) + sec("Pemenang", '<p class="ct">' + (w ? w.n + " menang " + fm(m) : "Seri, tidak ada yang bayar") + "</p>"));
    say(`🏅 Duel ${a.n} (${x}) vs ${b.n} (${y}): ${w ? w.n + " menang" : "seri"}`);
    if (w) await pay(w == a ? b : a, m, w);
  }
}
let LD = 0;
async function meet(p) {
  if (p.pos == IJ) return;
  for (const q of P.filter((x) => !x.x && x != p && x.pos == p.pos && x.jail < 0))
    for (const [a, b] of [
      [p, q],
      [q, p],
    ]) {
      if (p.x || q.x || p.jail >= 0) return;
      await inter(a, b);
    }
  render();
}
async function land(p, sum) {
  LD++;
  try {
    await land0(p, sum);
  } finally {
    LD--;
  }
  if (!LD && !p.x && p.jail < 0) await meet(p);
}
const KB = [
  ["bansos", "🎁 Bansos massal", "Semua pemain +Rp300.000 dari APBN; pendukungmu +Rp100.000 tambahan"],
  ["pajak", "📈 Naikkan pajak", "Semua pemain lain bayar Rp100.000 ke presiden"],
  ["bunga", "🏦 Atur bunga BI", "Bunga pinjaman ×0,6 atau ×1,5 sampai akhir putaran berikutnya"],
  ["amnesti", "⚖️ Amnesti", "Bebaskan satu pemain dari penjara"],
  ["psn", "🏗️ Proyek Strategis Nasional", "Negara membeli paksa 1 properti acak milik pemain lain (ganti rugi 1,25×)"],
];
const jailed = () => P.filter((x) => !x.x && x.jail >= 0);
async function election() {
  const al = P.filter((x) => !x.x),
    cand = al.filter((c) => !(c.id === PRES.id && PRES.t >= 2));
  if (!cand.length) return;
  say("🗳️ Pemilu presiden dimulai!");
  const hum = () => P.find((x) => !x.b && !x.x) || { b: 1, n: "Sistem" };
  await ask(
    `<h3>🗳️ Pemilu Presiden</h3><div class="sub">Setiap 5 putaran</div>${sec("Aturan", '<p class="ct">Tiap pemain memilih satu pemain lain, tidak boleh diri sendiri. Suara Politisi dihitung 2. Seri diundi dengan dadu. Maksimal 2 periode berturut-turut.</p>')}${PRES.id >= 0 ? sec("Petahana", rw(P[PRES.id].n, "periode " + PRES.t + "/2")) : ""}`,
    [["Mulai pemilu", 1]],
    hum(),
  );
  const tally = {},
    votes = {};
  cand.forEach((c) => (tally[c.id] = 0));
  for (const v of al) {
    const opts = cand.filter((c) => c !== v);
    if (!opts.length) continue;
    let id;
    if (v.b) {
      const sc = (c) => c.cash + ast(c),
        m = Math.min(...opts.map(sc)),
        w = opts.filter((c) => sc(c) == m);
      id = w[(Math.random() * w.length) | 0].id;
    } else
      id = await ask(
        `<h3>🗳️ Giliran ${v.n} memilih</h3><div class="sub">${R(v).i} ${R(v).n}${R(v).n == "Politisi" ? " · suara ×2" : ""}</div>${sec("Pilih presiden", '<p class="ct">Kamu tidak bisa memilih dirimu sendiri.</p>')}`,
        opts.map((c) => [`${c.n} (${R(c).n})`, c.id]),
        v,
      );
    votes[v.id] = id;
    tally[id] += R(v).n == "Politisi" ? 2 : 1;
  }
  const top = Math.max(...Object.values(tally));
  let tied = cand.filter((c) => tally[c.id] == top),
    note = "";
  while (tied.length > 1) {
    const r = tied.map((c) => [c, d2()]),
      mx = Math.max(...r.map((x) => x[1]));
    tied = r.filter((x) => x[1] == mx).map((x) => x[0]);
    note = "Suara seri, pemenang diundi dengan dadu";
  }
  const w = tied[0];
  if (w.id === PRES.id) PRES.t++;
  else {
    PRES.id = w.id;
    PRES.t = 1;
  }
  PRES.sup = Object.keys(votes)
    .filter((k) => votes[k] === w.id)
    .map(Number)
    .filter((k) => !P[k].x);
  PRES.sup.forEach((k) => (P[k].cash += 2e5));
  say(`👑 ${w.n} terpilih menjadi presiden (periode ${PRES.t}/2)`);
  render();
  await nt(
    `<h3>👑 ${w.n} Terpilih!</h3><div class="sub">Presiden periode ${PRES.t}/2</div>${sec("Hasil suara", cand.map((c) => rw(c.n, tally[c.id])).join(""))}${note ? sec("Catatan", '<p class="ct">' + note + "</p>") : ""}${sec("Dukungan pemilih", rw("Bonus per pendukung", fm(2e5)) + rw("Pendukung", PRES.sup.map((k) => P[k].n).join(", ") || "tidak ada"))}`,
  );
}
async function kebijakan(p, bot) {
  if (!isP(p) || PRES.used) return;
  if (!PRES.offer)
    PRES.offer = shuf(KB)
      .slice(0, 3)
      .map((x) => x[0]);
  const ofr = PRES.offer.map((k) => KB.find((x) => x[0] == k)),
    ok = (k) => (k == "amnesti" ? jailed().length > 0 : k == "psn" ? P.some((x) => !x.x && x !== p && mine(x).length > 0) : true);
  let k;
  const prog = progOk();
  if (bot) k = ["pajak", "bunga", "bansos", "amnesti", "psn"].find((x) => ofr.some((o) => o[0] == x && ok(x))) || (prog ? "prog" : null);
  else
    k = await ask(
      `<h3>👑 Kebijakan Presiden</h3><div class="sub">${p.n} · 1× per putaran</div>${ofr.map((x) => sec(x[1], '<p class="ct">' + x[2] + "</p>")).join("")}${prog ? sec("🏛️ Program Pemerintah", '<p class="ct">Atur program MBG dan Kopdes: percepat, efisiensi, tunjuk penyalur bantuan, pangkas bantuan, atau audit.</p>') : ""}`,
      ofr.map((x) => [x[1], x[0], !ok(x[0])]).concat(prog ? [["🏛️ Program Pemerintah", "prog"]] : [], [["Batal", null]]),
      p,
    );
  if (!k) return;
  if (k == "prog") {
    if (!(await programPres(p, bot))) return;
  } else if (k == "bansos") {
    for (const q of P.filter((x) => !x.x)) q.cash += 3e5 + (PRES.sup.includes(q.id) ? 1e5 : 0);
    say(`🎁 Presiden ${p.n} membagikan bansos massal`);
  } else if (k == "pajak") {
    say(`📈 Presiden ${p.n} menaikkan pajak: Rp100.000 per pemain`);
    for (const q of P.filter((x) => !x.x && x !== p)) {
      if (p.x) break;
      await pay(q, 1e5, p);
    }
  } else if (k == "bunga") {
    const m = bot
      ? p.loans.length
        ? 0.6
        : 1.5
      : await ask(
          `<h3>🏦 Atur Bunga BI</h3><p>Berlaku sampai akhir putaran berikutnya.</p>`,
          [
            ["Turunkan ×0,6", 0.6],
            ["Naikkan ×1,5", 1.5],
          ],
          p,
        );
    PRES.bi = m;
    PRES.biT = 2;
    say(`🏦 Presiden ${p.n} mengatur bunga pinjaman ×${String(m).replace(".", ",")}`);
  } else if (k == "amnesti") {
    const js = jailed();
    let q;
    if (bot) q = js[0];
    else {
      const id = await ask(`<h3>⚖️ Amnesti</h3><p>Pilih pemain yang dibebaskan.</p>`, js.map((x) => [x.n, x.id]).concat([["Batal", -1]]), p);
      if (id < 0) return;
      q = P[id];
    }
    q.jail = -1;
    say(`⚖️ Presiden ${p.n} memberi amnesti kepada ${q.n}`);
  } else if (k == "psn") {
    const cs = P.filter((x) => !x.x && x !== p && mine(x).length);
    if (!cs.length) return;
    let q;
    if (bot) q = cs.reduce((a, b) => (ast(b) > ast(a) ? b : a));
    else {
      const id = await ask(`<h3>🏗️ Proyek Strategis Nasional</h3><p>Pilih pemain yang propertinya dibebaskan negara (1 properti acak, ganti rugi 1,25×).</p>`, cs.map((x) => [x.n, x.id]).concat([["Batal", -1]]), p);
      if (id < 0) return;
      q = P[id];
    }
    await paksa(q, "Proyek Strategis Nasional atas kebijakan Presiden " + p.n);
  }
  PRES.used = 1;
  render();
  if (bot) await sleep(700);
}
async function assignRoles() {
  const al = P.filter((x) => !x.x && x.role === undefined);
  if (!al.length) return;
  say("🎭 Dua putaran pertama selesai: peran dibagikan ke semua pemain");
  for (const q of al) if (!q.x) await getRole(q);
}
async function draw(p, ty, sum) {
  const d = dk[ty],
    c = d.shift(),
    [tx, a, v, w] = c;
  await ask(
    `<h3 style="background:${ty == "c" ? "#f7941d" : "#4aa8d8"}">${ty == "c" ? "Kesempatan" : "Dana Umum"}</h3><div class="sub">${ty == "c" ? "Peristiwa nasional & kejutan" : "Kebutuhan & keberuntungan sehari-hari"}</div>${sec("Isi Kartu", '<p class="ct">' + tx + "</p>")}${sec("Efek", '<p class="ef">' + EFF(p, c) + "</p>")}`,
    [["OK", 1]],
  );
  if (a != "f") d.push(c);
  say(`${p.n}: ${tx}`);
  stat(p.id, "cards", 1);
  if (a == "m") {
    if (v > 0) {
      p.cash += Math.round((v * K * R(p).cg) / 1e3) * 1e3;
      render();
    } else {
      if (p.gk && /dokter|sakit|vaksin|kesehatan|BPJS|kecelakaan/i.test(tx)) {
        p.gk = 0;
        say(`🩺 ${p.n} berobat gratis berkat konsultasi`);
      } else await pay(p, Math.round((-v * K * cm(p, tx)) / 1e3) * 1e3);
    }
  } else if (a == "e") {
    for (const q of P.filter((x) => !x.x && x != p)) await pay(q, v * K, p);
  } else if (a == "g") {
    if (v < p.pos) gaji(p);
    p.pos = v;
    render();
    await land(p, sum);
  } else if (a == "b") {
    p.pos = (p.pos + NN - 3) % NN;
    render();
    await land(p, sum);
  } else if (a == "d") {
    if (p.loans.length) {
      p.loans.forEach((l) => {
        l.pr = Math.round((l.pr * (100 - v)) / 100 / 1e3) * 1e3;
        l.inst = l.pr / Math.max(1, l.n);
      });
      p.loans = p.loans.filter((l) => l.pr > 0);
    } else p.cash += 3e5;
    render();
  } else if (a == "i") {
    if (p.loans.length) p.nb = 1;
    render();
  } else if (a == "k") {
    p.cash += 3e6;
    p.loans.push({ pr: 3e6, inst: 3e5, r: 0.01, n: 10 });
    render();
  } else if (a == "p") {
    const t = p.loans.reduce((s, l) => s + l.pr, 0);
    if (t) await pay(p, Math.round((t * v) / 100 / 1e3) * 1e3);
  } else if (a == "a") {
    p.cash += Math.min(1e6, Math.round((p.cash * 0.05) / 1e3) * 1e3);
    render();
  } else if (a == "h") {
    let n = 0,
      H = 0;
    for (const i in own) if (own[i].o == p.id) own[i].h > 4 ? H++ : (n += own[i].h);
    await pay(p, n * v * K + H * w * K);
  } else if (a == "j") jail(p);
  else if (a == "c") {
    jail(p);
    if (p.jail >= 0) {
      p.kor = 0;
      await sita(p, "Aset hasil korupsi disita negara");
    }
  } else if (a == "z") await paksa(p, "Proyek Strategis Nasional");
  else if (a == "y") await sita(p, "Negara menyita aset pengemplang pajak");
  else if (a == "f") {
    p.cards++;
    render();
  }
}
async function wait(label) {
  const b = $("#roll"),
    p = P[cur];
  b.textContent = label;
  if (p?.b) {
    b.disabled = true;
    await sleep(1200);
    if (label[0] == "A") {
      botManage(p);
      botCards(p);
    }
    return;
  }
  b.disabled = false;
  await new Promise((r) => (b.onclick = r));
  b.disabled = true;
}
async function rollDice() {
  await wait("🎲 Lempar Dadu");
  let a, b;
  for (let k = 0; k < 6; k++) {
    a = (1 + Math.random() * 6) | 0;
    b = (1 + Math.random() * 6) | 0;
    dice(a, b);
    await sleep(160);
  }
  say(`🎲 ${P[cur].n} melempar ${a} + ${b} = ${a + b}`);
  await sleep(700);
  return [a, b];
}
async function core(p) {
  let dbl = 0;
  if (p.jail >= 0) {
    if (isPol(p)) {
      bayarGaji(p, " (gaji tetap saat di penjara)");
      render();
    }
    const c = await ask(`<h3>⛓️ Di Penjara</h3><p>Percobaan ${p.jail}/3. Denda keluar Rp500.000. ${isPol(p) ? "Gajimu tetap cair selama di penjara." : "Tidak ada gaji selama di penjara."}</p>`, [
      ["Bayar denda", "p", p.cash < 5e5],
      ["Lempar kembar", "r"],
      ...(p.cards ? [["Pakai kartu bebas", "k"]] : []),
    ]);
    if (c == "p") {
      p.cash -= 5e5;
      p.jail = -1;
      render();
    } else if (c == "k") {
      p.cards--;
      dk.c.push(["Kartu Bebas dari Penjara (disimpan)", "f"]);
      p.jail = -1;
      render();
    } else {
      const [a, b] = await rollDice();
      if (a == b) {
        p.jail = -1;
        say(`${p.n} kembar! Keluar penjara`);
        await move(p, a + b);
        await land(p, a + b);
      } else if (++p.jail >= 3) {
        say(`${p.n} wajib bayar denda`);
        if (await pay(p, 5e5)) {
          p.jail = -1;
          await move(p, a + b);
          await land(p, a + b);
        }
      }
      return;
    }
  }
  for (;;) {
    const [a, b] = await rollDice();
    if (a == b && ++dbl == 3) {
      await ask("<h3>Kembar 3×!</h3><p>Terlalu beruntung. Masuk penjara.</p>", [["OK", 1]]);
      jail(p);
      return;
    }
    await move(p, a + b);
    await land(p, a + b);
    if (p.x || p.jail >= 0 || a != b) return;
    say(`${p.n} kembar, lempar lagi!`);
  }
}
async function game() {
  if (!RESUME) {
    const n = await ask(
      '<h3>Simulator Indonesia</h3><div class="sub">Siapa saja yang main?</div><div class="sec"><h4>Cara cepat</h4><div class="rw"><span>🎲 Lempar dadu</span><b>Spasi / tombol merah</b></div><div class="rw"><span>🔎 Lihat harga sewa</span><b>Ketuk petak</b></div><div class="rw"><span>🏠 Bangun &amp; gadai</span><b>Tombol Aset</b></div></div><p>Pilih jumlah pemain:</p>',
      [
        ["2", 2],
        ["3", 3],
        ["4", 4],
      ],
    );
    const lv = await ask(
      `<h3>Tingkat Kesulitan</h3>`,
      LVL.map((l, i) => [l.i + " " + l.n, i]),
    );
    LV = LVL[lv];
    await setupRules();
    const TK = [
      [pin("#d62b1f", 1), "#d62b1f"],
      [pin("#1fb25a", 2), "#1fb25a"],
      [pin("#e08a00", 3), "#e08a00"],
      [pin("#0072bb", 4), "#0072bb"],
    ];
    await ask(
      "<h3>Nama Pemain</h3>" +
        TK.slice(0, n)
          .map(
            (t, i) =>
              `<div class="sr"><span>${t[0]}</span><input value="${i ? ["", "Budi", "Siti", "Andi"][i] : "Pemain 1"}" maxlength="12" aria-label="Nama pemain ${i + 1}"><select aria-label="Jenis pemain ${i + 1}"><option value="0">Manusia</option><option value="1"${i ? " selected" : ""}>Bot</option></select></div>`,
          )
          .join(""),
      [["Mulai Main", 1]],
    );
    mod
      .querySelectorAll(".sr")
      .forEach((r, i) => P.push({ id: i, b: +r.querySelector("select").value, n: cleanName(r.querySelector("input").value) || "Pemain " + (i + 1), k: TK[i][0], c: TK[i][1], cash: SET.cash, pos: 0, jail: -1, cards: 0, x: 0, loans: [] }));
    say("Permainan dimulai! Tap petak untuk melihat harga sewa.");
    dice(1, 1);
    rplReset();
    rplSnap();
  } else {
    restore(RESUME);
    say("▶️ Permainan dilanjutkan dari putaran " + rnd);
    dice(1, 1);
    if (!RPL.s.length) rplSnap();
  }
  while (!END && P.filter((x) => !x.x).length > 1) {
    const p = P[cur];
    save();
    if (!p.x && p.sk) {
      p.sk = 0;
      render();
      say(`⏭️ ${p.n} dilewati (Skip)`);
      await ask("<h3>⏭️ Giliran Dilewati</h3><p>" + p.n + " terkena Skip.</p>", [["OK", 1]], p);
    } else if (!p.x) {
      render();
      await cicil(p);
      if (!p.x && p.dr) {
        const n = p.dr;
        p.dr = 0;
        for (let k = 0; k < n && !p.x && p.jail < 0; k++) await draw(p, "c", 7);
      }
      if (!p.x && isP(p) && p.b && !PRES.used) await kebijakan(p, 1);
      if (!p.x && R(p).pt) {
        p.cash += R(p).pt;
        say(`${R(p).i} ${p.n} menerima penghasilan ${fm(R(p).pt)}`);
        render();
      }
      if (!p.x && p.b) await botOffer(p);
      if (!p.x) await core(p);
      if (!p.x) {
        render();
        await wait("Akhiri Giliran ➜");
      }
    }
    if (p.xt && !p.x) {
      p.xt = 0;
      continue;
    }
    cur = (cur + DIR + P.length) % P.length;
    if (!cur) {
      rnd++;
      if (SET.rl && rnd > SET.rl) {
        say(`⏰ Batas ${SET.rl} putaran tercapai`);
        END = P.filter((x) => !x.x).reduce((a, b) => (nw(b) > nw(a) ? b : a));
        break;
      }
      if (rnd == 3) await assignRoles();
      PRES.used = 0;
      PRES.offer = null;
      if (PRES.biT && !--PRES.biT) PRES.bi = 1;
      kdPresTick();
      if ((rnd - 1) % 5 == 0 && P.filter((x) => !x.x).length > 1) await election();
      if (ECO.d && !--ECO.d) ECO = BASE;
      if (rnd >= 2) await news();
      if (KD_MAX) await kopdesPutaran();
      await fzUpdate();
      if (P.filter((x) => !x.x).length > 1) {
        await krisis();
        if (P.filter((x) => !x.x).length > 1) await polisi();
      }
      render();
      rplSnap();
    }
  }
  rplSnap(1);
  const w = END || P.find((x) => !x.x);
  render();
  clearSave();
  await summary(w);
  location.reload();
}
