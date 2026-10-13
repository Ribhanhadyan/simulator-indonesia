      /* ===== [F1] KIOS GELAP (dulu Market): kartu kemampuan + lotre, dikelola Bandar (lihat 17-bandar.js) =====
   - Disimpan di p.inv (array id kartu) -> ikut save/restore & snapshot multiplayer (tampilan lewat DOM).
   - Uang pembelian masuk Kas Bandar (bandar.kas), bukan Dana APBN. Presiden tidak mengambil bagian.
   - Kartu pasif (as/dp/bp/tm) terpakai otomatis lewat hook; kartu aktif dipakai dari Kios atau tombol Aset.
   - Rak: 1 Lotre Receh (selalu), 2 Abu-abu, 3 Terlarang (+jejak korupsi), 4 Pesanan peran, 5 Barang baru. */
      /* Lotre: pengali hadiah terhadap harga tiket. Peluang sesungguhnya diambil dari tabel tier (BD_TABEL di 17-bandar.js). */
      const LOTRE_X = [0, 1.5, 3, 8];
      /* kembali berupa PENGALI (0 = zonk) menurut tier pemain p, mode tiarap, dan kepepet */
      const lotreRoll = (p) => {
        const t = bdTabel(p);
        let r = Math.random() * 100;
        for (let i = 0; i < 4; i++) if ((r -= t[i]) < 0) return LOTRE_X[i];
        return 0;
      };
      /* hadiah dibayar dari Kas Bandar; bila kas kurang pemain hanya menerima sisa kas (Bandar lalu bisa tumbang) */
      const lotrePay = (p, prize) => {
        if (!prize) return "zonk, tidak ada hadiah";
        const g = bdBayar(prize);
        p.cash += g;
        stat(p.id, "lotHadiah", g);
        return "menang " + fm(prize) + (g < prize ? ` (Kas Bandar hanya cukup ${fm(g)})` : " dari Kas Bandar");
      };
      const shortRp = (n) => (n >= 1e6 ? (n / 1e6).toString().replace(".", ",") + " jt" : n / 1e3 + " rb");
      /* kartu gosok interaktif untuk pemain manusia. Hasil sudah diundi di awal; menggosok hanya membuka lapisan perak.
         Mengembalikan hadiah (0 = zonk) atau null bila dibatalkan sebelum mulai menggosok. */
      function lotreScratch(p, price) {
        const prize = Math.round(lotreRoll(p) * price),
          wins = LOTRE_X.filter((x) => x).map((x) => Math.round(x * price)),
          /* menang: 3 kotak sama; zonk: 3 nominal berbeda (tidak ada pasangan) */
          cells = prize ? [prize, prize, prize] : shuf(wins.slice());
        return new Promise((resolve) => {
          mod.onclick = null;
          mod.innerHTML =
            `<h3>🎟️ Lotre Receh</h3><div class="sub">${p.n} · tiket ${fm(price)}</div>` +
            `<div class="lt-card"><div class="lt-top">KARTU GOSOK NUSANTARA</div><div class="lt-hint">Tiga nominal sama = menang</div>` +
            `<div class="lt-area"><div class="lt-cells">${cells.map((z) => `<div class="lt-cell"><span>★</span><b>${shortRp(z)}</b></div>`).join("")}</div>` +
            `<canvas class="lt-cv" width="320" height="120" aria-label="Lapisan perak, gosok untuk membuka"></canvas></div></div>` +
            `<p class="ct lt-msg">Gosok lapisan perak dengan jari atau mouse.</p>` +
            `<div class="mb"><button data-c="x" class="lt-cancel">Batal</button><button data-c="r" class="lt-open">Buka langsung</button></div>`;
          ov.hidden = false;
          const card = mod.querySelector(".lt-card"),
            cv = mod.querySelector(".lt-cv"),
            ctx = cv.getContext("2d", { willReadFrequently: true }),
            msg = mod.querySelector(".lt-msg"),
            bar = mod.querySelector(".mb"),
            W = cv.width,
            H = cv.height;
          /* lapisan perak berpola */
          const gr = ctx.createLinearGradient(0, 0, W, H);
          gr.addColorStop(0, "#c9ced6");
          gr.addColorStop(0.45, "#f1f3f6");
          gr.addColorStop(0.7, "#b4bbc6");
          gr.addColorStop(1, "#dde1e7");
          ctx.fillStyle = gr;
          ctx.fillRect(0, 0, W, H);
          ctx.strokeStyle = "rgba(90,100,115,.18)";
          ctx.lineWidth = 1;
          for (let x = -H; x < W; x += 9) {
            ctx.beginPath();
            ctx.moveTo(x, H);
            ctx.lineTo(x + H, 0);
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(70,80,95,.55)";
          ctx.font = "700 20px Oswald, Arial Narrow, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("GOSOK DI SINI", W / 2, H / 2);
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "#000"; /* destination-out: alpha goresan = seberapa banyak yang terhapus */
          let down = false,
            started = false,
            done = false,
            last = null,
            lastCheck = 0;
          const pos = (e) => {
            const r = cv.getBoundingClientRect();
            return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height];
          };
          const cleared = () => {
            const d = ctx.getImageData(0, 0, W, H).data;
            let n = 0,
              t = 0;
            for (let i = 3; i < d.length; i += 4 * 16) {
              t++;
              if (d[i] < 40) n++;
            }
            return n / t;
          };
          const finish = (auto) => {
            if (done) return;
            done = true;
            cv.classList.add("gone");
            bar.innerHTML = "";
            const note = prize ? `Menang ${fm(prize)}!` : "Zonk. Belum beruntung.";
            card.classList.add(prize ? "win" : "lose");
            msg.innerHTML = prize ? `<b>🎉 ${note}</b>` : `<b>${note}</b>`;
            if (prize && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
              for (let i = 0; i < 22; i++) {
                const s = document.createElement("i");
                s.className = "lt-conf";
                s.textContent = ["🎉", "✨", "💰", "🎊"][i % 4];
                s.style.cssText = `left:${10 + Math.random() * 80}%;--dx:${(Math.random() * 120 - 60) | 0}px;--d:${(0.9 + Math.random() * 0.9).toFixed(2)}s;--dl:${(Math.random() * 0.25).toFixed(2)}s`;
                card.appendChild(s);
              }
            }
            if (navigator.vibrate) navigator.vibrate(prize ? [60, 40, 90] : 30);
            setTimeout(() => {
              bar.innerHTML = `<button data-c="t" class="pri">${prize ? "Ambil Hadiah" : "Tutup"}</button>`;
              bar.querySelector("button").focus();
            }, auto ? 450 : 150);
          };
          const stroke = (a, b) => {
            ctx.lineWidth = 36;
            ctx.lineCap = ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          };
          const begin = () => {
            if (started) return;
            started = true;
            const c = bar.querySelector(".lt-cancel");
            if (c) c.remove();
            msg.textContent = "Terus gosok…";
          };
          cv.addEventListener("pointerdown", (e) => {
            if (done) return;
            e.preventDefault();
            cv.setPointerCapture(e.pointerId);
            down = true;
            begin();
            last = pos(e);
            stroke(last, last);
          });
          cv.addEventListener("pointermove", (e) => {
            if (!down || done) return;
            const c = pos(e);
            stroke(last, c);
            last = c;
            const now = performance.now();
            if (now - lastCheck > 120) {
              lastCheck = now;
              if (cleared() > 0.55) finish(true);
            }
          });
          const up = () => {
            if (!down) return;
            down = false;
            if (!done && cleared() > 0.55) finish(true);
          };
          cv.addEventListener("pointerup", up);
          cv.addEventListener("pointercancel", up);
          mod.onclick = (e) => {
            const b = e.target.closest("button");
            if (!b || b.disabled || !b.dataset.c) return;
            if (b.dataset.c == "x" && !started) {
              mod.onclick = null;
              ov.hidden = true;
              resolve(null);
            } else if (b.dataset.c == "r") {
              begin();
              finish(false);
            } else if (b.dataset.c == "t") {
              mod.onclick = null;
              ov.hidden = true;
              resolve(prize);
            }
          };
        });
      }
      const CARD = {
        /* ---------- kartu umum ---------- */
        dd: {
          rak: 2,
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
        as: { rak: 2, n: "Asuransi Sewa", i: "🛡️", p: 12e5, d: "Otomatis menanggung sewa berikutnya yang kamu bayar (maks Rp2.500.000)." },
        kb: {
          rak: 3,
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
        dp: { rak: 2, n: "Diskon Properti", i: "🏷️", p: 7e5, d: "Otomatis memotong 30% harga beli properti berikutnya yang kamu beli di petak." },
        /* ---------- Rak 1: Lotre Receh (selalu ada, dibeli langsung dan digosok saat itu juga, tidak masuk kantong) ---------- */
        lr: {
          rak: 1,
          lotre: 1,
          n: "Lotre Receh",
          i: "🎟️",
          p: 25e4,
          d: "Gosok sekarang juga. Tiga nominal sama berarti menang. Hadiah dibayar Kas Bandar.",
          pick: (p, h) => lotreScratch(p, h),
          bpick: (p) => lotreRoll(p),
          bbuy: () => Math.random() < 0.5 / BM(),
        },
        /* id "pu" dipertahankan agar simpanan lama tetap terbaca; kini tidak dijual lagi (rak 0). Sisa tiket lama tetap bisa digosok (tiket Rp1.000.000), hadiah dari Kas Bandar. */
        pu: {
          rak: 0,
          n: "Lotre (tiket lama)",
          i: "🎟️",
          p: 1e6,
          d: "Pakai: gosok kartunya (tiket lama Rp1.000.000, peluang mengikuti kebiasaan belimu). Hadiah dibayar Kas Bandar.",
          use: 1,
          pick: (p) => lotreScratch(p, 1e6),
          bpick: (p) => Math.round(lotreRoll(p) * 1e6),
          fx: (p, prize) => lotrePay(p, prize || 0),
          bot: (p) => 1,
        },
        bp: { rak: 2, n: "Bebas Pajak", i: "🧾", p: 8e5, d: "Otomatis membebaskan satu tagihan Pajak Penghasilan atau Pajak Barang Mewah." },
        im: {
          rak: 3,
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
          rak: 2,
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
          rak: 3,
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
        /* ---------- Rak 5: barang baru Bandar ---------- */
        tm: {
          rak: 5,
          n: "Uang Tutup Mulut",
          i: "🤐",
          p: 1e6,
          d: "Otomatis: saat OTT menangkapmu, muncul pilihan negosiasi (2 dadu +2 bonus, total 9 atau lebih berarti lolos). Hangus setelah dicoba.",
          bbuy: (p) => (p.kor || 0) > 0 && Math.random() < 0.6,
        },
        cu: {
          rak: 5,
          n: "Cuci Uang",
          i: "🧼",
          p: 1e6,
          hd: (p) => Math.max(1e6, Math.round((0.3 * (p.kor || 0)) / 1e4) * 1e4),
          d: "Langsung: hapus seluruh jejak korupsimu. Harga 30% dari jejak (min Rp1.000.000). 20% kemungkinan gagal dan jejakmu jadi 2×. Maks 1× per pemain per game.",
          instant: 1,
          fx: (p) => {
            const k = p.kor || 0;
            if (Math.random() < 0.2) {
              p.kor = k * 2;
              return "GAGAL! pencucian ketahuan, jejak korupsi jadi " + fm(p.kor);
            }
            p.kor = 0;
            return "jejak korupsi " + fm(k) + " bersih";
          },
          bbuy: (p) => (p.kor || 0) >= 15e5 && Math.random() < 0.6,
        },
        io: {
          rak: 5,
          n: "Informan OTT",
          i: "🕵️",
          p: 6e5,
          d: "Langsung: lihat posisi semua pion OTT dan daftar pemain yang berjejak korupsi.",
          instant: 1,
          fx: (p) => bdInformanTeks(),
          bbuy: () => false,
        },
        bb: {
          rak: 5,
          n: "Bocoran Berita",
          i: "📰",
          p: 8e5,
          d: "Langsung: intip berita nasional putaran depan sebelum terbit, supaya bisa menyesuaikan pinjaman dan belanja.",
          instant: 1,
          fx: (p) => bdBocoranTeks(),
          bbuy: () => false,
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
      /* penawaran Kios Gelap (4-5 barang): Lotre Receh selalu ada (rak 1); 1-2 barang rak 2/3; 1 barang rak 5; kartu peran (rak 4) bila sudah punya peran.
         Tanpa peran, rak 2/3 diambil 2 barang supaya rak tetap berisi 4. */
      function marketOffer(p) {
        const ks = Object.keys(CARD),
          rc = p.role !== undefined ? ks.find((k) => CARD[k].r === p.role) : null,
          pool = shuf(ks.filter((k) => (CARD[k].rak == 2 || CARD[k].rak == 3) && !(CARD[k].use && hasC(p, k)) && !(!CARD[k].instant && hasC(p, k)))),
          r5 = shuf(ks.filter((k) => CARD[k].rak == 5 && !hasC(p, k) && (k != "cu" || ((p.kor || 0) > 0 && !p.cuciUangDipakai)))),
          n = rc ? 1 + (Math.random() < 0.5 ? 1 : 0) : 2,
          o = ["lr"].concat(pool.slice(0, n));
        if (r5.length) o.push(r5[0]);
        if (rc && !hasC(p, rc)) o.push(rc);
        return o;
      }
      /* alasan barang tidak bisa dibeli ("" = bisa) */
      function kiosOk(p, k) {
        const c = CARD[k],
          h = bdHarga(p, k).h;
        if (!c.lotre && !c.instant && hasC(p, k)) return "Sudah dimiliki";
        if (k == "cu" && (p.cuciUangDipakai || !(p.kor > 0))) return p.cuciUangDipakai ? "Sudah dipakai" : "Tak ada jejak";
        if (bandar.tiarap && (c.lotre ? p.rkL : p.rkK) === rnd) return "Batas razia";
        if (p.cash < h) return "Uang kurang";
        return "";
      }
      const kiosPeluang = () => {
        const t = BD_TABEL.langganan;
        return "Peluang menang " + (100 - t[0]) + "% · hadiah ×1,5 / ×3 / ×8 harga tiket · rata-rata balik " + Math.round(t[1] * 1.5 + t[2] * 3 + t[3] * 8) + "%";
      };
      const cardRow = (k, p) => {
        const c = CARD[k],
          hg = bdHarga(p, k),
          why = kiosOk(p, k),
          rak = c.lotre ? "Rak 1 · Wajib" : c.r !== undefined ? "Rak 4 · Pesanan peran" : ["", "", "Rak 2 · Abu-abu", "Rak 3 · Terlarang ⚠️", "", "Rak 5 · Barang baru"][c.rak] || "";
        return sec(
          `${c.i} ${c.n}${c.r !== undefined ? " · khusus " + ROLES[c.r].n : ""}`,
          `<p class="ct"><small>${rak}</small><br>${c.d}${c.lotre ? "<br><i>" + kiosPeluang() + "</i>" : ""}${c.rak == 3 ? "<br><i>Jejak korupsi +30% harga, diincar pion OTT.</i>" : ""}</p><div class="cb"><span>${hg.h < hg.tetap ? "<s>" + fm(hg.tetap) + "</s> " : ""}${fm(hg.h)}${hg.lb ? " <small>(" + hg.lb + ")</small>" : ""}</span><button class="pri" data-c="b${k}" ${why ? "disabled" : ""}>${why || "Beli"}</button></div>`,
        );
      };
      /* satu pembelian (manusia atau bot). Mengembalikan {t: teks} bila berhasil, null bila dibatalkan, false bila pemain bangkrut. */
      async function kiosBeli(p, k, bot) {
        const c = CARD[k],
          hg = bdHarga(p, k),
          h = hg.h;
        let prize = 0;
        if (c.lotre) {
          /* manusia: gosok dulu, tiket baru dibayar setelah selesai (Batal sebelum menggosok = tidak ada yang berubah) */
          prize = bot ? Math.round(c.bpick(p) * h) : await c.pick(p, h);
          if (prize == null) return null;
        }
        if (!(await pay(p, h, 0, 1))) return false;
        bdTerima(h);
        bdStat(p);
        if (hg.kupon) p.kupon = 0;
        if (c.lotre) {
          p.rkL = rnd;
          bdCatat(p, 1, !prize);
          stat(p.id, "lotBelanja", h);
          const t = lotrePay(p, prize);
          say(`🎟️ ${p.n} membeli Lotre Receh (${fm(h)}): ${t}`);
          render();
          return { t: "Lotre Receh: " + t };
        }
        p.rkK = rnd;
        bdCatat(p, 0);
        let t;
        if (c.rak == 3) {
          const add = Math.round((0.3 * h) / 1e3) * 1e3;
          p.kor = (p.kor || 0) + add;
          say(`🕵️ ${p.n} membeli barang terlarang: jejak korupsi +${fm(add)}`);
        }
        if (k == "cu") p.cuciUangDipakai = true;
        if (c.instant) {
          t = c.i + " " + c.n + ": " + c.fx(p);
          say(bot ? `${c.i} ${p.n} memakai ${c.n}` : `${c.i} ${p.n}: ${c.n} dipakai`);
        } else {
          addC(p, k);
          t = "Membeli " + c.i + " " + c.n;
          say(`🛒 ${p.n} membeli ${c.n} (${fm(h)})`);
        }
        render();
        return { t, intel: k == "io" || k == "bb" ? t : "" };
      }
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
      /* Pelapor: lapor ke aparat, imbalan dari APBN tapi berisiko dibalas Bandar */
      async function kiosLapor(p) {
        const f = Math.max(0.2, Math.min(0.8, 0.3 + 0.3 * Math.max(0, bandar.kas / bandar.modalAwal - 0.5) + (bandar.tiarap ? 0.2 : 0)));
        p.laporR = rnd;
        if (Math.random() < f) {
          const g = Math.min(POOL, 15e5),
            sita = bdBayar(Math.round(bandar.kas * 0.08));
          POOL -= g;
          p.cash += g;
          p.pelapor = 1;
          NW.bump += 3;
          if (bandar.kas > 1.2 * bandar.modalAwal) bandar.cd = Math.min(bandar.cd, 0);
          say(`📣 ${p.n} melapor ke aparat: imbalan ${fm(g)} dari APBN, kas Bandar tergerus ${fm(sita)}`);
          return "Laporanmu diterima. Imbalan " + fm(g) + " dari APBN.";
        }
        const d = Math.min(p.cash, 8e5);
        p.cash -= d;
        bdTerima(d);
        say(`📣 ${p.n} melapor, tapi dibalas Bandar: ${fm(d)} melayang`);
        return "Laporanmu bocor ke oknum. Bandar membalas dan kamu kehilangan " + fm(d) + ".";
      }
      /* Antek Bandar: ambil komisi dari Kas Bandar, jejak korupsi naik */
      function kiosAntek(p) {
        const g = Math.min(15e5, Math.round((bandar.kas * 0.05) / 1e5) * 1e5);
        bdBayar(g);
        p.cash += g;
        p.kor = (p.kor || 0) + Math.round(g * 1.5);
        p.antekR = rnd;
        say(`🤫 ${p.n} jadi antek Bandar: komisi ${fm(g)}, jejak korupsi +${fm(Math.round(g * 1.5))}`);
        return "Komisi " + fm(g) + " diterima. Jejak korupsimu naik " + fm(Math.round(g * 1.5)) + ".";
      }
      async function market(p) {
        bdStat(p);
        if (!bdBuka()) {
          const tt = bandar.rebootSetelah != null ? "Kios Gelap sedang tutup. Kabarnya buka lagi sekitar putaran " + bandar.rebootSetelah + "." : "Kios Gelap baru buka setelah peran dibagikan (putaran 3).";
          say(`🕶️ ${p.n} mampir ke Kios Gelap, tapi tutup`);
          if (!p.b) await ask(`<h3>🕶️ Kios Gelap</h3><div class="sub">${p.n}</div><p class="ct">${tt}</p>`, [["OK", 1]], p);
          return;
        }
        const offer = marketOffer(p);
        let bought = false;
        say(`🕶️ ${p.n} masuk Kios Gelap`);
        if (p.b) {
          const res = 3e6 * BM(),
            got = [];
          let cnt = 0;
          for (const k of offer.slice().sort((a, b) => (CARD[b].r !== undefined) - (CARD[a].r !== undefined) || bdHarga(p, a).h - bdHarga(p, b).h)) {
            const c = CARD[k],
              h = bdHarga(p, k).h;
            if ((!c.lotre && cnt >= 2) || kiosOk(p, k) || p.cash - h < res || (c.use && c.can && !c.can(p) && !c.pick) || (c.bbuy && !c.bbuy(p))) continue;
            const r = await kiosBeli(p, k, 1);
            if (!r) return;
            bought = true;
            if (!c.lotre) cnt++;
            got.push(c.i + " " + c.n);
          }
          bdKunjungan(p, bought);
          if (got.length) {
            say(`🕶️ ${p.n} membeli ${got.join(", ")}`);
            await nt(`<h3>🕶️ Kios Gelap</h3><div class="sub">${p.n}</div>${sec("Membeli", got.map((g) => rw(g, "")).join(""))}`);
          }
          render();
          return;
        }
        let note = "";
        const intel = [];
        for (;;) {
          const inv = p.inv || [],
            lapor = rnd - (p.laporR === undefined ? -9 : p.laporR) >= 4,
            antek = p.antekR !== rnd && bandar.kas >= 2e6;
          const c = await mkAsk(
            `<h3>🕶️ Kios Gelap</h3><div class="sub">${p.n} · uang ${fm(p.cash)}</div>` +
              (bandar.tiarap ? sec("🚨 Razia", '<p class="ct">Bandar sedang tiarap: harga +20%, tanpa promo, maks 1 kartu dan 1 lotre per pemain per putaran.</p>') : "") +
              (note ? sec("Barusan", '<p class="ct">' + note + "</p>") : "") +
              (intel.length ? sec("Intel", intel.map((t) => '<p class="ct">' + t + "</p>").join("")) : "") +
              sec("Dijual hari ini", offer.map((k) => cardRow(k, p)).join("")) +
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
              sec(
                "Lapak belakang",
                `<div class="rw ci"><span><div>📣 <b>Lapor ke aparat</b></div><small>Imbalan dari APBN bila laporan diterima. Bila bocor, Bandar membalas.</small></span><button data-c="pl" ${lapor ? "" : "disabled"}>Lapor</button></div>` +
                  `<div class="rw ci"><span><div>🤫 <b>Jadi antek Bandar</b></div><small>Komisi dari Kas Bandar, tapi jejak korupsimu naik. Sekali per putaran.</small></span><button data-c="an" ${antek ? "" : "disabled"}>Ambil</button></div>`,
              ) +
              sec("Catatan", '<p class="ct">Uang masuk Kas Bandar. Bandar menyesuaikan peluang menurut kebiasaan belimu. Satu kartu per jenis. Kartu juga bisa dipakai lewat tombol 🏠 Aset.</p>') +
              '<div class="mb"><button data-c="x">Selesai</button></div>',
          );
          if (c == "x") {
            ov.hidden = true;
            break;
          }
          if (c == "pl" || c == "an") {
            note = c == "pl" ? await kiosLapor(p) : kiosAntek(p);
            render();
            continue;
          }
          const k = c.slice(1),
            cd = CARD[k];
          if (c[0] == "b") {
            const r = await kiosBeli(p, k, 0);
            if (r === false) {
              ov.hidden = true;
              bdKunjungan(p, bought);
              return;
            }
            if (r === null) note = "Dibatalkan";
            else {
              bought = true;
              if (!cd.lotre) offer.splice(offer.indexOf(k), 1);
              note = r.t;
              if (r.intel) intel.push(r.intel);
            }
          } else {
            const ok = await cardUse(p, k);
            note = ok ? "Memakai " + cd.i + " " + cd.n : "Dibatalkan";
          }
        }
        bdKunjungan(p, bought);
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
