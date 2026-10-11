      const GT = { 39: "IKN Nusantara", 32: "Raja Ampat", 26: "Bali", 0: "Mulai" };
      [CH, CC].forEach((d) =>
        d.forEach((c) => {
          if (c[1] == "g") c[2] = T.findIndex((t) => t.n == GT[c[2]]);
        }),
      );
      let DIR = 1,
        ud = [];
      const SET = { cash: 15e6, mbg: 1, cr: 1, rl: 0, bs: 0, sp: 1 },
        ST = {},
        SK = "monopoli-id-save",
        BOTN = ["Seimbang", "Agresif", "Konservatif"],
        SPD = [
          ["Normal", 1],
          ["Lambat", 1.6],
          ["Cepat", 0.5],
          ["Kilat", 0.25],
        ];
      let RESUME = null,
        END = 0;
      const BM = () => [1, 0.4, 2.2][SET.bs || 0],
        nw = (p) => p.cash + ast(p) - p.loans.reduce((a, l) => a + l.pr, 0),
        stat = (id, k, v) => {
          if (id < 0 || id >= NEG) return;
          const o = (ST[id] = ST[id] || {});
          o[k] = (o[k] || 0) + v;
        };
      const sel = (id, lb, o, c) =>
        `<label class="ck" style="display:flex;justify-content:space-between;align-items:center;gap:8px">${lb}<select id="${id}">${o.map(([n, v]) => `<option value="${v}"${v == c ? " selected" : ""}>${n}</option>`).join("")}</select></label>`;
      function save() {
        try {
          localStorage.setItem(SK, JSON.stringify({ v: 1, nn: NN, t: Date.now(), P, own, dk, cur, rnd, POOL, fz: FZ.L, ECO, DIR, ud, lv: LVL.indexOf(LV), LS, PRES, POLS, log, SET, ST, NW }));
        } catch (e) {}
      }
      function clearSave() {
        try {
          localStorage.removeItem(SK);
        } catch (e) {}
      }
      function restore(sv) {
        P.length = 0;
        sv.P.forEach((x) => P.push(x));
        for (const k in own) delete own[k];
        Object.assign(own, sv.own);
        dk.c = sv.dk.c;
        dk.k = sv.dk.k;
        cur = sv.cur;
        rnd = sv.rnd;
        POOL = sv.POOL;
        FZ.L = sv.fz || 0;
        ECO = sv.ECO;
        Object.assign(NW, { bump: 0, last: "", feed: [], hist: [], ph: 0, arc: null, n: {}, cd: 0 }, sv.NW || {});
        DIR = sv.DIR;
        ud = sv.ud || [];
        LV = LVL[sv.lv] || LVL[1];
        LS = sv.LS;
        Object.assign(SET, sv.SET);
        MBG_MAX = SET.mbg ? 1 : 0;
        Object.assign(PRES, sv.PRES);
        POLS.length = 0;
        sv.POLS.forEach((x) => POLS.push({ ...x, k: pin("#1a237e", "👮") }));
        log.length = 0;
        sv.log.forEach((x) => log.push(x));
        for (const k in ST) delete ST[k];
        Object.assign(ST, sv.ST);
        render();
      }
      function boot() {
        let sv = null;
        try {
          sv = JSON.parse(localStorage.getItem(SK));
        } catch (e) {}
        if (sv && sv.v == 1 && sv.nn == NN && sv.P && sv.P.length)
          ask(
            `<h3>Simulator Indonesia</h3>${sec("Permainan tersimpan", rw("Putaran", sv.rnd) + rw("Pemain", sv.P.map((p) => p.n).join(", ")) + rw("Disimpan", new Date(sv.t).toLocaleString("id-ID")))}`,
            [
              ["▶️ Lanjutkan", 1],
              ["🆕 Game Baru", 0],
            ],
            {},
          ).then((c) => {
            if (c) RESUME = sv;
            else clearSave();
            game();
          });
        else game();
      }
      async function setupRules() {
        await ask(
          `<h3>Pengaturan Aturan</h3><div class="sub">Boleh dibiarkan default</div>${sec(
            "Aturan",
            sel(
              "s-cash",
              "Uang awal",
              [
                ["Rp10.000.000", 1e7],
                ["Rp15.000.000 (standar)", 15e6],
                ["Rp25.000.000", 25e6],
              ],
              SET.cash,
            ) +
              sel(
                "s-mbg",
                "🍱 MBG",
                [
                  ["Aktif", 1],
                  ["Nonaktif", 0],
                ],
                SET.mbg,
              ) +
              sel(
                "s-cr",
                "📉 Krisis ekonomi",
                [
                  ["Aktif", 1],
                  ["Nonaktif", 0],
                ],
                SET.cr,
              ) +
              sel(
                "s-rl",
                "⏰ Batas putaran",
                [
                  ["Tanpa batas", 0],
                  ["30 putaran", 30],
                  ["50 putaran", 50],
                  ["80 putaran", 80],
                ],
                SET.rl,
              ) +
              sel(
                "s-bs",
                "🤖 Gaya bot",
                BOTN.map((n, i) => [n, i]),
                SET.bs,
              ) +
              sel("s-sp", "⏱️ Kecepatan animasi", SPD, SET.sp),
          )}${sec("Catatan", "<p>Dengan batas putaran, pemain terkaya (kas + aset − utang) menang. Permainan tersimpan otomatis tiap giliran.</p>")}`,
          [["Lanjut", 1]],
        );
        const v = (i) => +mod.querySelector("#" + i).value;
        Object.assign(SET, { cash: v("s-cash"), mbg: v("s-mbg"), cr: v("s-cr"), rl: v("s-rl"), bs: v("s-bs"), sp: v("s-sp") });
        MBG_MAX = SET.mbg ? 1 : 0;
      }
      async function summary(w) {
        const rk = [...P].sort((a, b) => a.x - b.x || nw(b) - nw(a));
        const body = rk
          .map((p, i) => {
            const s = ST[p.id] || {},
              ps = mine(p),
              bl = ps.reduce((a, j) => a + own[j].h, 0);
            return sec(
              (i ? i + 1 + ". " : "🏆 ") + p.k + " " + p.n + (p.x ? " · bangkrut" : ""),
              rw("Kekayaan bersih", p.x ? "—" : fm(nw(p))) +
                rw("Kas", fm(p.cash)) +
                rw("Properti", ps.length + " (rumah/hotel " + bl + ")") +
                rw("Sewa diterima", fm(s.rent || 0)) +
                rw("Masuk penjara", (s.jail || 0) + "×") +
                rw("Kartu diambil", s.cards || 0) +
                rw("Aset disita/dibeli negara", (s.taken || 0) + "×"),
            );
          })
          .join("");
        await ask(
          `<h3>🏆 ${w.n} Menang!</h3><div class="sub">${END ? "Terkaya setelah " + SET.rl + " putaran" : "Pemain terakhir bertahan"} · putaran ${rnd}</div>${body}${sec("Negara", rw("Dana APBN", fm(POOL)) + rw("Aset negara", nneg() + " properti"))}`,
          [["Main Lagi", 1]],
          {},
        );
      }
      {
        const TH = ["auto", "light", "dark"],
          KT = "monopoli-id-theme";
        let t = 0;
        try {
          t = Math.max(0, TH.indexOf(localStorage.getItem(KT)));
        } catch (e) {}
        const ap = () => {
          const r = document.documentElement;
          if (t) r.dataset.theme = TH[t];
          else delete r.dataset.theme;
          $("#thm").title = "Tema: " + ["otomatis", "terang", "gelap"][t];
          $("#thm").textContent = ["🌓", "☀️", "🌙"][t];
        };
        ap();
        $("#thm").onclick = () => {
          t = (t + 1) % 3;
          try {
            localStorage.setItem(KT, TH[t]);
          } catch (e) {}
          ap();
        };
      }
      $("#stg").onclick = async () => {
        if (!(ov.hidden && P[cur] && !P[cur].b)) return;
        await ask(
          `<h3>⚙️ Pengaturan</h3>${sec("Tampilan", sel("s-sp", "⏱️ Kecepatan animasi", SPD, SET.sp))}${sec("Aturan permainan", rw("Uang awal", fm(SET.cash)) + rw("MBG", SET.mbg ? "Aktif" : "Nonaktif") + rw("Krisis ekonomi", SET.cr ? "Aktif" : "Nonaktif") + rw("Batas putaran", SET.rl ? SET.rl + " putaran" : "Tanpa batas") + rw("Gaya bot", BOTN[SET.bs]))}${sec("Simpanan", "<p>Permainan tersimpan otomatis di awal setiap giliran. Tutup halaman, lalu buka lagi untuk melanjutkan.</p>")}`,
          [["Selesai", 1]],
          {},
        );
        SET.sp = +mod.querySelector("#s-sp").value;
        save();
      };
      const DIV = () => Math.round((4e5 * crG()) / 1e3) * 1e3;
