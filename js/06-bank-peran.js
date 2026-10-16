      const BR = { 5: 0.04, 10: 0.03 },
        ast = (p) =>
          Object.keys(own)
            .filter((i) => own[i].o == p.id)
            .reduce((a, i) => a + T[i].p + own[i].h * (T[i].g ? G[T[i].g][1] * K : 0) + (own[i].mb || 0) * MBG_COST, 0),
        cap = (p) => Math.max(0, Math.floor((5e6 + ast(p) * 0.5) / 1e6) * 1e6 - p.loans.reduce((a, l) => a + l.pr, 0));
      function loanFor(p, amt) {
        const v = Math.min(cap(p), Math.ceil(Math.max(0, amt - p.cash) / 1e6) * 1e6);
        if (v >= 1e6) {
          p.cash += v;
          p.loans.push({ pr: v, inst: v / 10, r: BR[10], n: 10 });
          say(`🏦 ${p.n} meminjam ${fm(v)}`);
        }
      }
      function bank(p) {
        return new Promise((res) => {
          const draw = () => {
            const cp = cap(p);
            mod.innerHTML =
              `<h3>🏦 Bank</h3><div class="sub">Kas ${fm(p.cash)}</div>` +
              sec(
                "Pinjaman aktif",
                p.loans.length
                  ? p.loans.map((l, i) => `<div class="rw"><span>Sisa ${fm(l.pr)} · ${l.n} giliran${l.t ? " ⚠️ menunggak" : ""}</span><button data-a="l" data-i="${i}" ${p.cash >= l.pr ? "" : "disabled"}>Lunasi</button></div>`).join("")
                  : "<p>Belum ada pinjaman.</p>",
              ) +
              sec(
                "Ajukan pinjaman · plafon sisa " + fm(cp),
                [2e6, 5e6, 1e7]
                  .map(
                    (a) =>
                      `<div class="rw"><span>${fm(a)}</span><span>${[5, 10].map((n) => `<button data-a="n" data-v="${a}" data-n="${n}" ${a > cp ? "disabled" : ""}>${n} giliran · ${Math.round(BR[n] * 100)}%</button>`).join(" ")}</span></div>`,
                  )
                  .join(""),
              ) +
              sec(
                "Ketentuan",
                `<p>Cicilan dibayar di awal tiap giliranmu: pokok ÷ tenor + bunga dari sisa pokok. Bunga mengikuti suku bunga BI (saat ini ×${+(ECO.bi * (PRES.bi || 1)).toFixed(2)}). Plafon = Rp5.000.000 + 50% nilai propertimu. Cicilan yang ditunda kena denda 10% tiap giliran, dan sisa utang saat jatuh tempo membuatmu bangkrut.</p>`,
              ) +
              '<div class="mb"><button data-a="x">Selesai</button></div>';
          };
          draw();
          ov.hidden = false;
          mod.onclick = (e) => {
            const b = e.target.closest("button");
            if (!b) return;
            const a = b.dataset.a;
            if (a == "x") {
              ov.hidden = true;
              mod.onclick = null;
              render();
              return res();
            }
            if (a == "n") {
              const v = +b.dataset.v,
                n = +b.dataset.n;
              p.cash += v;
              p.loans.push({ pr: v, inst: v / n, r: BR[n], n });
              say(`🏦 ${p.n} meminjam ${fm(v)} (${n} giliran)`);
            }
            if (a == "l") {
              const k = +b.dataset.i,
                l = p.loans[k];
              p.cash -= l.pr;
              p.loans.splice(k, 1);
              say(`🏦 ${p.n} melunasi pinjaman ${fm(l.pr)}`);
            }
            render();
            draw();
          };
        });
      }
      const RO = (n, i, d, o) => ({ n, i, d, go: 1, tax: 1, cg: 1, cl: 1, rp: 1, rs: 1, ri: 1, bi: 1, bd: 1, ck: 1, cs: 1, pt: 0, zk: 0, jl: 0, ...o });
      const RL0 = RO("Warga Biasa", "🧑", "Belum punya peran. Mendaratlah di petak Karier & Peran.", {});
      const ROLES = [
        RO("Politisi", "🏛️", "Gaji MULAI ×2,2 (gaji + tunjangan DPR) · uang kartu ×1,5 (proyek aspirasi) · 40% lolos penjara (imunitas & koneksi) · tapi sewa yang dibayar ×1,3 (gaya hidup mewah)", { go: 2.2, cg: 1.5, jl: 0.4, rp: 1.3 }),
        RO("PNS", "🏢", "Gaji MULAI ×1,3 (gaji + tunjangan kinerja) · pajak ×0,85 · biaya kesehatan ×0,7 (BPJS/Askes) · bunga bank ×0,7 (KPR subsidi) · tapi biaya rumah ×1,25 (aturan ketat)", {
          go: 1.3,
          tax: 0.85,
          ck: 0.7,
          bi: 0.7,
          bd: 1.25,
        }),
        RO("Ulama", "🕌", "Menerima infak Rp150.000 dari tiap pemain saat lewat MULAI · potongan kartu ×0,6 (hidup sederhana) · tapi gaji MULAI ×0,7 (tanpa gaji tetap)", { zk: 15e4, cl: 0.6, go: 0.7 }),
        RO("Karyawan Swasta", "💼", "Gaji MULAI ×1,1 (sekitar UMR) · THR/bonus kartu ×1,3 · tapi pajak ×1,2 (PPh21 dipotong penuh)", { go: 1.1, cg: 1.3, tax: 1.2 }),
        RO("Pegawai BUMN", "🏭", "Gaji MULAI ×1,8 (gaji + tantiem) · bunga bank ×0,6 · sewa stasiun & utilitas ×0,5 · biaya kesehatan ×0,8 · tapi pajak ×1,2", { go: 1.8, bi: 0.6, rs: 0.5, ck: 0.8, tax: 1.2 }),
        RO("Pengusaha", "📈", "Sewa yang kamu terima ×1,3 · biaya rumah ×0,8 · tapi gaji MULAI ×0,8 (penghasilan tak tetap), pajak ×1,1 dan kerugian kartu ×1,2 (risiko usaha)", { ri: 1.3, bd: 0.8, go: 0.8, tax: 1.1, cl: 1.2 }),
        RO("Petani", "🌾", "Panen: +Rp100.000 tiap giliran · sewa yang dibayar ×0,85 · potongan kartu ×0,8 (subsidi pupuk) · bunga bank ×0,8 (KUR) · tapi gaji MULAI ×0,6 (nilai tukar petani rendah)", {
          pt: 1e5,
          rp: 0.85,
          cl: 0.8,
          bi: 0.8,
          go: 0.6,
        }),
        RO("Content Creator", "📱", "Uang kartu ×1,5 (endorse viral) · sewa yang kamu terima ×1,1 · tapi gaji MULAI ×0,8 (tanpa gaji tetap) dan bunga bank ×1,3 (sulit lolos KPR)", { cg: 1.5, ri: 1.1, go: 0.8, bi: 1.3 }),
        RO("Nelayan", "🎣", "Hasil laut: +Rp150.000 tiap giliran · sewa yang dibayar ×0,75 · potongan kartu ×0,7 · tapi gaji MULAI ×0,6 dan bunga bank ×1,2 (usaha bergantung cuaca)", { pt: 15e4, rp: 0.75, cl: 0.7, go: 0.6, bi: 1.2 }),
        RO("Guru", "📚", "Tunjangan sertifikasi +Rp50.000 tiap giliran · biaya sekolah anak ×0,6 · potongan kartu ×0,8 · tapi gaji MULAI ×0,9 (banyak guru honorer) dan sewa yang diterima ×0,9", {
          pt: 5e4,
          cs: 0.6,
          cl: 0.8,
          go: 0.9,
          ri: 0.9,
        }),
        RO("Dokter", "🩺", "Gaji MULAI ×2 (dokter umum & spesialis) · biaya kesehatan ×0,4 · tapi pajak ×1,3 (PPh progresif) dan sewa yang dibayar ×1,2", { go: 2, ck: 0.4, tax: 1.3, rp: 1.2 }),
        RO("TNI/Polri", "🎖️", "Gaji MULAI ×1,4 · 40% lolos penjara (perlindungan korps) · potongan kartu ×0,7 (tunjangan & asrama) · bunga bank ×0,8 (KPR TNI/Polri) · tapi sewa yang diterima ×0,9", {
          go: 1.4,
          jl: 0.4,
          cl: 0.7,
          bi: 0.8,
          ri: 0.9,
        }),
        RO("Pengacara", "⚖️", "Gaji MULAI ×1,2 · uang kartu ×1,4 (fee kasus) · 30% lolos penjara (paham celah hukum) · tapi pajak ×1,3", { go: 1.2, cg: 1.4, jl: 0.3, tax: 1.3 }),
        RO("Atlet", "🏅", "Bonus kartu ×1,8 (bonus SEA Games/Olimpiade) · tapi gaji MULAI ×0,9 dan biaya kesehatan ×1,4 (risiko cedera)", { cg: 1.8, go: 0.9, ck: 1.4 }),
        RO("Seniman", "🎨", "Uang kartu ×1,2 · sewa yang diterima ×1,2 · tapi gaji MULAI ×0,7 (penghasilan tak menentu)", { cg: 1.2, ri: 1.2, go: 0.7 }),
        RO("Programmer", "💻", "Gaji MULAI ×1,7 · bunga bank ×0,8 · tapi sewa yang dibayar ×1,1 dan pajak ×1,15", { go: 1.7, bi: 0.8, rp: 1.1, tax: 1.15 }),
      ];
      const IX = [
        [0, "Satu petak: wajib bayar Rp200.000 ke pemain lain (kecuali sesama Politisi)"],
        [10, "Satu petak: pemain lain bisa konsultasi Rp100.000 (biaya kesehatan kartu berikutnya gratis)"],
        [12, "Satu petak: pemain lain bisa sewa jasa Rp300.000 (kebal OTT/penjara 1×)"],
        [11, "Satu petak: menilang pemain non-aparat Rp150.000 (Politisi kebal)"],
        [7, "Satu petak: kolaborasi, keduanya +Rp100.000 (dengan Politisi: skandal, masing-masing denda Rp150.000)"],
        [13, "Satu petak: menantang duel dadu taruhan Rp200.000"],
      ];
      IX.forEach(([i, t]) => (ROLES[i].d += " · ⚡ " + t));
      const R = (p) => ROLES[p.role] || RL0;
      const RX_SEHAT = /dokter|sakit|vaksin|kesehatan|BPJS|kecelakaan/i;
      const cm = (p, t) => R(p).cl * (RX_SEHAT.test(t) ? R(p).ck : 1) * (/sekolah|kuliah/i.test(t) ? R(p).cs : 1);
      /* SATU-SATUNYA tempat menghitung nominal kartu uang ("m"): dipakai teks kartu, baris Efek, log, dan pembayaran */
      const kartuNom = (p, c) => {
        const [tx, a, v] = c;
        if (a != "m") return null;
        const neg = v < 0,
          free = neg && !!p.gk && RX_SEHAT.test(tx),
          amt = free ? 0 : Math.round((Math.abs(v) * K * (neg ? cm(p, tx) : R(p).cg)) / 1e3) * 1e3;
        return { amt, neg, free };
      };
      const kartuTeks = (p, c) => {
        const n = kartuNom(p, c);
        return n ? c[0].replace(/Rp[\d.]+/, fm(n.amt)) : c[0];
      };
      async function getRole(p) {
        const pool = ROLES.map((r, i) => i).filter((i) => i !== p.role),
          k = pool[(Math.random() * pool.length) | 0];
        p.role = k;
        const r = ROLES[k];
        await ask(
          `<h3>${RP.i} Peran Baru</h3><div class="sub">${p.n}</div>${sec("Kamu sekarang", '<p class="ct">' + r.i + " <b>" + r.n + "</b></p>")}${sec("Kemampuan", '<p class="ct">' + r.d + "</p>")}${sec("Berlaku", "<p>Sampai kamu kembali ke petak " + RP.n + " dan mendapat peran baru secara acak.</p>")}`,
          [["OK", 1]],
        );
        say(`${r.i} ${p.n} kini menjadi ${r.n}`);
        render();
      }
      const isPol = (p) => R(p) === ROLES[0];
      // hukuman koruptor yang tertangkap: catatan dihapus, uang pengganti (sebesar jejak korupsi) kembali ke APBN
      function vonis(p) {
        const kor = p.kor || 0,
          back = Math.min(p.cash, kor);
        p.kor = 0;
        if (back > 0) {
          p.cash -= back;
          POOL += back;
        }
        say(`⚖️ ${p.n} divonis korupsi${back ? ": uang pengganti " + fm(back) + " dikembalikan ke APBN" : ""}${isPol(p) ? " (gaji tetap cair selama di penjara)" : ""}`);
        render();
      }
      async function korupsi(p, sum) {
        const pc = bansosPct(sum),
          g = Math.min(POOL, pctPool(pc / 100));
        if (!g) {
          if (!p.b) await ask("<h3>🕵️ KORUPSI</h3><p>Kas APBN kosong, tidak ada yang bisa digelapkan.</p>", [["OK", 1]], p);
          say(`🕵️ ${p.n} mendarat di KORUPSI, tapi kas APBN kosong`);
          return;
        }
        let go;
        if (p.b) go = Math.random() < Math.min(0.8, Math.max(0.15, 0.75 - 0.08 * POLS.length - ((p.kor || 0) > 0 ? 0.2 : 0)));
        else
          go = await ask(
            `<h3>🕵️ KORUPSI</h3><div class="sub">${p.n}</div>` +
              sec("Peluang", rw("Dadu", sum) + rw("Bisa digelapkan", pc + "% kas APBN") + rw("Jumlah", fm(g)) + rw("Kas APBN sekarang", fm(POOL))) +
              sec(
                "Risiko",
                '<p class="ct">Korupsi tercatat sebagai jejak dan membuatmu diincar pion OTT. Jika tertangkap: penjara' +
                  (isPol(p) ? " (gaji tetap cair)" : " tanpa gaji") +
                  ", dan uang pengganti sebesar jejak korupsi dikembalikan ke APBN." +
                  (p.kor || 0 ? " Jejakmu sekarang " + fm(p.kor) + "." : "") +
                  " Tidak korupsi: tidak terjadi apa-apa.</p>",
              ),
            [
              ["Korupsi " + fm(g), 1],
              ["Tidak", 0],
            ],
            p,
          );
        if (go) {
          POOL -= g;
          p.cash += g;
          p.kor = (p.kor || 0) + g;
          say(`🕵️ ${p.n} menggelapkan ${fm(g)} dari APBN (${pc}% kas)`);
        } else say(`🕵️ ${p.n} memilih tidak korupsi`);
        render();
      }
      async function tangkap(p) {
        if (!(p.kor > 0)) {
          say(`👮 OTT memeriksa ${p.n}: tidak ada catatan korupsi, dilepas`);
          return;
        }
        if (isP(p)) {
          say(`🛡️ Presiden ${p.n} kebal OTT berkat Paspampres`);
          return;
        }
        if (p.imun) {
          p.imun = 0;
          say(`⚖️ ${p.n} lolos OTT berkat pengacara (sekali pakai)`);
          render();
          return;
        }
        const amt = Math.max(1e6, Math.round((p.cash * 0.15) / 1e5) * 1e5);
        /* Uang Tutup Mulut (Kios Gelap): pilihan negosiasi, 2 dadu +2 bonus, total >= 9 lolos. Kartu hangus setelah dicoba. */
        let c;
        for (;;) {
          const bt = [
            ["Suap " + fm(amt), "s", p.cash < amt],
            ["Masuk Penjara", "j"],
          ];
          if (hasC(p, "tm")) bt.push(["🤐 Negosiasi (Uang Tutup Mulut)", "n"]);
          c = await ask(
            `<h3>👮 OTT Polisi!</h3><div class="sub">${p.n}</div>${sec("Situasi", '<p class="ct">Pion OTT berada di petak yang sama denganmu dan mengendus jejak korupsimu (' + fm(p.kor) + ").</p>")}${sec("Pilihan", rw("Bayar suap", fm(amt)) + rw("Masuk penjara", (isPol(p) ? "Gaji tetap cair" : "Tanpa gaji") + ", uang pengganti " + fm(Math.min(p.cash, p.kor))) + (hasC(p, "tm") ? rw("Negosiasi", "2 dadu +2, butuh total 9+") : ""))}`,
            bt,
            p,
          );
          if (c != "n") break;
          dropC(p, "tm");
          const a = (1 + Math.random() * 6) | 0,
            b = (1 + Math.random() * 6) | 0;
          dice(a, b);
          say(`🤐 ${p.n} negosiasi dengan OTT: ${a} + ${b} + 2 = ${a + b + 2}`);
          if (a + b + 2 >= 9) {
            say(`🤐 Negosiasi berhasil, ${p.n} dilepas OTT`);
            render();
            return;
          }
          say(`🤐 Negosiasi gagal, uang tutup mulut hangus`);
          render();
        }
        if (c == "s") {
          await pay(p, amt, 0, 1);
          say(`👮 ${p.n} menyuap OTT ${fm(amt)}`);
        } else {
          jail(p);
          if (p.jail >= 0) vonis(p);
        }
      }
      async function polisi() {
        for (const x of POLS) await pol1(x);
      }
      async function pol1(POL) {
        const a = (1 + Math.random() * 6) | 0,
          b = (1 + Math.random() * 6) | 0;
        dice(a, b);
        say(`👮 OTT melempar ${a} + ${b} = ${a + b}`);
        await sleep(900);
        let n = a + b;
        const buron = P.filter((x) => !x.x && x.jail < 0 && x.pos != IJ && (x.kor || 0) > 0)
          .map((x) => ({ x, d: (x.pos - POL.pos + NN) % NN }))
          .filter((o) => o.d >= 1 && o.d <= 12)
          .sort((m, q) => m.d - q.d)[0];
        if (buron && Math.random() < Math.min(0.9, 0.35 + buron.x.kor / 2e7)) {
          n = buron.d;
          say(`🕵️ OTT dapat laporan korupsi ${buron.x.n}, langsung mengejar (${n} petak)`);
        }
        for (let k = 0; k < n; k++) {
          POL.pos = (POL.pos + 1) % NN;
          render();
          await sleep(POLS.length > 1 ? 90 : 150);
        }
        say(`👮 OTT berhenti di ${T[POL.pos].n}`);
        for (const p of P.filter((x) => !x.x && x.pos == POL.pos && x.jail < 0 && POL.pos != IJ)) await tangkap(p);
      }
      async function tambang(p) {
        const au = ECO.au,
          f = (x) => Math.round((x * au) / 1e4) * 1e4;
        const c = await ask(
          `<h3>⛏️ Tambang Emas</h3><div class="sub">Harga emas ×${au}</div>${sec("Gali tradisional", rw("Biaya", "gratis") + rw("Hasil", "Rp0 – " + fm(f(6e5))))}${sec("Alat berat", rw("Biaya", fm(1e6)) + rw("Hasil", "longsor – " + fm(f(5e6))))}`,
          [
            ["Gali tradisional", "t"],
            ["Alat berat " + fm(1e6), "a", p.cash < 1e6],
          ],
          p,
        );
        const d = (1 + Math.random() * 6) | 0;
        let g;
        if (c == "a") {
          p.cash -= 1e6;
          g = f([0, 0, 1e6, 1.5e6, 2.5e6, 5e6][d - 1]);
        } else g = f([0, 0, 2e5, 2e5, 4e5, 6e5][d - 1]);
        p.cash += g;
        render();
        await ask(`<h3>⛏️ Hasil Galian</h3>${sec("Dadu galian", '<p class="ct">' + d + "</p>")}${sec("Hasil", rw(g ? "Emas terjual" : "Hasil galian", g ? fm(g) : c == "a" ? "Longsor! Modal hilang" : "Tidak dapat emas"))}`, [["OK", 1]], p);
        say(`⛏️ ${p.n} menggali emas: ${g ? "+" + fm(g) : "nihil"}`);
      }
