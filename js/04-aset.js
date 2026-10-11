      function manage(p) {
        return new Promise((res) => {
          const draw = () => {
            const ids = Object.keys(own)
              .filter((i) => own[i].o == p.id)
              .map(Number);
            mod.innerHTML =
              `<h3>Kelola Aset · ${fm(p.cash)}</h3><p>Beli rumah di tanah milikmu mana saja, tanpa perlu mendarat di sana.</p>` +
              (ids.length
                ? ids
                    .map((i) => {
                      const t = T[i],
                        o = own[i],
                        gi = grp(i).map((j) => own[j]),
                        hc = t.g ? Math.round((G[t.g][1] * K * R(p).bd) / 1e3) * 1e3 : 0,
                        st = t.t == "s",
                        hs = gi.filter((x) => x && x.o == p.id).map((x) => x.h);
                      const b = st && !o.m && o.h < 5 && p.cash >= hc && o.h <= Math.min(...hs),
                        s = st && o.h > 0 && o.h >= Math.max(...hs),
                        m = !o.m && !o.mb && hs.every((h) => !h),
                        gb = st && !o.m && (o.mb || 0) < MBG_MAX && p.cash >= MBG_COST,
                        gs = st && o.mb > 0,
                        u = o.m && p.cash >= Math.ceil(t.p * 0.55);
                      return `<div class="mr"><b style="background:${t.g ? G[t.g][0] : "#ddd"};color:${t.g == "lb" || t.g == "yl" || !t.g ? "#111" : "#fff"}">${gtag(i)}${t.n} ${o.h > 4 ? "🏨" : "🏠".repeat(o.h)}${"🍱".repeat(o.mb || 0)}${o.m ? " (digadai)" : ""}</b>${st ? `<button data-a="b" data-i="${i}" ${b ? "" : "disabled"}>+🏠 ${sh(hc)}</button><button data-a="s" data-i="${i}" ${s ? "" : "disabled"}>−🏠 +${sh(hc / 2)}</button><button data-a="g" data-i="${i}" ${gb ? "" : "disabled"}>+🍱 ${sh(MBG_COST)}</button><button data-a="v" data-i="${i}" ${gs ? "" : "disabled"}>−🍱 +${sh(MBG_COST / 2)}</button>` : ""}${o.m ? `<button data-a="u" data-i="${i}" ${u ? "" : "disabled"}>Tebus −${sh(t.p * 0.55)}</button>` : `<button data-a="m" data-i="${i}" ${m ? "" : "disabled"}>Gadai +${sh(t.p / 2)}</button>`}</div>`;
                    })
                    .join("")
                : "<p>Belum punya aset.</p>") +
              cardsSec(p) +
              '<div class="mb"><button data-a="x">Selesai</button></div>';
          };
          draw();
          ov.hidden = false;
          mod.onclick = (e) => {
            const b = e.target.closest("button");
            if (!b) return;
            if (b.dataset.a == "k") {
              cardClick(p, b.dataset.k, res, draw);
              return;
            }
            const a = b.dataset.a,
              i = +b.dataset.i,
              t = T[i],
              o = own[i],
              hc = t?.g ? Math.round((G[t.g][1] * K * R(p).bd) / 1e3) * 1e3 : 0;
            if (a == "x") {
              ov.hidden = true;
              mod.onclick = null;
              render();
              return res();
            }
            if (a == "b") {
              p.cash -= hc;
              o.h++;
            }
            if (a == "g") {
              p.cash -= MBG_COST;
              o.mb = (o.mb || 0) + 1;
            }
            if (a == "v") {
              p.cash += MBG_COST / 2;
              o.mb--;
            }
            if (a == "s") {
              p.cash += hc / 2;
              o.h--;
            }
            if (a == "m") {
              p.cash += t.p / 2;
              o.m = 1;
            }
            if (a == "u") {
              p.cash -= Math.ceil(t.p * 0.55);
              o.m = 0;
            }
            render();
            draw();
          };
        });
      }
      const nmb = (p) =>
        Object.keys(own)
          .filter((i) => own[i].o == p.id)
          .reduce((a, i) => a + (own[i].mb || 0), 0);
      const bayarGaji = (p, ket) => {
        const g = Math.round((ECO.go * R(p).go * (isP(p) ? 1.5 : 1) * crG()) / 1e3) * 1e3,
          t = pph21(g, p);
        p.cash += g - t;
        if (t) toAPBN(t, p);
        say(
          t
            ? `${p.n} menerima gaji ${fm(g)}, dipotong PPh 21 ${fm(t)} (${((t / g) * 100).toFixed(1).replace(".", ",")}%), bersih ${fm(g - t)}${ket}`
            : `${p.n} menerima gaji ${fm(g)}${ket} (${isP(p) ? "Presiden bebas PPh 21" : "di bawah PTKP, bebas PPh 21"})`,
        );
      };
      const gaji = (p) => {
        bayarGaji(p, " (lewat MULAI)");
        if (p.sb) {
          const dv = p.sb * DIV();
          p.cash += dv;
          say(`🏭 ${p.n} menerima dividen BUMN ${fm(dv)}`);
        }
        {
          const m = nmb(p),
            tg = p.mt || 0,
            due = m * MBG_PAY + tg;
          if (due > 0) {
            const bayar = Math.min(due, POOL),
              sisa = due - bayar;
            POOL -= bayar;
            p.cash += bayar;
            p.mt = sisa;
            if (!sisa) say(`🍱 ${p.n} menerima insentif MBG ${fm(bayar)} dari Dana APBN (${m} MBG${tg ? ", termasuk tunggakan " + fm(tg) : ""})`);
            else say(`⚠️ Dana APBN kurang! ${p.n} hanya menerima ${fm(bayar)} dari ${fm(due)} insentif MBG. Sisa ${fm(sisa)} jadi tunggakan negara, dibayar lebih dulu saat APBN terisi dan kamu lewat MULAI lagi`);
          }
        }
        if (R(p).zk)
          P.filter((x) => !x.x && x != p).forEach((q) => {
            const a = Math.min(R(p).zk, q.cash);
            q.cash -= a;
            p.cash += a;
          });
      };
      function pick(p, ok) {
        const a = ok[0],
          l = a[0],
          t = T[CT] || {};
        if (l.startsWith("Beli")) return p.cash - t.p >= (t.t == "s" ? 1.5e6 : 5e5) * BM() ? a : ok[1] || a;
        if (l.startsWith("Suap")) return p.cash - +l.replace(/\D/g, "") >= 2e6 ? a : ok[ok.length - 1];
        if (l.startsWith("Gali")) return p.cash > 4e6 && ok[1] ? ok[1] : a;
        if (l == "Terima") {
          const X = TR,
            iv = X.gi.reduce((s, i) => s + val(i, p), 0) + X.gc,
            out = X.ti.reduce((s, i) => s + val(i, p), 0) * 1.15 + X.tc;
          return iv >= out && p.cash + X.gc - X.tc >= 5e5 ? a : ok[1];
        }
        if (l.startsWith("Tawar")) {
          const nb = +l.replace(/\D/g, "");
          return nb <= t.p * 0.95 && p.cash - nb >= 1e6 ? a : ok[1];
        }
        if (a[1] == "p" || a[1] == "r") return ok.find((b) => b[1] == "k") || (a[1] == "p" && p.cash > 6e6 ? a : ok.find((b) => b[1] == "r"));
        if (a[1] == "m") return Object.keys(own).some((i) => own[i].o == p.id && (!own[i].m || own[i].h)) || cap(p) >= 1e6 ? a : ok.find((b) => b[1] == "b" || b[1] == "t");
        return a;
      }
      function liq(p, need) {
        const ids = Object.keys(own)
          .map(Number)
          .filter((i) => own[i].o == p.id);
        for (const i of ids)
          while (own[i].mb > 0 && p.cash < need) {
            p.cash += MBG_COST / 2;
            own[i].mb--;
          }
        for (const i of ids) {
          const hc = T[i].g ? G[T[i].g][1] * K : 0;
          while (own[i].h > 0 && p.cash < need) {
            p.cash += hc / 2;
            own[i].h--;
          }
        }
        for (const i of ids)
          if (!own[i].m && p.cash < need && grp(i).every((j) => own[j]?.o != p.id || !own[j].h)) {
            p.cash += T[i].p / 2;
            own[i].m = 1;
          }
        render();
      }
      function botManage(p) {
        const res = 4e6 * BM();
        for (let n = 0; n < 20; n++) {
          let did = 0;
          for (const i of Object.keys(own).map(Number)) {
            const o = own[i],
              t = T[i];
            if (o.o != p.id) continue;
            if (o.m && p.cash > t.p * 0.55 + res) {
              p.cash -= Math.ceil(t.p * 0.55);
              o.m = 0;
              did = 1;
              continue;
            }
            if (t.t == "s" && !o.m && (o.mb || 0) < MBG_MAX && p.cash - MBG_COST >= res + 2e6) {
              p.cash -= MBG_COST;
              o.mb = (o.mb || 0) + 1;
              did = 1;
              say(`🤖 ${p.n} membangun MBG di ${t.n}`);
              continue;
            }
            const hc = t.g ? Math.round((G[t.g][1] * K * R(p).bd) / 1e3) * 1e3 : 0,
              gi = grp(i).map((j) => own[j]);
            if (t.t == "s" && !o.m && (mono(i, p.id) || p.cash - hc >= res + 8e6) && o.h < 5 && p.cash - hc >= res && o.h <= Math.min(...gi.filter((x) => x && x.o == p.id).map((x) => x.h))) {
              p.cash -= hc;
              o.h++;
              did = 1;
              say(`🤖 ${p.n} membangun di ${t.n}`);
            }
          }
          if (!did) break;
        }
        render();
      }
