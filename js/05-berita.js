      /* ================= BERITA NASIONAL v2 (awal) =================
         Hanya berita yang berdampak pada permainan. Meter kekacauan dihitung dari kondisi game dan menentukan
         suasana (5 fase), jenis berita, serta seberapa sering berita berefek terbit. */
      const NW = { bump: 0, last: "", feed: [], hist: [], ph: 0, arc: null, n: {}, cd: 0, kh: null, ev: null };
      const NPH = [
          ["Stabil", "🟢", "#3bb273"],
          ["Mulai memanas", "🟡", "#9ccc3b"],
          ["Panas", "🟠", "#f2994a"],
          ["Gawat", "🔴", "#eb5757"],
          ["Krisis berat", "🌀", "#9b51e0"],
        ],
        NCD = [3, 2, 2, 1, 1]; /* jeda antar berita: makin kacau makin sering */
      const nAlv = () => P.filter((x) => !x.x),
        nPk = (a) => a[(Math.random() * a.length) | 0],
        nPl = (s) => String(s).replace(/<[^>]+>/g, ""),
        nRd = (n) => Math.round(n / 1e5) * 1e5,
        nRich = () => {
          const a = nAlv();
          return a.length ? a.reduce((m, x) => (nw(x) > nw(m) ? x : m)) : null;
        },
        nPoor = () => {
          const a = nAlv();
          return a.length ? a.reduce((m, x) => (x.cash < m.cash ? x : m)) : null;
        },
        nGn = (g) =>
          T.filter((t) => t.g == g)
            .map((t) => t.n)
            .join(" & "),
        nMono = () => {
          for (const g of GK) {
            const ix = T.map((t, i) => i).filter((i) => T[i].g == g),
              o = own[ix[0]];
            if (o && o.o != NEG && P[o.o] && !P[o.o].x && ix.every((i) => own[i] && own[i].o == o.o)) return { p: P[o.o], g, gn: nGn(g) };
          }
          return null;
        },
        nChaos = () => {
          const a = nAlv();
          return Math.max(
            0,
            Math.min(100, Math.round(rnd * 1.6 + crS() * 6 + (POLS.length - 1) * 4 + a.filter((x) => x.jail >= 0).length * 5 + a.filter((x) => (x.kor || 0) > 0).length * 3 + Math.min(12, nneg() * 3) + FZ.L * 10 + Math.min(10, Math.round(kdTgAll() / 5e5)) + NW.bump)),
          );
        },
        nPh = (c) => (c < 18 ? 0 : c < 38 ? 1 : c < 58 ? 2 : c < 80 ? 3 : 4),
        nWp = (a) => {
          let r = Math.random() * a.reduce((s, x) => s + (x.w || 1), 0);
          for (const x of a) if ((r -= x.w || 1) < 0) return x;
          return a[a.length - 1];
        };
      const NMN = [],
        nmn = (id, lo, hi, o) => NMN.push({ id, lo, hi, w: 1, ...o }),
        evn = (i, lo, hi, tx) => nmn("ev" + i, lo, hi, { tx, ev: i, e: !(EV[i].now || EV[i].st) });

      /* ---- Berita ekonomi dasar (efek dari data EV) ---- */
      evn(2, 0, 1, "Harga sawit dan batu bara naik tajam.");
      evn(4, 0, 2, "Kunjungan wisatawan meningkat pesat.");
      evn(5, 0, 2, "Program hilirisasi nikel dipercepat.");
      evn(6, 0, 2, "Pembangunan IKN dipercepat.");
      evn(8, 0, 3, "Pilkada serentak diikuti penyaluran bantuan sosial.");
      evn(11, 0, 2, "Bank Indonesia menurunkan suku bunga.");
      evn(12, 0, 2, "Harga emas naik tajam.");
      evn(0, 1, 4, "Inflasi meningkat.");
      evn(3, 1, 3, "Pemerintah menaikkan harga BBM.");
      evn(10, 1, 3, "Bank Indonesia menaikkan suku bunga.");
      evn(13, 1, 4, "Harga emas turun tajam.");
      evn(1, 1, 4, "Resesi global berdampak pada perekonomian nasional.");
      evn(9, 1, 4, "Harga beras melonjak.");
      evn(14, 1, 3, "Pemerintah melaksanakan Proyek Strategis Nasional.");
      evn(7, 2, 4, "Demonstrasi besar terjadi di sejumlah kota.");
      evn(15, 2, 4, "Satgas BLBI menindak pengemplang pajak.");

      /* ---- Berita yang membaca kondisi permainan. b = dorongan meter kekacauan, e = mengubah ECO ---- */
      nmn("bansos", 0, 3, {
        c: () => (POOL >= 4e6 && nPoor() ? { p: nPoor(), a: Math.min(PCT_MAKS, nRd(POOL * 0.3)) } : null),
        tx: () => `Kas APBN mencapai ${fm(POOL)}. Pemerintah menyalurkan bantuan sosial.`,
        fx: (c) => `${c.p.n} (kas terendah) menerima ${fm(c.a)} dari APBN`,
        run: async (c) => {
          const a = Math.min(POOL, c.a);
          POOL -= a;
          say(`🏛️ Bansos ${fm(a)} dari APBN untuk ${c.p.n}`);
          await salur(c.p, a);
          render();
        },
      });
      nmn("csr", 0, 2, {
        c: () => {
          const p = nRich();
          return p && nAlv().length > 1 && p.cash >= 8e6 ? { p, a: Math.max(3e5, nRd(p.cash * 0.03)) } : null;
        },
        tx: (c) => `${c.p.n}, pemain terkaya, diminta menyumbang melalui program CSR.`,
        fx: (c) => `${c.p.n} membayar ${fm(c.a)} ke APBN`,
        run: async (c) => {
          await pay(c.p, c.a);
        },
      });
      nmn("endorse", 0, 3, {
        c: () => {
          const p = nPoor();
          return p && nAlv().length > 1 && p.cash < 3e6 ? { p, a: 5e5 } : null;
        },
        tx: (c) => `${c.p.n} menerima bantuan modal usaha dari swasta.`,
        fx: (c) => `${c.p.n} menerima ${fm(c.a)}`,
        run: async (c) => {
          c.p.cash += c.a;
          render();
        },
      });
      nmn("blusukan", 0, 2, {
        c: () => (PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x ? { p: P[PRES.id], a: 3e5 } : null),
        tx: (c) => `Presiden ${c.p.n} melakukan kunjungan kerja ke daerah.`,
        fx: (c) => `${c.p.n} mengeluarkan ${fm(c.a)} untuk biaya kunjungan`,
        run: async (c) => {
          await pay(c.p, c.a);
        },
      });
      nmn("monoprotes", 1, 4, {
        e: 1,
        b: 2,
        c: () => nMono(),
        tx: (c) => `Warga ${c.gn} memprotes tarif sewa yang dikuasai ${c.p.n}.`,
        fx: (c) => `Sewa ${c.gn} ×0,75 selama 3 putaran`,
        run: async (c) => {
          ECO = { ...BASE, g: { [c.g]: 0.75 }, n: `Protes warga: sewa ${c.gn} ×0,75`, d: 3 };
        },
      });
      nmn("kppu", 2, 4, {
        c: () => {
          const m = nMono();
          return m && m.p.cash >= 3e6 ? { ...m, a: Math.max(1e6, nRd(m.p.cash * 0.1)) } : null;
        },
        tx: (c) => `KPPU menyelidiki dugaan monopoli ${c.p.n} di ${c.gn}.`,
        fx: (c) => `${c.p.n} membayar denda ${fm(c.a)} ke APBN`,
        run: async (c) => {
          await pay(c.p, c.a);
        },
      });
      nmn("pajakkaya", 1, 3, {
        b: 2,
        c: () => {
          const p = nRich();
          return p && nAlv().length > 1 && p.cash >= 1e7 ? { p, a: Math.max(5e5, nRd(p.cash * 0.06)) } : null;
        },
        tx: (c) => `Pemerintah menerapkan pajak kekayaan. ${c.p.n} menjadi wajib pajak terbesar.`,
        fx: (c) => `${c.p.n} membayar ${fm(c.a)} ke APBN`,
        run: async (c) => {
          await pay(c.p, c.a);
        },
      });
      nmn("endus", 1, 4, {
        b: 3,
        c: () => {
          const a = nAlv().filter((x) => (x.kor || 0) > 0 && !isP(x) && x.jail < 0 && x.pos != IJ);
          return a.length ? { p: nPk(a) } : null;
        },
        tx: (c) => `KPK menelusuri aliran dana yang melibatkan ${c.p.n}.`,
        fx: (c) => `Satu pion OTT bergerak mendekati ${c.p.n} (jejak korupsi ${fm(c.p.kor)})`,
        run: async (c) => {
          nPk(POLS).pos = (c.p.pos - 3 - ((Math.random() * 4) | 0) + NN) % NN;
          say(`🕵️ Pion OTT bergeser mendekati ${c.p.n}`);
          render();
        },
      });
      nmn("reshuffle", 2, 4, {
        b: 3,
        c: () => (PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x ? { p: P[PRES.id] } : null),
        tx: (c) => `Presiden ${c.p.n} merombak kabinet.`,
        fx: () => "Kebijakan Presiden tidak dapat digunakan putaran ini",
        run: async () => {
          PRES.used = 1;
        },
      });
      nmn("amnesti", 2, 4, {
        c: () => {
          const a = nAlv().filter((x) => x.jail >= 0);
          return a.length ? { a } : null;
        },
        tx: () => "Pemerintah memberikan amnesti dan remisi massal.",
        fx: (c) => `${c.a.map((x) => x.n).join(", ")} dibebaskan dari penjara`,
        run: async (c) => {
          c.a.forEach((x) => (x.jail = -1));
          say(`⚖️ Amnesti massal: ${c.a.map((x) => x.n).join(", ")} bebas`);
          render();
        },
      });
      nmn("pinjol", 1, 4, {
        e: 1,
        c: () => (nAlv().some((x) => x.loans.length) ? {} : null),
        tx: () => "OJK menindak pinjaman daring ilegal dan mendorong penurunan bunga.",
        fx: () => "Bunga pinjaman bank ×0,6 selama 3 putaran",
        run: async () => {
          ECO = { ...BASE, bi: 0.6, n: "Penindakan pinjol: bunga pinjaman bank ×0,6", d: 3 };
        },
      });
      nmn("rupiah", 2, 4, {
        b: 2,
        c: () => (crS() >= 1 ? { a: Math.min(5e5, 1e5 * crS()) } : null),
        tx: () => "Nilai tukar rupiah melemah dan biaya impor meningkat.",
        fx: (c) => `Semua pemain membayar ${fm(c.a)}`,
        run: async (c) => {
          for (const q of nAlv()) await pay(q, c.a);
        },
      });
      /* khusus fase Gawat dan Krisis berat */
      nmn("libur", 4, 4, {
        e: 1,
        tx: () => "Pemerintah menetapkan libur nasional mendadak dan membagikan tunjangan darurat.",
        fx: () => "Semua pemain +Rp1.000.000; sewa ×0,5 selama 3 putaran",
        run: async () => {
          ECO = { ...BASE, m: 0.5, n: "Libur nasional mendadak: sewa ×0,5", d: 3 };
          nAlv().forEach((q) => (q.cash += 1e6));
          render();
        },
      });
      nmn("namakota", 3, 4, {
        e: 1,
        c: () => {
          const k = shuf(GK);
          return { a: k[0], b: k[1] };
        },
        tx: () => "Pemerintah mengubah nama sejumlah kota dan menimbulkan kebingungan pasar.",
        fx: (c) => `Sewa ${nGn(c.a)} ×2 dan ${nGn(c.b)} ×0,5 selama 3 putaran`,
        run: async (c) => {
          ECO = { ...BASE, g: { [c.a]: 2, [c.b]: 0.5 }, n: `Perubahan nama kota: sewa ${nGn(c.a)} ×2, ${nGn(c.b)} ×0,5`, d: 3 };
        },
      });
      nmn("kupon", 3, 4, {
        e: 1,
        tx: () => "Pemerintah membayar sebagian gaji dalam bentuk kupon.",
        fx: () => "Gaji MULAI turun menjadi Rp1.000.000 selama 3 putaran",
        run: async () => {
          ECO = { ...BASE, go: 1e6, n: "Gaji MULAI Rp1.000.000 (dibayar kupon)", d: 3 };
        },
      });
      nmn("napas", 4, 4, {
        c: () => ({ a: 3e5 }),
        tx: () => "DPR mengesahkan pajak darurat bagi seluruh warga.",
        fx: (c) => `Semua pemain membayar ${fm(c.a)} ke APBN`,
        run: async (c) => {
          for (const q of nAlv()) await pay(q, c.a);
        },
      });
      nmn("jembatan", 4, 4, {
        tx: () => "Negara mengambil alih aset swasta demi keamanan infrastruktur.",
        fx: () => "Negara membeli paksa 1 properti milik satu pemain (ganti rugi 1,25×)",
        run: async () => {
          await negara("z");
        },
      });


      /* ---- Kebakaran hutan: keadaan hutan disimpan di NW.kh (ikut tersimpan otomatis bersama NW) dan digambar di peta tengah (21-tengah.js).
         pl = 8 petak hutan. Nilai petak: 0 hutan, 1 terbakar, 2 hangus, 3 dibuka & ditanami bibit sawit, 4 kebun sawit.
         s = bagian seri terakhir yang terbit (-1 belum ada), ch = pilihan pemerintah ("atasi" / "biarkan"), r = putaran terakhir berubah. ---- */
      const KH_N = 8,
        KH_BIAYA = 5e6 /* biaya APBN memadamkan api */,
        KH_ASAP = 5e5 /* biaya kesehatan per pemain bila api dibiarkan */,
        KH_PNBP = 15e5; /* pajak ekspor sawit per petak kebun */
      const khGet = () => (NW.kh && Array.isArray(NW.kh.pl) && NW.kh.pl.length === KH_N ? NW.kh : (NW.kh = { s: -1, ch: "", pl: Array(KH_N).fill(0), r: 0 })),
        khCount = (v) => khGet().pl.filter((x) => x === v).length,
        khSet = (dari, ke, n) => {
          const kh = khGet(),
            ix = shuf(kh.pl.map((v, i) => i).filter((i) => dari.includes(kh.pl[i]))).slice(0, n);
          ix.forEach((i) => (kh.pl[i] = ke));
          return ix.length;
        },
        khPres = () => (PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x ? P[PRES.id] : null);
      /* seri terputus (mis. Presiden bangkrut): hutan yang sedang terbakar langsung jadi kebun sawit, tanpa dampak lain */
      function khBeres() {
        const kh = khGet();
        kh.pl = kh.pl.map((v) => (v > 0 ? 4 : 0));
        kh.s = 4;
        kh.r = rnd;
        say("🌴 Lahan bekas kebakaran hutan akhirnya menjadi kebun sawit");
      }

      /* ---- Seri bersambung: tiap bagian terbit beberapa putaran sekali dan makin memuncak. Dapat terulang sebagai "Jilid 2" di fase Gawat ke atas ---- */
      const NARC = {
        kasus: {
          t: "Kasus Rekening Tidak Wajar",
          lo: 1,
          hi: 4,
          tgt: () => {
            const a = nAlv().filter((x) => !isP(x) && x.jail < 0),
              k = a.filter((x) => (x.kor || 0) > 0);
            if (!a.length) return null;
            return (k.length ? k.reduce((m, x) => (x.kor > m.kor ? x : m)) : a.reduce((m, x) => (nw(x) > nw(m) ? x : m))).id;
          },
          st: [
            {
              b: 2,
              tx: (c) => `KPK memanggil <b>${c.p.n}</b> terkait dugaan rekening tidak wajar.`,
              fx: (c) => `Satu pion OTT bergerak mendekati ${c.p.n}${c.p.kor > 0 ? " (jejak korupsi " + fm(c.p.kor) + ")" : " (belum ada jejak korupsi)"}`,
              run: async (c) => {
                nPk(POLS).pos = (c.p.pos - 3 - ((Math.random() * 4) | 0) + NN) % NN;
                say(`🕵️ Pion OTT bergeser mendekati ${c.p.n}`);
                render();
              },
            },
            {
              tx: (c) => (c.p.kor > 0 ? `Persidangan <b>${c.p.n}</b> dimulai dengan dakwaan korupsi.` : `Rekening yang dipersoalkan terbukti bukan milik <b>${c.p.n}</b>.`),
              fx: (c) => (c.p.kor > 0 ? `${c.p.n} membayar biaya pengacara ${fm(c.a)}` : `${c.p.n} menerima pemulihan nama baik ${fm(Math.min(POOL, 5e5))} dari APBN`),
              run: async (c) => {
                if (c.p.kor > 0) await pay(c.p, c.a, 0, 1);
                else {
                  const g = Math.min(POOL, 5e5);
                  POOL -= g;
                  c.p.cash += g;
                  render();
                }
              },
            },
            {
              tx: (c) =>
                c.tw
                  ? `Barang bukti kasus <b>${c.p.n}</b> dinyatakan hilang dan perkara dihentikan.`
                  : isP(c.p)
                    ? `Kasus <b>${c.p.n}</b> dihentikan karena jabatan kepresidenan.`
                    : c.p.kor > 0
                      ? `Pengadilan menyatakan <b>${c.p.n}</b> bersalah.`
                      : `Kasus <b>${c.p.n}</b> ditutup karena bukti tidak cukup.`,
              fx: (c) => (c.tw ? `Jejak korupsi ${c.p.n} terhapus; kekacauan meningkat` : !isP(c.p) && c.p.kor > 0 ? `${c.p.n} masuk penjara dan uang pengganti dikembalikan ke APBN` : "Tidak ada dampak"),
              run: async (c) => {
                if (c.tw) {
                  c.p.kor = 0;
                  NW.bump += 5;
                } else if (!isP(c.p) && c.p.kor > 0) {
                  jail(c.p);
                  if (c.p.jail >= 0) vonis(c.p);
                }
              },
            },
          ],
        },
        tol: {
          t: "Proyek Tol Langit Nusantara",
          lo: 0,
          hi: 3,
          st: [
            {
              tx: () => "Pemerintah meresmikan proyek <b>Tol Langit Nusantara</b>.",
              fx: () => (ECO.d ? "Efek ekonomi menyusul setelah berita ekonomi yang berlaku selesai" : "Sewa Jakarta & IKN ×1,3 selama 3 putaran"),
              run: async () => {
                if (!ECO.d) ECO = { ...BASE, g: { db: 1.3 }, n: "Tol Langit: sewa Jakarta & IKN ×1,3", d: 3 };
              },
            },
            {
              tx: () => "Anggaran proyek Tol Langit membengkak.",
              fx: () => (POOL >= 1e6 ? `APBN berkurang ${fm(nRd(POOL * 0.3))}` : "Kas APBN kosong"),
              run: async () => {
                POOL -= nRd(POOL * 0.3);
                render();
              },
            },
            {
              b: 2,
              tx: () => "Proyek Tol Langit terhenti dan lahan warga dibebaskan.",
              fx: () => "Negara membeli paksa 1 properti milik satu pemain (ganti rugi 1,25×)",
              run: async () => {
                await negara("z");
              },
            },
            {
              b: 2,
              tx: () => "BPK menemukan kerugian negara pada proyek Tol Langit.",
              fx: () => `Semua pemain membayar ${fm(2e5)} ke APBN`,
              run: async () => {
                for (const q of nAlv()) await pay(q, 2e5);
              },
            },
          ],
        },
        karhutla: {
          t: "Kebakaran Hutan dan Lahan",
          lo: 0,
          hi: 4,
          /* "target" seri = Presiden yang memutuskan; seri hanya mulai bila ada Presiden dan masih ada ≥3 petak hutan hijau */
          tgt: () => (khPres() && khGet().pl.filter((v) => v === 0).length >= 3 ? PRES.id : null),
          st: [
            {
              b: 2,
              tx: () => "Satelit BMKG mendeteksi puluhan <b>titik api</b> di kawasan hutan dan lahan gambut. Asap tipis mulai naik.",
              fx: () => "Dua petak hutan mulai terbakar; kekacauan naik sedikit",
              run: async () => {
                const kh = khGet();
                kh.s = 0;
                kh.ch = "";
                kh.r = rnd;
                khSet([0], 1, 2);
                say("🔥 Titik api muncul di kawasan hutan");
                render();
              },
            },
            {
              tx: () => "Kebakaran hutan meluas dan kabut asap mulai menyelimuti kota. <b>Pemerintah harus memutuskan</b>: memadamkan api atau membiarkannya.",
              fx: () => `Presiden memilih: atasi (APBN ${fm(KH_BIAYA)}) atau biarkan (gratis, tetapi api dan asap memburuk)`,
              run: async () => {
                const kh = khGet(),
                  pr = khPres();
                let k;
                if (!pr) k = POOL >= KH_BIAYA ? "atasi" : "biarkan";
                else if (pr.b) k = POOL >= KH_BIAYA * 1.5 && Math.random() < 0.7 ? "atasi" : "biarkan";
                else
                  k = await ask(
                    `<h3>🔥 Kebakaran Hutan</h3><div class="sub">Keputusan Presiden ${pr.n}</div>` +
                      sec("🚒 Atasi · " + fm(KH_BIAYA) + " dari APBN", '<p class="ct">Satgas, water bombing, dan hujan buatan. Api cepat padam, sebagian besar hutan selamat, asap singkat. Kas APBN berkurang dan kebun sawit yang lahir lebih sedikit.</p>') +
                      sec("🔥 Biarkan · gratis", '<p class="ct">Api meluas dan asap pekat melumpuhkan kota: semua pemain menanggung biaya kesehatan, sewa kawasan wisata anjlok, kekacauan naik. Lahan yang terbakar jadi kebun sawit lebih luas dan APBN mendapat pajak ekspornya.</p>'),
                    [
                      ["🚒 Atasi · " + fm(KH_BIAYA), "atasi"],
                      ["🔥 Biarkan", "biarkan"],
                    ],
                    pr,
                  );
                kh.s = 1;
                kh.ch = k;
                kh.r = rnd;
                if (k == "atasi") {
                  const b = apbnBayar(KH_BIAYA);
                  khSet([0], 1, 1);
                  NW.bump -= 3;
                  say(`🚒 ${pr ? "Presiden " + pr.n : "Pemerintah"} memerintahkan pemadaman: APBN ${fm(b)}`);
                } else {
                  khSet([0], 1, 3);
                  NW.bump += 4;
                  say(`🔥 ${pr ? "Presiden " + pr.n : "Pemerintah"} membiarkan api: kebakaran meluas`);
                }
                render();
              },
            },
            {
              tx: () => (khGet().ch == "atasi" ? "Satgas karhutla, TNI, dan helikopter <b>water bombing</b> berhasil memadamkan sebagian besar api." : "Api tak terkendali. Asap pekat melintasi batas negara, sekolah diliburkan, dan negara tetangga melayangkan protes."),
              fx: () => (khGet().ch == "atasi" ? "Sebagian hutan terselamatkan; kekacauan turun" : `Semua pemain membayar ${fm(KH_ASAP)} (biaya kesehatan); sewa kawasan wisata ×0,6 selama 3 putaran`),
              run: async () => {
                const kh = khGet();
                kh.s = 2;
                kh.r = rnd;
                if (kh.ch == "atasi") {
                  khSet([1], 2, 9);
                  NW.bump -= 4;
                  say("🚒 Api padam; sebagian hutan terselamatkan");
                } else {
                  khSet([0], 1, 1);
                  khSet([1], 2, 9);
                  NW.bump += 4;
                  if (!ECO.d) ECO = { ...BASE, g: { yl: 0.6, gr: 0.6 }, n: "Kabut asap: sewa kawasan wisata ×0,6", d: 3 };
                  for (const q of nAlv()) await pay(q, KH_ASAP);
                  say("😷 Kabut asap pekat: warga jatuh sakit dan wisata sepi");
                }
                render();
              },
            },
            {
              tx: () => "Bekas hutan yang terbakar dibuka dan ditanami <b>sawit</b>. Alat berat dan bibit berdatangan.",
              fx: () => `${khCount(2)} petak bekas hutan berubah menjadi kebun sawit`,
              run: async () => {
                const kh = khGet();
                kh.s = 3;
                kh.r = rnd;
                khSet([2], 3, 9);
                say("🌴 Bekas hutan terbakar dibuka menjadi lahan sawit");
                render();
              },
            },
            {
              tx: () => "Kebun sawit di bekas hutan mulai berproduksi dan truk pengangkut buah sawit memenuhi jalan.",
              fx: () => `APBN menerima ${fm(KH_PNBP * khCount(3))} dari pajak ekspor sawit`,
              run: async () => {
                const kh = khGet(),
                  n = khSet([3], 4, 9),
                  g = KH_PNBP * n;
                kh.s = 4;
                kh.r = rnd;
                POOL += g;
                say(`🌴 Kebun sawit berproduksi: APBN menerima ${fm(g)}`);
                render();
              },
            },
          ],
        },
        gelap: {
          t: "Gelombang Demonstrasi Nasional",
          lo: 2,
          hi: 4,
          st: [
            {
              b: 3,
              tx: () => "Mahasiswa menggelar demonstrasi di Jakarta dan Bandung.",
              fx: () => (ECO.d ? "Efek ekonomi menyusul setelah berita ekonomi yang berlaku selesai" : EV[7].n + " (3 putaran)"),
              run: async () => {
                if (!ECO.d) ECO = { ...BASE, ...EV[7], d: 3 };
              },
            },
            {
              b: 3,
              tx: () => "Aksi berubah ricuh dan merusak fasilitas umum.",
              fx: () => `Semua pemain membayar ${fm(15e4)} (biaya kerusakan)`,
              run: async () => {
                for (const q of nAlv()) await pay(q, 15e4);
              },
            },
            {
              b: -8,
              tx: () => (PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x ? `Presiden <b>${P[PRES.id].n}</b> menerima perwakilan demonstran.` : "DPR menerima tuntutan demonstran."),
              fx: () => (PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x ? "Kebijakan Presiden tidak dapat digunakan putaran ini" : "Pemain berkas terendah menerima 20% kas APBN (maks " + fm(PCT_MAKS) + ")"),
              run: async () => {
                if (PRES.id >= 0 && P[PRES.id] && !P[PRES.id].x) PRES.used = 1;
                else {
                  const p = nPoor(),
                    g = Math.min(POOL, PCT_MAKS, nRd(POOL * 0.2));
                  if (p && g) {
                    POOL -= g;
                    say(`🏛️ Bantuan sosial ${fm(g)} untuk ${p.n}`);
                    await salur(p, g);
                    render();
                  }
                }
              },
            },
          ],
        },
      };

      /* ---- Mesin berita ---- */
      const nMain = (ph) => {
        const pool = NMN.filter((x) => ph >= x.lo && ph <= x.hi && !NW.hist.includes(x.id) && !(x.e && ECO.d))
          .map((x) => ({ x, cx: x.c ? x.c() : {} }))
          .filter((o) => o.cx)
          .map((o) => ({ ...o.x, cx: o.cx, w: (o.x.w || 1) * (o.x.c ? 2 : 1) }));
        return pool.length ? nWp(pool) : null;
      };
      async function nApply(e) {
        if (e.st) await negara(e.st);
        else if (e.now) {
          for (const q of nAlv()) {
            if (e.now > 0) q.cash += e.now * K;
            else await pay(q, -e.now * K);
          }
        } else ECO = { ...BASE, ...e, d: 3 };
      }
      async function news() {
        NW.bump = Math.trunc(NW.bump * 0.85);
        NW.cd--;
        const c = nChaos(),
          ph = nPh(c),
          Z = NPH[ph],
          old = NW.ph;
        let h = null,
          cx = {},
          seri = null;
        /* seri bersambung: lanjut, atau mulai yang baru */
        if (NW.arc) {
          const d = NARC[NW.arc.id],
            t = d.tgt ? P[NW.arc.p] : null;
          if (d.tgt && (!t || t.x)) NW.arc = null;
          else if (rnd >= NW.arc.nx) seri = { k: NW.arc.id, d, s: NW.arc.s, p: t };
        } else if (NW.cd <= 0 && rnd >= 3 && Math.random() < 0.15 + 0.05 * ph) {
          const ks = Object.keys(NARC).filter((k) => {
            const d = NARC[k];
            return ph >= d.lo && ph <= d.hi && (NW.n[k] || 0) < (ph >= 3 ? 2 : 1) && (!d.tgt || d.tgt() !== null);
          });
          if (ks.length) {
            const k = nPk(ks),
              d = NARC[k],
              pid = d.tgt ? d.tgt() : -1;
            NW.arc = { id: k, s: 0, p: pid, nx: rnd };
            seri = { k, d, s: 0, p: d.tgt ? P[pid] : null };
          }
        }
        /* seri karhutla terputus (mis. Presiden bangkrut): hutan dibereskan tanpa dampak */
        if (!NW.arc && !seri && NW.kh && NW.kh.s >= 0 && NW.kh.s < 4) khBeres();
        if (seri) {
          cx = { p: seri.p, jl: NW.n[seri.k] ? " · Jilid " + (NW.n[seri.k] + 1) : "", tw: Math.random() < 0.25 };
          cx.a = cx.p ? Math.max(1e6, nRd(cx.p.cash * 0.08)) : 0;
          h = { ...seri.d.st[seri.s], id: "arc-" + seri.k };
          NW.arc.s++;
          NW.arc.nx = rnd + (ph >= 3 ? 1 : 2);
          if (NW.arc.s >= seri.d.st.length) {
            NW.n[seri.k] = (NW.n[seri.k] || 0) + 1;
            NW.arc = null;
          }
        } else if (NW.cd <= 0) {
          const m = bdBocor() || nMain(ph); /* bdBocor: berita yang sudah diintip lewat Bocoran Berita */
          if (m) {
            h = m;
            cx = m.cx;
          }
        }
        /* tanpa berita berdampak: tidak ada bulletin */
        if (!h) {
          if (ph != old) say(`📰 Suasana nasional: ${Z[1]} ${Z[0]}`);
          NW.ph = ph;
          return;
        }
        const hx = typeof h.tx == "function" ? h.tx(cx) : h.tx,
          bar = "▰".repeat(Math.round(c / 10)) + "▱".repeat(10 - Math.round(c / 10));
        let fx = "";
        if (h.ev != null) {
          const e = EV[h.ev];
          fx = sec("Dampak", '<p class="ct">' + e.n + "</p>" + rw("Berlaku", e.now || e.st ? "Langsung, satu kali" : "3 putaran"));
        } else if (h.fx) {
          const f = typeof h.fx == "function" ? h.fx(cx) : h.fx;
          if (f) fx = sec("Dampak", '<p class="ct">' + f + "</p>");
        }
        await nt(
          `<h3>📰 Berita Nasional</h3><div class="sub">Putaran ${rnd} · ${Z[1]} ${Z[0]}</div>` +
            (seri ? sec("Seri · " + seri.d.t + cx.jl, rw("Bagian", seri.s + 1 + " dari " + seri.d.st.length)) : "") +
            sec("Utama", '<p class="ct">' + hx + "</p>") +
            fx +
            sec("Stress level", rw(bar + " " + c + "%", ph != old ? NPH[old][1] + " ➜ " + Z[1] : Z[1] + " " + Z[0])),
        );
        say("📰 " + nPl(hx));
        if (h.ev != null) await nApply(EV[h.ev]);
        else if (h.run) await h.run(cx);
        NW.bump = Math.max(-15, Math.min(30, NW.bump + (h.b || 0)));
        NW.cd = NCD[ph];
        NW.ph = ph;
        NW.last = nPl(hx);
        NW.ev = { i: h.id, s: seri ? seri.s : -1, r: rnd }; /* dipakai peta tengah: aktivitas warga mengikuti berita */
        NW.hist = NW.hist.concat([h.id]).slice(-10);
        render();
      }
      /* ================= BERITA NASIONAL v2 (akhir) ================= */
