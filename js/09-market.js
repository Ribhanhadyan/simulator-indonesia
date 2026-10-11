      /* ===== [F1] MARKET: kartu kemampuan (umum + khusus peran) =====
   - Disimpan di p.inv (array id kartu) -> ikut save/restore & snapshot multiplayer (tampilan lewat DOM).
   - Uang pembelian masuk Dana APBN lewat pay() standar (presiden ambil 20% seperti setoran lain).
   - Kartu pasif (as/dp/bp) terpakai otomatis lewat hook di land0; kartu aktif dipakai dari Market atau tombol Aset. */
      const CARD = {
        /* ---------- kartu umum ---------- */
        dd: {
          n: "Dadu Ganda",
          i: "🎲",
          p: 9e5,
          d: "Pakai: total langkah lemparan dadu berikutnya dikali 2.",
          use: 1,
          can: (p) => !p.mul,
          fx: (p) => {
            p.mul = 2;
            return "langkah lemparan berikutnya ×2";
          },
          bot: (p) => Math.random() < 0.5,
        },
        as: { n: "Asuransi Sewa", i: "🛡️", p: 12e5, d: "Otomatis menanggung sewa berikutnya yang kamu bayar (maks Rp2.500.000)." },
        kb: {
          n: "Kunci Bebas Penjara",
          i: "🔑",
          p: 1e6,
          d: "Langsung menambah 1 kartu bebas penjara ke kantongmu.",
          instant: 1,
          fx: (p) => {
            p.cards++;
            return "mendapat 1 kartu bebas penjara";
          },
        },
        dp: { n: "Diskon Properti", i: "🏷️", p: 7e5, d: "Otomatis memotong 30% harga beli properti berikutnya yang kamu beli di petak." },
        pu: {
          n: "Paket Uang",
          i: "💰",
          p: 16e5,
          d: "Pakai kapan saja: terima Rp2.100.000 tunai.",
          use: 1,
          fx: (p) => {
            p.cash += 21e5;
            return "menerima Rp2.100.000";
          },
          bot: (p) => 1,
        },
        bp: { n: "Bebas Pajak", i: "🧾", p: 8e5, d: "Otomatis membebaskan satu tagihan Pajak Penghasilan atau Pajak Barang Mewah." },
        im: {
          n: "Kebal Hukum",
          i: "⚖️",
          p: 18e5,
          d: "Pakai: kebal OTT atau masuk penjara satu kali.",
          use: 1,
          can: (p) => !p.imun,
          fx: (p) => {
            p.imun = 1;
            return "kebal OTT/penjara satu kali";
          },
          bot: (p) => 1,
        },
        kr: {
          n: "Kupon Kesempatan",
          i: "🍀",
          p: 7e5,
          d: "Pakai: ambil 1 kartu Kesempatan ekstra di awal giliranmu berikutnya.",
          use: 1,
          fx: (p) => {
            p.dr = (p.dr || 0) + 1;
            return "1 kartu Kesempatan ekstra di giliran berikutnya";
          },
          bot: (p) => p.cash > 5e6,
        },
        sk: {
          n: "Sabotase",
          i: "🕳️",
          p: 22e5,
          d: "Pakai: pilih satu lawan, ia kehilangan giliran berikutnya.",
          use: 1,
          can: (p) => P.some((x) => !x.x && x !== p && !x.sk),
          pick: async (p) => {
            const t = P.filter((x) => !x.x && x !== p && !x.sk);
            const id = await ask(
              `<h3>🕳️ Sabotase</h3><div class="sub">${p.n}</div>${sec("Pilih target", '<p class="ct">Lawan yang dipilih melewatkan giliran berikutnya.</p>')}`,
              t.map((x) => [`${x.n} · ${fm(x.cash)}`, x.id]).concat([["Batal", -1]]),
              p,
            );
            return id < 0 ? null : id;
          },
          bpick: (p) => {
            const t = P.filter((x) => !x.x && x !== p && !x.sk);
            return t.length ? t.reduce((a, b) => (nw(b) > nw(a) ? b : a)).id : null;
          },
          bot: (p) => p.cash > 4e6,
          fx: (p, id) => {
            P[id].sk = 1;
            return P[id].n + " kehilangan giliran berikutnya";
          },
        },
        /* ---------- kartu khusus peran: indeks r = indeks di ROLES ---------- */
        r0: {
          r: 0,
          n: "Amplop DPR",
          i: "💼",
          p: 18e5,
          d: "Pakai: ambil 60% isi Dana APBN (tercatat sebagai jejak korupsi, diincar OTT).",
          use: 1,
          can: (p) => POOL >= 2e5,
          fx: (p) => {
            const a = Math.round((POOL * 0.6) / 1e3) * 1e3;
            POOL -= a;
            p.cash += a;
            p.kor = (p.kor || 0) + a;
            return "menggelapkan " + fm(a) + " dari Dana APBN (tercatat sebagai jejak korupsi)";
          },
          bot: (p) => POOL >= 2e6,
        },
        r1: {
          r: 1,
          n: "KPR Subsidi",
          i: "🏢",
          p: 15e5,
          d: "Pakai: sisa pokok semua pinjamanmu dipotong 30%.",
          use: 1,
          can: (p) => p.loans.length > 0,
          fx: (p) => {
            p.loans.forEach((l) => {
              l.pr = Math.round((l.pr * 0.7) / 1e3) * 1e3;
              l.inst = l.pr / Math.max(1, l.n);
            });
            p.loans = p.loans.filter((l) => l.pr > 0);
            return "utang dipotong 30%";
          },
          bot: (p) => p.loans.reduce((a, l) => a + l.pr, 0) >= 2e6,
        },
        r2: {
          r: 2,
          n: "Doa Bersama",
          i: "🕌",
          p: 1e6,
          d: "Pakai: tiap lawan memberi infak Rp400.000 (sebatas uangnya).",
          use: 1,
          fx: (p) => {
            let s = 0;
            P.filter((x) => !x.x && x !== p).forEach((q) => {
              const a = Math.min(4e5, q.cash);
              q.cash -= a;
              p.cash += a;
              s += a;
            });
            return "menerima infak " + fm(s);
          },
          bot: (p) => P.filter((x) => !x.x && x !== p).length > 1,
        },
        r3: {
          r: 3,
          n: "Cuti Tahunan",
          i: "🏖️",
          p: 14e5,
          d: "Pakai: langsung pindah ke MULAI dan terima gaji.",
          use: 1,
          can: (p) => p.pos !== 0 && p.jail < 0,
          fx: (p) => {
            gaji(p);
            p.pos = 0;
            return "pulang ke MULAI dan menerima gaji";
          },
          bot: (p) => p.pos >= 28,
        },
        r4: {
          r: 4,
          n: "Tantiem Saham",
          i: "🏭",
          p: 16e5,
          d: "Pakai: dapat 1 saham BUMN gratis (maks 3 saham).",
          use: 1,
          can: (p) => (p.sb || 0) < 3,
          fx: (p) => {
            p.sb = (p.sb || 0) + 1;
            return "mendapat saham BUMN (" + p.sb + "/3)";
          },
          bot: (p) => 1,
        },
        r5: {
          r: 5,
          n: "Modal Ventura",
          i: "📈",
          p: 12e5,
          d: "Pakai: terima pinjaman Rp3.000.000 tanpa bunga, tenor 5 giliran.",
          use: 1,
          fx: (p) => {
            p.cash += 3e6;
            p.loans.push({ pr: 3e6, inst: 6e5, r: 0, n: 5 });
            return "menerima Rp3.000.000 (pinjaman 0%, 5 giliran)";
          },
          bot: (p) => p.cash < 5e6 && p.loans.length < 2,
        },
        r6: {
          r: 6,
          n: "Panen Raya",
          i: "🌾",
          p: 1e6,
          d: "Pakai: terima Rp300.000 per properti milikmu (maks 8 properti).",
          use: 1,
          can: (p) => mine(p).length > 0,
          fx: (p) => {
            const a = Math.min(8, mine(p).length) * 3e5;
            p.cash += a;
            return "panen " + fm(a);
          },
          bot: (p) => mine(p).length >= 3,
        },
        r7: {
          r: 7,
          n: "Konten Viral",
          i: "📱",
          p: 12e5,
          d: "Pakai: terima Rp1.500.000 + Rp150.000 per lawan yang masih main.",
          use: 1,
          fx: (p) => {
            const a = 15e5 + 15e4 * P.filter((x) => !x.x && x !== p).length;
            p.cash += a;
            return "endorse masuk " + fm(a);
          },
          bot: (p) => 1,
        },
        r8: {
          r: 8,
          n: "Tangkapan Besar",
          i: "🎣",
          p: 12e5,
          d: "Pakai: lempar 1 dadu, terima angka dadu × Rp500.000.",
          use: 1,
          fx: (p) => {
            const v = (1 + Math.random() * 6) | 0,
              a = v * 5e5;
            p.cash += a;
            return "dadu " + v + ", hasil laut " + fm(a);
          },
          bot: (p) => 1,
        },
        r9: {
          r: 9,
          n: "Dana BOS",
          i: "📚",
          p: 1e6,
          d: "Pakai: ambil 30% isi Dana APBN.",
          use: 1,
          can: (p) => POOL >= 2e5,
          fx: (p) => {
            const a = Math.round((POOL * 0.3) / 1e3) * 1e3;
            POOL -= a;
            p.cash += a;
            return "dana BOS cair " + fm(a);
          },
          bot: (p) => POOL >= 2e6,
        },
        r10: {
          r: 10,
          n: "Operasi Sukses",
          i: "🩺",
          p: 18e5,
          d: "Pakai: terima Rp2.500.000 dan biaya kesehatan kartu berikutnya gratis.",
          use: 1,
          fx: (p) => {
            p.cash += 25e5;
            p.gk = 1;
            return "honor operasi Rp2.500.000 + berobat gratis 1×";
          },
          bot: (p) => 1,
        },
        r11: {
          r: 11,
          n: "Patroli Dialihkan",
          i: "🎖️",
          p: 1e6,
          d: "Pakai: semua pion OTT dipindah ke Penjara (aman sampai mereka berjalan lagi).",
          use: 1,
          can: (p) => POLS.some((x) => x.pos !== IJ),
          fx: (p) => {
            POLS.forEach((x) => (x.pos = IJ));
            return "pion OTT dialihkan ke Penjara";
          },
          bot: (p) => POLS.some((x) => (x.pos - p.pos + NN) % NN <= 12 && x.pos !== IJ),
        },
        r12: {
          r: 12,
          n: "Banding Hakim",
          i: "⚖️",
          p: 15e5,
          d: "Pakai: properti digadai termahal ditebus gratis.",
          use: 1,
          can: (p) => mine(p).some((i) => own[i].m),
          fx: (p) => {
            const i = mine(p)
              .filter((j) => own[j].m)
              .sort((a, b) => T[b].p - T[a].p)[0];
            own[i].m = 0;
            return T[i].n + " ditebus gratis";
          },
          bot: (p) => 1,
        },
        r13: {
          r: 13,
          n: "Bonus Medali",
          i: "🏅",
          p: 13e5,
          d: "Pakai: terima Rp1.000.000 + (2 dadu × Rp100.000).",
          use: 1,
          fx: (p) => {
            const v = d2(),
              a = 1e6 + v * 1e5;
            p.cash += a;
            return "bonus " + fm(a) + " (dadu " + v + ")";
          },
          bot: (p) => 1,
        },
        r14: {
          r: 14,
          n: "Pameran Tunggal",
          i: "🎨",
          p: 13e5,
          d: "Pakai: Rp800.000 + Rp250.000 per warna properti berbeda yang kamu punya.",
          use: 1,
          fx: (p) => {
            const g = new Set(mine(p).map((i) => T[i].g || T[i].t)).size,
              a = 8e5 + 25e4 * g;
            p.cash += a;
            return "karya terjual " + fm(a);
          },
          bot: (p) => 1,
        },
        r15: {
          r: 15,
          n: "Bug Bounty",
          i: "💻",
          p: 14e5,
          d: "Pakai: Rp1.000.000 + Rp500.000 per tahap krisis ekonomi yang sedang berjalan.",
          use: 1,
          fx: (p) => {
            const a = 1e6 + 5e5 * crS();
            p.cash += a;
            return "hadiah " + fm(a);
          },
          bot: (p) => 1,
        },
      };
      const hasC = (p, k) => (p.inv || []).includes(k),
        addC = (p, k) => {
          (p.inv = p.inv || []).push(k);
        },
        dropC = (p, k) => {
          const a = p.inv || [],
            i = a.indexOf(k);
          if (i >= 0) a.splice(i, 1);
        };
      const canC = (p, k) => {
        const c = CARD[k];
        return !!c.use && (!c.can || c.can(p));
      };
      /* pakai kartu (manusia: boleh memilih target) */
      async function cardUse(p, k) {
        const c = CARD[k];
        if (!hasC(p, k) || !canC(p, k)) return false;
        let a;
        if (c.pick) {
          a = await c.pick(p);
          if (a == null) return false;
        }
        dropC(p, k);
        const t = c.fx(p, a);
        say(`${c.i} ${p.n} memakai ${c.n}: ${t}`);
        render();
        return true;
      }
      /* tiga hook kartu pasif: dipanggil dari land0 */
      function cardRent(p, r) {
        if (r > 0 && hasC(p, "as")) {
          const c = Math.min(r, 25e5);
          dropC(p, "as");
          say(`🛡️ Asuransi sewa menanggung ${fm(c)} untuk ${p.n}`);
          return r - c;
        }
        return r;
      }
      function cardBuy(p, price) {
        return hasC(p, "dp") ? Math.round((price * 0.7) / 1e3) * 1e3 : price;
      }
      /* penawaran Market: 2-4 kartu; kartu peran hanya bila pemain sudah punya peran */
      function marketOffer(p) {
        const um = shuf(Object.keys(CARD).filter((k) => CARD[k].r === undefined)),
          rc = p.role !== undefined ? Object.keys(CARD).find((k) => CARD[k].r === p.role) : null,
          n = 2 + ((Math.random() * 3) | 0),
          o = [];
        if (rc && Math.random() < 0.75) o.push(rc);
        for (const k of um) {
          if (o.length >= n) break;
          o.push(k);
        }
        return o;
      }
      const cardRow = (k, p) => {
        const c = CARD[k],
          hv = hasC(p, k),
          no = hv || p.cash < c.p;
        return sec(
          `${c.i} ${c.n}${c.r !== undefined ? " · khusus " + ROLES[c.r].n : ""}`,
          `<p class="ct">${c.d}</p><div class="cb"><span>${fm(c.p)}</span><button class="pri" data-c="b${k}" ${no ? "disabled" : ""}>${hv ? "Sudah dimiliki" : p.cash < c.p ? "Uang kurang" : "Beli"}</button></div>`,
        );
      };
      /* jendela modal sendiri (tombol di dalam konten), pola sama dengan manage(): klik didelegasikan lewat mod.onclick */
      const mkAsk = (html) =>
        new Promise((res) => {
          mod.onclick = null;
          mod.innerHTML = html;
          ov.hidden = false;
          mod.onclick = (e) => {
            const b = e.target.closest("button");
            if (!b || b.disabled || !b.dataset.c) return;
            mod.onclick = null;
            res(b.dataset.c);
          };
        });
      async function market(p) {
        const offer = marketOffer(p);
        say(`🛒 ${p.n} masuk Market`);
        if (p.b) {
          const res = 3e6 * BM(),
            got = [];
          for (const k of offer.slice().sort((a, b) => (CARD[b].r !== undefined) - (CARD[a].r !== undefined) || CARD[a].p - CARD[b].p)) {
            const c = CARD[k];
            if (got.length >= 2 || hasC(p, k) || p.cash - c.p < res || (c.use && c.can && !c.can(p) && !c.pick)) continue;
            if (!(await pay(p, c.p))) return;
            if (c.instant) {
              const t = c.fx(p);
              say(`${c.i} ${p.n}: ${t}`);
            } else addC(p, k);
            got.push(c.i + " " + c.n);
          }
          if (got.length) {
            say(`🛒 ${p.n} membeli ${got.join(", ")}`);
            await nt(`<h3>🛒 Market</h3><div class="sub">${p.n}</div>${sec("Membeli", got.map((g) => rw(g, "")).join(""))}`);
          }
          render();
          return;
        }
        let note = "";
        for (;;) {
          const inv = p.inv || [];
          const c = await mkAsk(
            `<h3>🛒 Market Kartu Kemampuan</h3><div class="sub">${p.n} · uang ${fm(p.cash)}</div>` +
              (note ? sec("Barusan", '<p class="ct">' + note + "</p>") : "") +
              sec("Dijual hari ini", offer.length ? offer.map((k) => cardRow(k, p)).join("") : '<p class="ct">Stok habis. Datang lagi nanti.</p>') +
              (inv.length
                ? sec(
                    "Kartu milikmu",
                    inv
                      .map(
                        (k) =>
                          `<div class="rw ci"><span><div>${CARD[k].i} <b>${CARD[k].n}</b></div><small>${CARD[k].d}</small></span>${CARD[k].use ? `<button data-c="u${k}" ${canC(p, k) ? "" : "disabled"}>Pakai</button>` : "<em>otomatis</em>"}</div>`,
                      )
                      .join(""),
                  )
                : "") +
              sec("Catatan", '<p class="ct">Uang pembelian masuk Dana APBN. Satu kartu per jenis. Kartu juga bisa dipakai lewat tombol 🏠 Aset.</p>') +
              '<div class="mb"><button data-c="x">Selesai</button></div>',
          );
          if (c == "x") {
            ov.hidden = true;
            break;
          }
          const k = c.slice(1),
            cd = CARD[k];
          if (c[0] == "b") {
            if (!(await pay(p, cd.p))) {
              ov.hidden = true;
              return;
            }
            offer.splice(offer.indexOf(k), 1);
            if (cd.instant) {
              note = cd.i + " " + cd.n + ": " + cd.fx(p);
              say(`${cd.i} ${p.n}: ${note}`);
            } else {
              addC(p, k);
              note = "Membeli " + cd.i + " " + cd.n;
              say(`🛒 ${p.n} membeli ${cd.n} (${fm(cd.p)})`);
            }
            render();
          } else {
            const ok = await cardUse(p, k);
            note = ok ? "Memakai " + cd.i + " " + cd.n : "Dibatalkan";
          }
        }
      }
      /* kartu aktif milik bot dipakai di akhir giliran (dipanggil bersama botManage) */
      function botCards(p) {
        if (p.x) return;
        for (const k of [...(p.inv || [])]) {
          const c = CARD[k];
          if (!c.use || !canC(p, k) || (c.bot && !c.bot(p))) continue;
          let a;
          if (c.pick) {
            a = c.bpick(p);
            if (a == null) continue;
          }
          dropC(p, k);
          say(`${c.i} ${p.n} memakai ${c.n}: ${c.fx(p, a)}`);
        }
        render();
      }
      /* bagian kartu di jendela Kelola Aset */
      const cardsSec = (p) => {
        const a = p.inv || [];
        return a.length
          ? sec(
              "🃏 Kartu Kemampuan",
              a
                .map((k) => {
                  const c = CARD[k];
                  return `<div class="rw ci"><span><div>${c.i} <b>${c.n}</b></div><small>${c.d}</small></span>${c.use ? `<button data-a="k" data-k="${k}" ${canC(p, k) ? "" : "disabled"}>Pakai</button>` : "<em>otomatis</em>"}</div>`;
                })
                .join(""),
            )
          : "";
      };
      async function cardClick(p, k, res, draw) {
        if (CARD[k].pick) {
          ov.hidden = true;
          mod.onclick = null;
          res();
          await cardUse(p, k);
          manage(p);
          return;
        }
        await cardUse(p, k);
        render();
        draw();
      }
      const cardChip = (p) => {
        const a = p.inv || [],
          x = (a.length ? "🃏 " + a.map((k) => CARD[k].i).join(" ") + " " : "") + (p.mul ? "🎲×" + p.mul + " " : "") + (p.sk ? "⏭️ kena skip " : "") + (p.dr ? "🍀×" + p.dr : "");
        return x ? `<div class="rl">${x}</div>` : "";
      };
      /* ===== [/F1] ===== */
