/* ===== REPLAY CEPAT + TITIK BALIK =====
   Rekaman: tiap awal putaran (dan saat game selesai) disimpan 1 snapshot ringkas per pemain.
   Replay memutar grafik kekayaan bersih. Perubahan nasib mendadak (titik balik) dideteksi dari selisih
   dua snapshot berurutan; replay berhenti sesaat dan menunggu konfirmasi "Lanjut". */
let RPL = { s: [] };
let RPLB = []; /* log kejadian sejak snapshot terakhir (diisi oleh say()) */
const RPL_MAX = 400;

function rplReset() {
  RPL = { s: [] };
  RPLB = [];
}
function rplSnap(fin) {
  if (!P.length) return;
  const s = {
    r: rnd,
    f: fin ? 1 : 0,
    pr: typeof PRES.id == "number" ? PRES.id : -1,
    d: P.map((p) => ({ id: p.id, nw: Math.round(nw(p)), c: Math.round(p.cash), n: mine(p).length, j: p.jail >= 0 ? 1 : 0, x: p.x ? 1 : 0 })),
    l: RPLB.slice(-14).map((t) => String(t).slice(0, 120)),
  };
  RPLB = [];
  const last = RPL.s[RPL.s.length - 1];
  if (last && last.r == s.r && (fin || last.f)) RPL.s[RPL.s.length - 1] = s;
  else RPL.s.push(s);
  if (RPL.s.length > RPL_MAX) RPL.s.shift();
}

/* ---------- deteksi titik balik ---------- */
function rplTurning() {
  const S = RPL.s,
    U = SET.cash || 15e6,
    out = [];
  const lead = (s) => s.d.filter((x) => !x.x).reduce((a, b) => (!a || b.nw > a.nw ? b : a), null);
  for (let i = 1; i < S.length; i++) {
    const a = S[i - 1],
      b = S[i],
      L0 = lead(a),
      L1 = lead(b);
    for (const y of b.d) {
      const x = a.d.find((z) => z.id == y.id);
      if (!x || !P[y.id]) continue;
      const R = [];
      if (!x.x && y.x) R.push(["💥", "Bangkrut", "bad", 3]);
      if (!x.x && !y.x) {
        const dv = y.nw - x.nw,
          base = Math.max(Math.abs(x.nw), U * 0.3);
        if (dv <= -0.35 * base && -dv >= 0.3 * U) R.push(["📉", "Kekayaan anjlok " + Math.round((-dv / base) * 100) + "% (" + fm(-dv) + ")", "bad", 2]);
        else if (dv >= 0.45 * base && dv >= 0.4 * U) R.push(["📈", "Kekayaan melonjak " + Math.round((dv / base) * 100) + "% (" + fm(dv) + ")", "ok", 2]);
        if (!x.j && y.j) R.push(["🚔", "Masuk penjara", "bad", 1]);
        if (x.n - y.n >= 2) R.push(["🏚️", "Kehilangan " + (x.n - y.n) + " properti", "bad", 2]);
        else if (y.n - x.n >= 3) R.push(["🏘️", "Menambah " + (y.n - x.n) + " properti sekaligus", "ok", 1]);
        if (L0 && L1 && L1.id == y.id && L0.id != y.id) R.push(["👑", "Menjadi pemain terkaya, menyalip " + P[L0.id].n, "ok", 2]);
      }
      if (b.pr == y.id && a.pr != y.id) R.push(["🏛️", "Terpilih menjadi Presiden", "ok", 3]);
      if (a.pr == y.id && b.pr != y.id) R.push(["🏛️", "Lengser dari kursi Presiden", "bad", 2]);
      if (R.length) {
        const nm = P[y.id].n,
          ln = b.l.filter((t) => t.includes(nm)).slice(0, 4);
        out.push({ i, id: y.id, R, ln, w: Math.max(...R.map((q) => q[3])) });
      }
    }
  }
  return out;
}

/* ---------- tampilan ---------- */
let rplOpenNow = 0;
function rplOpen() {
  if (rplOpenNow) return Promise.resolve();
  const S = RPL.s;
  rplOpenNow = 1;
  return new Promise((done) => {
    const root = document.createElement("div");
    root.id = "rpl";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Replay cepat");
    root.innerHTML =
      '<div class="rp-box"><div class="rp-h"><b>🎞️ Replay Cepat</b><span class="rp-r"></span><button type="button" class="rp-x" aria-label="Tutup replay">✕</button></div>' +
      '<div class="rp-ch"></div><div class="rp-lg"></div><div class="rp-tp" hidden></div>' +
      '<div class="rp-ct"><button type="button" class="rp-b" data-k="re" title="Ulang dari awal">⏮</button><button type="button" class="rp-b rp-play" data-k="pl">▶</button>' +
      '<button type="button" class="rp-b" data-k="sp">2×</button><label class="rp-ck"><input type="checkbox" checked> Jeda di titik balik</label></div>' +
      '<input class="rp-sc" type="range" min="0" value="0" aria-label="Posisi replay"></div>';
    document.body.appendChild(root);
    const $r = (s) => root.querySelector(s),
      box = $r(".rp-ch"),
      lg = $r(".rp-lg"),
      tpEl = $r(".rp-tp"),
      sc = $r(".rp-sc"),
      play = $r(".rp-play"),
      spB = $r('[data-k="sp"]'),
      ck = $r(".rp-ck input");
    const TP = rplTurning(),
      SPD = [1, 2, 4],
      N = S.length;
    let idx = 0,
      sp = 1,
      playing = 0,
      timer = 0,
      queue = [],
      seen = -1,
      cardOpen = 0;
    sc.max = Math.max(0, N - 1);
    const vals = S.flatMap((s) => s.d.filter((x) => !x.x || 1).map((x) => x.nw)),
      lo = Math.min(0, ...vals),
      hi = Math.max(1, ...vals),
      W = 360,
      H = 210,
      L = 40,
      Rr = 10,
      T = 12,
      B = 22;
    const X = (i) => L + (N > 1 ? (i / (N - 1)) * (W - L - Rr) : 0),
      Y = (v) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
    const dead = (id, i) => {
      const k = S.findIndex((s) => s.d.find((z) => z.id == id && z.x));
      return k >= 0 && i >= k ? k : -1;
    };
    const draw = () => {
      let g = "";
      for (let k = 0; k <= 4; k++) {
        const v = lo + ((hi - lo) * k) / 4,
          y = Y(v);
        g += `<line x1="${L}" x2="${W - Rr}" y1="${y}" y2="${y}" class="gl"/><text x="${L - 4}" y="${y + 3}" class="ax" text-anchor="end">${Math.abs(v) >= 1e6 ? Math.round(v / 1e5) / 10 + "jt" : Math.round(v / 1e3) + "rb"}</text>`;
      }
      const step = Math.max(1, Math.ceil(N / 8));
      for (let i = 0; i < N; i += step) g += `<text x="${X(i)}" y="${H - 6}" class="ax" text-anchor="middle">${S[i].r}</text>`;
      P.forEach((p) => {
        const dk = dead(p.id, idx),
          end = dk >= 0 ? dk : idx;
        let pts = "";
        for (let i = 0; i <= end; i++) {
          const d = S[i].d.find((z) => z.id == p.id);
          if (d) pts += X(i) + "," + Y(d.nw) + " ";
        }
        g += `<polyline points="${pts}" fill="none" stroke="${p.c}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
        const d = S[end].d.find((z) => z.id == p.id);
        if (d) g += `<circle cx="${X(end)}" cy="${Y(d.nw)}" r="${dk >= 0 ? 4 : 3.4}" fill="${dk >= 0 ? "#111" : p.c}" stroke="#fff" stroke-width="1.5"/>`;
      });
      TP.filter((t) => t.i <= idx).forEach((t) => {
        const d = S[t.i].d.find((z) => z.id == t.id);
        if (d) g += `<circle cx="${X(t.i)}" cy="${Y(d.nw)}" r="${t.w >= 3 ? 5.5 : 4.5}" fill="none" stroke="${P[t.id].c}" stroke-width="2" class="tpm"/>`;
      });
      g += `<line x1="${X(idx)}" x2="${X(idx)}" y1="${T}" y2="${H - B}" class="ph"/>`;
      box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik kekayaan bersih per putaran">${g}</svg>`;
      const rk = [...S[idx].d].sort((a, b) => a.x - b.x || b.nw - a.nw);
      lg.innerHTML = rk
        .map((d, i) => `<div class="rp-l${d.x ? " off" : ""}"><i style="background:${P[d.id].c}"></i><span>${i + 1}. ${P[d.id].n}${S[idx].pr == d.id ? " 🏛️" : ""}${d.j ? " 🚔" : ""}</span><b>${d.x ? "bangkrut" : fm(d.nw)}</b></div>`)
        .join("");
      $r(".rp-r").textContent = (S[idx].f ? "Akhir · putaran " : "Putaran ") + S[idx].r + " (" + (idx + 1) + "/" + N + ")";
      sc.value = idx;
    };
    const setPlay = (on) => {
      playing = on;
      play.textContent = on ? "⏸" : "▶";
      clearTimeout(timer);
      if (on) timer = setTimeout(tick, 650 / sp);
    };
    const showCard = () => {
      const t = queue[0];
      if (!t) {
        cardOpen = 0;
        tpEl.hidden = true;
        if (playing) setPlay(1);
        return;
      }
      cardOpen = 1;
      clearTimeout(timer);
      const p = P[t.id];
      tpEl.hidden = false;
      tpEl.innerHTML =
        `<div class="rp-th"><i style="background:${p.c}"></i><b>Titik balik · ${p.n}</b><span>putaran ${S[t.i].r}</span></div>` +
        t.R.map((q) => `<div class="rp-ev ${q[2]}">${q[0]} ${q[1]}</div>`).join("") +
        (t.ln.length ? '<ul class="rp-ln">' + t.ln.map((x) => "<li>" + x + "</li>").join("") + "</ul>" : "") +
        `<div class="rp-ac"><button type="button" class="rp-go">Lanjut ▶</button>${queue.length > 1 ? `<button type="button" class="rp-sk">Lewati semua (${queue.length})</button>` : ""}</div>`;
      tpEl.querySelector(".rp-go").onclick = () => {
        queue.shift();
        showCard();
      };
      const sk = tpEl.querySelector(".rp-sk");
      if (sk)
        sk.onclick = () => {
          queue = [];
          showCard();
        };
      tpEl.querySelector(".rp-go").focus();
    };
    const arrive = () => {
      draw();
      if (idx > seen) {
        seen = idx;
        if (ck.checked) {
          queue = TP.filter((t) => t.i == idx).sort((a, b) => b.w - a.w);
          if (queue.length) showCard();
        }
      }
    };
    const tick = () => {
      if (cardOpen) return;
      if (idx >= N - 1) return setPlay(0);
      idx++;
      arrive();
      if (playing && !cardOpen) timer = setTimeout(tick, 650 / sp);
      if (idx >= N - 1 && !cardOpen) setPlay(0);
    };
    const close = () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", key, true);
      root.remove();
      rplOpenNow = 0;
      done();
    };
    const key = (e) => {
      if (e.key == "Tab" || e.key == "Enter") return;
      e.stopPropagation(); /* tombol pintas permainan tidak boleh bocor saat replay terbuka */
      const onCtl = e.target.closest && e.target.closest("button,input");
      if (e.key == "Escape") close();
      else if (e.key == " " && !onCtl) {
        e.preventDefault();
        if (!cardOpen) setPlay(!playing);
      } else if (e.key == "ArrowRight" && !onCtl && !cardOpen && idx < N - 1) {
        e.preventDefault();
        setPlay(0);
        idx++;
        seen = Math.max(seen, idx);
        draw();
      } else if (e.key == "ArrowLeft" && !onCtl && !cardOpen && idx > 0) {
        e.preventDefault();
        setPlay(0);
        idx--;
        draw();
      }
    };
    document.addEventListener("keydown", key, true);
    $r(".rp-x").onclick = close;
    root.addEventListener("click", (e) => {
      if (e.target === root) close();
    });
    $r('[data-k="re"]').onclick = () => {
      idx = 0;
      seen = 0;
      queue = [];
      cardOpen = 0;
      tpEl.hidden = true;
      draw();
      setPlay(1);
    };
    play.onclick = () => {
      if (cardOpen) return;
      if (idx >= N - 1) {
        idx = 0;
        seen = 0;
      }
      setPlay(!playing);
    };
    spB.onclick = () => {
      sp = SPD[(SPD.indexOf(sp) + 1) % SPD.length];
      spB.textContent = sp + "×";
      if (playing && !cardOpen) setPlay(1);
    };
    sc.oninput = () => {
      setPlay(0);
      queue = [];
      cardOpen = 0;
      tpEl.hidden = true;
      idx = +sc.value;
      seen = Math.max(seen, idx);
      draw();
    };
    if (N < 2) {
      box.innerHTML = '<p class="rp-em">Belum ada rekaman. Replay tersedia setelah putaran pertama selesai.</p>';
      $r(".rp-ct").hidden = sc.hidden = true;
      return;
    }
    draw();
    seen = 0;
    play.focus();
    setPlay(1);
  });
}

/* ---------- tombol menu ---------- */
{
  const b = document.getElementById("rplb");
  if (b)
    b.addEventListener("click", () => {
      const m = document.getElementById("sysmenu"),
        mb = document.getElementById("menuBtn");
      if (m) m.hidden = true;
      if (mb) mb.setAttribute("aria-expanded", "false");
      rplOpen();
    });
                                         }
        
