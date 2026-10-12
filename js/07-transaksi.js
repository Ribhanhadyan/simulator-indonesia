      let TR = {};
      const ids = (p) =>
        Object.keys(own)
          .map(Number)
          .filter((i) => own[i].o == p.id && !own[i].h && !own[i].mb && !own[i].kd);
      const val = (i, w) => {
        const g = grp(i),
          m = g.filter((j) => j != i && own[j]?.o == w.id).length;
        return T[i].p * (1 + (g.length > 1 && m == g.length - 1 ? 0.6 : m ? 0.2 : 0));
      };
      const lst = (a, chk = []) =>
        a.length
          ? a.map((i) => `<label class="ck"><input type="checkbox" value="${i}"${chk.includes(i) ? " checked" : ""}> ${gtag(i)}${T[i].n}${own[i].m ? " (gadai)" : ""} · ${sh(T[i].p)}</label>`).join("")
          : "<p>Tidak ada properti yang bisa ditukar (rumah, MBG & Kopdes tidak bisa ditukar).</p>";
      const num = (l, mx) =>
        `<div class="rw"><span>${l}</span><span style="font-size:12px;color:var(--mut)">maks ${fm(mx)}</span></div><div class="stp" data-mx="${mx}"><button type="button" data-s="-1000000">−1 jt</button><button type="button" data-s="-100000">−100 rb</button><b>Rp0</b><button type="button" data-s="100000">+100 rb</button><button type="button" data-s="1000000">+1 jt</button><input type="number" min="0" value="0" hidden></div>`;
      const stepper = (e) => {
        const b = e.target.closest("button[data-s]");
        if (!b) return;
        const w = b.closest(".stp"),
          i = w.querySelector("input"),
          v = Math.max(0, Math.min(+w.dataset.mx, (+i.value || 0) + +b.dataset.s));
        i.value = v;
        w.querySelector("b").textContent = fm(v);
      };
      const sm = (a, c) =>
        a
          .map((i) => gtag(i) + T[i].n)
          .concat(c ? [fm(c)] : [])
          .join(", ") || "tidak ada";
      function swap(p, q, gi, gc, ti, tc) {
        gi.forEach((i) => (own[i].o = q.id));
        ti.forEach((i) => (own[i].o = p.id));
        p.cash += tc - gc;
        q.cash += gc - tc;
        say(`🤝 ${p.n} ⇄ ${q.n}: ${sm(gi, gc)} ↔ ${sm(ti, tc)}`);
        render();
      }
      async function offer(p, q, gi, gc, ti, tc) {
        TR = { gi, gc, ti, tc };
        const c = await ask(
          `<h3>🤝 Tawaran Dagang</h3><div class="sub">${p.n} → ${q.n}</div>${sec(q.n + " menerima", `<p class="ct">${sm(gi, gc)}</p>`)}${sec(q.n + " menyerahkan", `<p class="ct">${sm(ti, tc)}</p>`)}`,
          [
            ["Terima", 1],
            ["Tolak", 0],
          ],
          q.b ? q : {},
        );
        if (c && p.cash >= gc && q.cash >= tc) {
          swap(p, q, gi, gc, ti, tc);
          return 1;
        }
        say(`🤝 ${q.n} menolak tawaran ${p.n}`);
        return 0;
      }
      async function trade(p, pq, pi) {
        const qs = P.filter((x) => !x.x && x != p);
        if (!qs.length) return;
        let q = pq || qs[0];
        if (!pq && qs.length > 1) {
          const c = await ask("<h3>🤝 Dagang</h3><p>Pilih mitra dagang</p>", qs.map((x) => [x.n, x.id]).concat([["Batal", -1]]), {});
          if (c < 0) return;
          q = P[c];
        }
        const pr = ask(
          `<h3>🤝 Dagang dengan ${q.n}</h3>${sec("Kamu tawarkan", lst(ids(p)) + num("Tambah uang dari kamu", p.cash))}${sec("Kamu minta", lst(ids(q), pi == null ? [] : [pi]) + num("Minta uang dari " + q.n, q.cash))}`,
          [
            ["Ajukan", 1],
            ["Batal", 0],
          ],
          {},
        );
        mod.onclick = stepper;
        const c = await pr;
        mod.onclick = null;
        if (!c) return;
        const S = mod.querySelectorAll(".sec"),
          rd = (s) => [[...s.querySelectorAll("input:checked")].map((x) => +x.value), Math.max(0, Math.round(+s.querySelector("input[type=number]").value || 0))],
          [gi, gc] = rd(S[0]),
          [ti, tc] = rd(S[1]);
        if (!gi.length && !ti.length && !gc && !tc) return;
        if ([...gi, ...ti].some((i) => own[i]?.kd)) {
          await ask("<h3>Tidak bisa</h3><p>Properti ber-Kopdes tidak bisa didagangkan.</p>", [["OK", 1]], {});
          return;
        }
        if (gc > p.cash || tc > q.cash) {
          await ask("<h3>Tidak bisa</h3><p>Uang tidak cukup untuk tawaran ini.</p>", [["OK", 1]], {});
          return;
        }
        await offer(p, q, gi, gc, ti, tc);
      }
      async function botOffer(p) {
        const hs = P.filter((x) => !x.x && !x.b);
        if (!hs.length || Math.random() > 0.35) return;
        let best = null;
        for (const q of hs)
          for (const i of ids(q)) {
            const g = grp(i),
              m = g.filter((j) => own[j]?.o == p.id).length;
            if (g.length > 1 && m == g.length - 1 && (!best || T[i].p > T[best.i].p)) best = { i, q };
          }
        if (!best) {
          const q = hs[(Math.random() * hs.length) | 0],
            a = ids(q);
          if (!a.length) return;
          best = { i: a[(Math.random() * a.length) | 0], q };
        }
        const i = best.i,
          j = ids(p).find((x) => T[x].t == "s" && grp(x).filter((y) => y != x && own[y]?.o == p.id).length == 0),
          gc = Math.max(0, Math.round((1.3 * T[i].p - (j !== undefined ? T[j].p : 0)) / 1e5) * 1e5);
        if (p.cash - gc < 2e6) return;
        await offer(p, best.q, j !== undefined ? [j] : [], gc, [i], 0);
      }
      async function cicil(p) {
        if (!p.loans.length) return;
        const L = p.loans.map((l) => ({ l, b: p.nb ? 0 : Math.round((l.pr * l.r * ECO.bi * (PRES.bi || 1) * R(p).bi) / 1e3) * 1e3, k: Math.min(Math.ceil(l.pr / Math.max(1, l.n) / 1e3) * 1e3, l.pr) })),
          tot = L.reduce((a, x) => a + x.b + x.k, 0);
        await ask(
          `<h3>🏦 Cicilan Bank</h3><div class="sub">Tagihan awal giliran</div>${sec("Rincian", L.map((x, i) => rw("Pinjaman " + (i + 1) + " · pokok " + fm(x.k), "bunga " + fm(x.b))).join(""))}${sec("Total", rw("Bayar sekarang", fm(tot)))}`,
          [["Bayar", 1]],
        );
        let late = 0;
        while (p.cash < tot && !late) {
          const c = await ask(
            `<h3>⚠️ Tidak Mampu Bayar</h3>${sec("Tagihan", rw("Cicilan + bunga", fm(tot)) + rw("Uangmu", fm(p.cash)))}${sec("Jika ditunda", "<p>Bunga yang belum dibayar plus denda 10% masuk ke utang. Jika sampai jatuh tempo masih ada sisa utang, kamu bangkrut.</p>")}`,
            [
              ["Kelola Aset", "m"],
              ["🏦 Pinjam ke Bank", "l"],
              ["Tunda (kena denda)", "t"],
            ],
            p,
          );
          if (c == "m") {
            if (p.b) {
              loanFor(p, tot);
              liq(p, tot);
            } else await manage(p);
          } else if (c == "l") await bank(p);
          else late = 1;
        }
        if (late) {
          L.forEach((x) => {
            const l = x.l;
            if (!p.loans.includes(l)) return;
            l.pr += x.b + Math.round(((x.k + x.b) * 0.1) / 1e3) * 1e3;
            l.n--;
            l.t = (l.t || 0) + 1;
          });
          say(`⚠️ ${p.n} menunggak cicilan, kena denda`);
          if (p.loans.some((l) => l.n <= 0)) {
            await ask("<h3>💥 Gagal Bayar Utang</h3><p>Utang jatuh tempo dan belum lunas. Aset disita bank.</p>", [["OK", 1]], p);
            bankrupt(p, 0);
            return;
          }
          render();
          return;
        }
        if (await pay(p, tot, 0, 1)) {
          p.nb = 0;
          L.forEach((x) => {
            if (p.loans.includes(x.l)) {
              x.l.pr -= x.k;
              x.l.n--;
              x.l.t = 0;
            }
          });
          p.loans = p.loans.filter((l) => l.pr > 0);
          say(`🏦 ${p.n} bayar cicilan ${fm(tot)}`);
          render();
        }
      }
      async function pay(p, amt, to, nb) {
        while (p.cash < amt) {
          const c = await ask(
            `<h3>Uang tidak cukup!</h3><p>Kamu harus membayar ${fm(amt)} (uangmu ${fm(p.cash)}). Gadaikan properti, jual rumah, atau menyerah.</p>`,
            [
              ["Kelola Aset", "m"],
              ["🏦 Pinjam ke Bank", "l"],
              ["Menyerah", "b"],
            ],
            p,
          );
          if (c == "m") {
            if (p.b) {
              loanFor(p, amt);
              liq(p, amt);
            } else await manage(p);
          } else if (c == "l") await bank(p);
          else {
            bankrupt(p, to);
            return false;
          }
        }
        p.cash -= amt;
        if (to) to.cash += amt;
        else if (!nb) {
          const pr = P[PRES.id];
          if (pr && !pr.x && pr !== p) {
            const c = Math.round((amt * 0.2 * fzEff()) / 1e3) * 1e3;
            pr.cash += c;
            POOL += amt - c;
          } else POOL += amt;
        }
        render();
        return true;
      }
      function bankrupt(p, to) {
        if (PRES.id === p.id) {
          PRES.id = -1;
          PRES.t = 0;
        }
        say(`💥 ${p.n} bangkrut!`);
        for (const i in own)
          if (own[i].o == p.id) {
            if (to) {
              own[i].o = to.id;
              own[i].h = 0;
              own[i].mb = 0;
            } else delete own[i];
          }
        if (to) {
          to.cash += p.cash;
          to.cards += p.cards;
        }
        p.cash = 0;
        p.cards = 0;
        p.x = 1;
        render();
      }
      const NEG = 99,
        hcs = (t) => (t.g ? G[t.g][1] * K : 0),
        mine = (p) =>
          Object.keys(own)
            .map(Number)
            .filter((i) => own[i].o == p.id),
        worth = (i) => T[i].p + own[i].h * hcs(T[i]) + (own[i].mb || 0) * MBG_COST,
        nneg = () => Object.keys(own).filter((i) => own[i].o == NEG).length,
        OW = (o) => (o.o == NEG ? "🏛️ Negara (APBN)" : P[o.o].k + " " + P[o.o].n);
      function toNeg(i) {
        const o = own[i];
        stat(o.o, "taken", 1);
        o.o = NEG;
        o.m = 0;
        o.mb = 0;
      }
      async function paksa(p, why) {
        const a = mine(p);
        if (!a.length) {
          say(`🏗️ ${p.n} tidak punya properti, aman dari pembelian paksa`);
          return;
        }
        const i = a[(Math.random() * a.length) | 0],
          t = T[i],
          o = own[i],
          bg = o.h * hcs(t) + (o.mb || 0) * MBG_COST,
          c = Math.round((t.p * 1.25 - (o.m ? t.p / 2 : 0) + bg) / 1e3) * 1e3;
        await nt(
          `<h3>🏗️ Pembelian Paksa Negara</h3><div class="sub">${p.n}</div>${sec("Kejadian", '<p class="ct">' + why + ": lahan <b>" + t.n + "</b> dibebaskan untuk kepentingan umum.</p>")}${sec("Ganti rugi", rw("Harga ×1,25", fm(t.p * 1.25)) + (o.m ? rw("Dikurangi gadai", "−" + fm(t.p / 2)) : "") + (bg ? rw("Nilai bangunan", fm(bg)) : "") + rw("Diterima " + p.n, fm(c)))}${sec("Setelah itu", '<p class="ct">Properti jadi aset negara. Sewanya masuk Dana APBN.</p>')}`,
          p,
        );
        p.cash += c;
        toNeg(i);
        say(`🏗️ Negara membeli paksa ${t.n} milik ${p.n} (ganti rugi ${fm(c)})`);
        render();
      }
      async function sita(p, why) {
        const a = mine(p).sort((x, y) => worth(y) - worth(x));
        if (!a.length) {
          say(`⚖️ ${p.n} tidak punya properti untuk disita`);
          return;
        }
        const i = a[0],
          t = T[i],
          o = own[i];
        await nt(
          `<h3>⚖️ Penyitaan Aset Negara</h3><div class="sub">${p.n}</div>${sec("Kejadian", '<p class="ct">' + why + ".</p>")}${sec("Disita", rw(t.n, fm(worth(i))) + rw("Ganti rugi", "tidak ada"))}${sec("Setelah itu", '<p class="ct">Properti jadi aset negara. Sewanya masuk Dana APBN.</p>')}`,
          p,
        );
        toNeg(i);
        say(`⚖️ Negara menyita ${t.n} milik ${p.n}`);
        render();
      }
      async function negara(k) {
        const c = P.filter((x) => !x.x && mine(x).length);
        if (!c.length) {
          say("🏛️ Negara tidak menemukan aset yang bisa diambil");
          return;
        }
        if (k == "z") await paksa(c[(Math.random() * c.length) | 0], "Proyek Strategis Nasional (jalan tol & bendungan)");
        else
          await sita(
            c.reduce((a, b) => (mine(b).length > mine(a).length || (mine(b).length == mine(a).length && ast(b) > ast(a)) ? b : a)),
            "Satgas BLBI memburu aset pengemplang pajak",
          );
      }
      const LVL = [
        { n: "Santai", i: "🌴", st: 10, ev: 4, inf: 0.08, go: 0.06, pbb: 0.01, pe: 3, pm: 2 },
        { n: "Sedang", i: "⚖️", st: 8, ev: 3, inf: 0.1, go: 0.08, pbb: 0.02, pe: 2, pm: 3 },
        { n: "Kejam", i: "💀", st: 5, ev: 2, inf: 0.15, go: 0.1, pbb: 0.03, pe: 1, pm: 4 },
      ];
      let LV = LVL[1],
        LS = 0;
      const crS = () => (SET.cr && rnd >= LV.st ? Math.floor((rnd - LV.st) / LV.ev) + 1 : 0),
        crM = () => Math.pow(1 + LV.inf, crS()),
        crG = () => Math.max(0.25, 1 - LV.go * crS()),
        fx = (n) => (+n.toFixed(2)).toString().replace(".", ","),
        lvd = (l) =>
          `Krisis mulai putaran ${l.st}, tahap baru tiap ${l.ev} putaran. Sewa & pajak +${Math.round(l.inf * 100)}% per tahap, gaji MULAI −${Math.round(l.go * 100)}% per tahap, PBB ${Math.round(l.pbb * 100)}% × tahap dari nilai properti. Pion OTT +1 tiap ${l.pe} tahap (maks ${l.pm} pion).`;
      async function krisis() {
        const s = crS();
        if (s <= LS) return;
        LS = s;
        const want = Math.min(LV.pm, 1 + Math.floor(s / LV.pe));
        let add = 0;
        while (POLS.length < want) {
          POLS.push({ pos: (POLS[POLS.length - 1].pos + 13) % NN, k: pin("#1a237e", "👮") });
          add++;
        }
        await nt(
          `<h3>📉 Krisis Ekonomi: Tahap ${s}</h3><div class="sub">Level ${LV.i} ${LV.n}</div>${sec("Dampak", rw("Sewa & pajak", "×" + fx(crM())) + rw("Gaji MULAI", "×" + fx(crG())) + rw("PBB (pajak properti)", Math.round(LV.pbb * s * 100) + "% nilai properti"))}${add ? sec("Penegakan hukum", '<p class="ct">' + add + " pion OTT baru diterjunkan. Total " + POLS.length + " pion.</p>") : ""}`,
        );
        say(`📉 Krisis ekonomi tahap ${s}: sewa ×${fx(crM())}, gaji ×${fx(crG())}${add ? ", pion OTT jadi " + POLS.length : ""}`);
        render();
        for (const q of P.filter((x) => !x.x)) {
          if (q.x || P.filter((x) => !x.x).length < 2) break;
          const a = Math.round((ast(q) * LV.pbb * s) / 1e4) * 1e4;
          if (a > 0) {
            say(`🏛️ ${q.n} bayar PBB ${fm(a)}`);
            await pay(q, a);
          }
        }
        render();
      }
