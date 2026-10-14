/* ===== 20-developer.js: MENU DEVELOPER TERSEMBUNYI (untuk tes kartu & papan) =====
   Tidak ada tombol, menu, atau panduan yang menyebutnya. Cara buka: ketuk logo "SIMULATOR INDONESIA"
   di pojok kiri atas 7 kali berturut-turut dalam 4 detik. Nonaktif otomatis saat mode Online.
   Mengubah isi permainan (peran, kas, posisi), jadi jangan dipakai di permainan sungguhan. */
(() => {
  const TAPS = 7,
    WINDOW_MS = 4000;
  let taps = 0,
    t0 = 0,
    panel = null,
    selP = 0,
    tab = "c",
    note = "";

  document.addEventListener("click", (e) => {
    if (!e.target.closest || !e.target.closest(".brand")) return;
    const now = Date.now();
    if (now - t0 > WINDOW_MS) taps = 0;
    if (!taps) t0 = now;
    if (++taps >= TAPS) {
      taps = 0;
      buka();
    }
  });

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const kiosBuka = () => {
    try {
      return bdBuka();
    } catch (e) {
      return false;
    }
  };

  function css() {
    if (document.getElementById("dev-css")) return;
    const s = document.createElement("style");
    s.id = "dev-css";
    s.textContent = `
#dev{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}
#dev[hidden]{display:none}
#dev .dv{width:100%;max-width:520px;max-height:92%;overflow:auto;background:#14161a;color:#e8e8e8;border-radius:14px 14px 0 0;padding:12px 12px calc(14px + env(safe-area-inset-bottom));font:13px/1.35 ui-monospace,Menlo,Consolas,monospace}
#dev h4{margin:12px 0 6px;font-size:12px;color:#8ab4ff;letter-spacing:.06em;text-transform:uppercase}
#dev .hd{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px}
#dev .st{margin-top:6px;padding:6px 8px;background:#1f2330;border-radius:8px;color:#bcd}
#dev .nt{margin-top:6px;color:#ffd479}
#dev .rw2{display:flex;gap:6px;align-items:center;margin:4px 0;flex-wrap:wrap}
#dev select,#dev input[type=number]{flex:1;min-width:0;padding:7px;border-radius:8px;border:1px solid #3a4052;background:#0e1014;color:#eee;font:inherit}
#dev button{padding:7px 10px;border-radius:8px;border:1px solid #3a4052;background:#252a38;color:#eee;font:inherit;cursor:pointer;text-transform:none;letter-spacing:0}
#dev button.on{background:#2f5fd0;border-color:#2f5fd0}
#dev .cards{display:flex;flex-direction:column;gap:4px;max-height:38vh;overflow:auto}
#dev .cards button{text-align:left}
#dev .cards small{color:#8a93a8;margin-right:6px}
#dev .res{margin-top:6px;white-space:pre-wrap;color:#9fe29f}
#dev .res.bad{color:#ff8a8a}
`;
    document.head.appendChild(s);
  }

  function buka() {
    if (typeof MP !== "undefined" && MP.on) return; /* jangan aktif saat main Online */
    if (!P.length) return; /* belum ada permainan */
    css();
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "dev";
      panel.addEventListener("click", aksi);
      panel.addEventListener("change", aksi);
      document.body.appendChild(panel);
    }
    if (selP >= P.length) selP = 0;
    selP = Math.min(selP, P.length - 1);
    panel.hidden = false;
    gambar();
  }

  function gambar() {
    const p = P[selP],
      deck = tab == "c" ? CH : CC;
    const roleOpts =
      '<option value="-1">— tanpa peran —</option>' +
      ROLES.map((r, i) => `<option value="${i}" ${p.role === i ? "selected" : ""}>${esc(r.n)}</option>`).join("");
    const pOpts = P.map((q, i) => `<option value="${i}" ${i == selP ? "selected" : ""}>${i}: ${esc(q.n)}${q.b ? " (bot)" : ""}</option>`).join("");
    const tiles = T.map((t, i) => `<option value="${i}" ${i == p.pos ? "selected" : ""}>${i}: ${esc(t.n)}</option>`).join("");
    const cards = deck
      .map((c, i) => `<button data-a="kartu" data-i="${i}"><small>${esc(c[1])}</small>${esc(kartuTeks(p, c))}</button>`)
      .join("");
    panel.innerHTML = `<div class="dv">
      <div class="hd"><span>🛠 Developer</span><button data-a="tutup">✕</button></div>
      <div class="st">Putaran ${rnd} · giliran: ${esc(P[cur].n)} · Kios: ${kiosBuka() ? "BUKA" : "TUTUP"} · kas ${esc(p.n)}: ${fm(p.cash)}</div>
      ${note ? `<div class="nt">${esc(note)}</div>` : ""}
      <h4>Pemain yang dites</h4>
      <div class="rw2"><select id="dv-p" data-a="pilihP">${pOpts}</select></div>
      <div class="rw2"><select id="dv-r" data-a="peran">${roleOpts}</select></div>
      <div class="rw2"><input id="dv-k" type="number" value="${Math.round(p.cash)}" step="100000"><button data-a="kas">Set kas</button>
        <button data-a="konsul" class="${p.gk ? "on" : ""}">Konsultasi: ${p.gk ? "ADA" : "tidak"}</button></div>
      <h4>Kartu (tap = tarik untuk pemain ini)</h4>
      <div class="rw2"><button data-a="tab" data-t="c" class="${tab == "c" ? "on" : ""}">Kesempatan (${CH.length})</button>
        <button data-a="tab" data-t="k" class="${tab == "k" ? "on" : ""}">Dana Umum (${CC.length})</button></div>
      <div class="cards">${cards}</div>
      <h4>Papan</h4>
      <div class="rw2"><select id="dv-t">${tiles}</select><button data-a="pindah">Pindah</button></div>
      <div class="rw2"><button data-a="kios" data-v="3">Kios BUKA (putaran 3)</button><button data-a="kios" data-v="1">Kios TUTUP (putaran 1)</button></div>
      <h4>Tes</h4>
      <div class="rw2"><button data-a="cek">Cek konsistensi kartu (semua peran)</button></div>
      <div id="dv-res" class="res"></div>
    </div>`;
  }

  async function picu(i) {
    const p = P[selP],
      deck = tab == "c" ? CH : CC,
      d = dk[tab],
      c = deck[i];
    note = "";
    if (c[1] == "g" && T[c[2]]?.t == "mk" && !kiosBuka()) note = "Kios tutup: kartu ini sengaja dilewati, yang keluar kartu lain (sesuai desain).";
    const k = d.indexOf(c);
    if (k >= 0) d.splice(k, 1);
    d.unshift(c);
    panel.hidden = true;
    try {
      await draw(p, tab, 0);
    } catch (e) {
      note = "Galat: " + e.message;
      console.error(e);
    }
    if (!d.includes(c)) d.push(c); /* kartu "simpan" tidak dikembalikan oleh draw */
    render();
    panel.hidden = false;
    gambar();
  }

  function cek() {
    const bad = [];
    let n = 0;
    for (const r of [undefined, ...ROLES.map((_, i) => i)])
      for (const gk of [0, 1])
        for (const c of [...CH, ...CC].filter((x) => x[1] == "m")) {
          const p = { role: r, gk },
            nom = kartuNom(p, c),
            teks = kartuTeks(p, c),
            sehat = /dokter|sakit|vaksin|kesehatan|BPJS|kecelakaan/i.test(c[0]),
            kes = c[2] < 0 ? cm(p, c[0]) : R(p).cg,
            harap = c[2] < 0 && gk && sehat ? 0 : Math.round((Math.abs(c[2]) * K * kes) / 1e3) * 1e3,
            m = teks.match(/Rp([\d.]+)/),
            tampil = m ? Number(m[1].replace(/\./g, "")) : NaN;
          n++;
          if (nom.amt !== harap || tampil !== harap) bad.push(`"${c[0]}" peran ${R(p).n}: teks ${tampil}, nominal ${nom.amt}, harusnya ${harap}`);
        }
    const gb = [];
    for (const dk2 of [CH, CC])
      for (const c of dk2) if (c[1] == "g" && !(Number.isInteger(c[2]) && c[2] >= 0 && c[2] < T.length)) gb.push(`"${c[0]}" tujuan tidak valid`);
    const all = bad.concat(gb);
    const el = document.getElementById("dv-res");
    el.className = "res" + (all.length ? " bad" : "");
    el.textContent = all.length ? `${all.length} masalah dari ${n} kombinasi:\n` + all.slice(0, 8).join("\n") : `LOLOS ✔ ${n} kombinasi kartu uang + semua tujuan "Maju ke" valid`;
  }

  function aksi(e) {
    const el = e.target.closest("[data-a]");
    if (!el) return;
    const a = el.dataset.a,
      p = P[selP];
    if (e.type == "change" && !(el.tagName == "SELECT")) return;
    if (e.type == "click" && el.tagName == "SELECT") return;
    if (a == "tutup") panel.hidden = true;
    else if (a == "pilihP") {
      selP = +el.value;
      note = "";
      gambar();
    } else if (a == "peran") {
      p.role = +el.value < 0 ? undefined : +el.value;
      render();
      gambar();
    } else if (a == "kas") {
      p.cash = +document.getElementById("dv-k").value || 0;
      render();
      gambar();
    } else if (a == "konsul") {
      p.gk = p.gk ? 0 : 1;
      gambar();
    } else if (a == "tab") {
      tab = el.dataset.t;
      gambar();
    } else if (a == "kartu") picu(+el.dataset.i);
    else if (a == "pindah") {
      p.pos = +document.getElementById("dv-t").value;
      render();
      note = `Pion ${p.n} dipindah ke ${T[p.pos].n} (tanpa efek petak).`;
      gambar();
    } else if (a == "kios") {
      rnd = +el.dataset.v;
      render();
      note = "Putaran dipaksa ke " + rnd + " (hanya untuk tes).";
      gambar();
    } else if (a == "cek") cek();
  }
})();
