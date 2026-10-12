      const MBG_COST = 1e7,
        MBG_PAY = 15e5;
      // Petak Dana APBN: pemain hanya ambil sebagian isi kas, sesuai total dadu saat mendarat
      const BANSOS_PCT = 8; // persen per mata dadu (dadu 7 = 56%, dadu 12 = 96%)
      const bansosPct = (sum) => Math.min(100, Math.max(0, Math.round((sum || 7) * BANSOS_PCT)));

      /* ===== PPh Pasal 21 atas gaji MULAI (mengikuti UU HPP No. 7/2021 Pasal 17) =====
         Gaji dianggap gaji bulanan: disetahunkan (×12), dikurangi PTKP, lalu dikenai tarif progresif per lapis.
         PPH_EQ = ekuivalensi nilai game ke rupiah nyata (gaji dasar Rp2 juta di game ≈ Rp6 juta/bulan, setara UMP kota besar). */
      const PPH_EQ = 3,
        PTKP = 54e6, // PTKP wajib pajak TK/0 per tahun
        PPH_LAYERS = [
          [60e6, 0.05],
          [250e6, 0.15],
          [500e6, 0.25],
          [5e9, 0.3],
          [Infinity, 0.35],
        ];
      const pph21 = (g, p) => {
        if (isP(p)) return 0; // Presiden kebal pajak (aturan peran yang sudah ada)
        let rest = Math.max(0, g * PPH_EQ * 12 - PTKP),
          low = 0,
          tax = 0;
        for (const [hi, r] of PPH_LAYERS) {
          const part = Math.min(rest, hi - low);
          if (part <= 0) break;
          tax += part * r;
          rest -= part;
          low = hi;
        }
        // pajak setahun -> sebulan -> nilai game, lalu dikali pengali pajak peran dan penyesuaian fiskal APBN
        return Math.round(((tax / 12 / PPH_EQ) * R(p).tax * fzTax()) / 1e3) * 1e3;
      };
      // setoran ke kas APBN (Presiden mengambil 20%, sama seperti pay())
      const toAPBN = (amt, from) => {
        const pr = P[PRES.id];
        if (pr && !pr.x && pr !== from) {
          const c = Math.round((amt * 0.2 * fzEff()) / 1e3) * 1e3;
          pr.cash += c;
          POOL += amt - c;
        } else POOL += amt;
      };

      /* ===== Logika fuzzy: penyesuaian fiskal otomatis APBN (metode Sugeno) =====
         Input 1 "cakupan"   = kas APBN / total kewajiban insentif MBG (insentif satu putaran + tunggakan)
         Input 2 "tunggakan" = total tunggakan negara / insentif satu putaran
         Output  L (0..1)    = tingkat pengetatan fiskal (0 = normal, 1 = maksimal), rata-rata berbobot aturan IF-THEN */
      const FZ = { L: 0 };
      const fzTri = (x, a, b, c) => (x <= a || x >= c ? 0 : x <= b ? (x - a) / (b - a) : (c - x) / (c - b));
      const fzDn = (x, a, b) => (x <= a ? 1 : x >= b ? 0 : (b - x) / (b - a));
      const fzUp = (x, a, b) => (x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a));
      const FZ_RULES = [
        // [cakupan, tunggakan, tingkat pengetatan]
        ["kritis", "berat", 1],
        ["kritis", "sedang", 0.9],
        ["kritis", "ringan", 0.75],
        ["rendah", "berat", 0.8],
        ["rendah", "sedang", 0.6],
        ["rendah", "ringan", 0.4],
        ["cukup", "berat", 0.2],
        ["cukup", "sedang", 0.05],
        ["cukup", "ringan", 0],
        ["surplus", "berat", 0],
        ["surplus", "sedang", 0],
        ["surplus", "ringan", 0],
      ];
      const fzCalc = (cov, arr) => {
        const C = { kritis: fzDn(cov, 0.25, 0.75), rendah: fzTri(cov, 0.25, 0.75, 1.5), cukup: fzTri(cov, 1, 2, 3.5), surplus: fzUp(cov, 2.5, 4) },
          A = { ringan: fzDn(arr, 0.2, 1), sedang: fzTri(arr, 0.2, 1, 2.5), berat: fzUp(arr, 1.5, 3) };
        let sw = 0,
          sz = 0;
        for (const [c, a, z] of FZ_RULES) {
          const w = Math.min(C[c], A[a]);
          sw += w;
          sz += w * z;
        }
        return sw ? sz / sw : 0;
      };
      const fzInputs = () => {
        const act = P.filter((x) => !x.x),
          per = act.reduce((a, p) => a + nmb(p) * MBG_PAY * pgM() + kdAktif(p) * kdCil(), 0),
          arr = act.reduce((a, p) => a + (p.mt || 0) + kdTg(p), 0),
          need = per + arr;
        return { per, arr, need, cov: need > 0 ? POOL / need : 99, ar: arr / Math.max(per, MBG_PAY) };
      };
      const fzLabel = (l) => (l < 0.05 ? ["Normal", "🟢"] : l < 0.35 ? ["Pengetatan ringan", "🟡"] : l < 0.65 ? ["Pengetatan sedang", "🟠"] : ["Pengetatan ketat", "🔴"]);
      const fzTax = () => 1 + 0.6 * FZ.L, // pajak (PPh & barang mewah) naik maks ×1,6
        fzRent = () => 1 + 0.4 * FZ.L, // sewa aset negara naik maks ×1,4
        fzEff = () => 1 - 0.5 * FZ.L; // efisiensi: potongan Presiden turun maks setengahnya
      async function fzUpdate() {
        const I = fzInputs(),
          target = I.need > 0 ? fzCalc(I.cov, I.ar) : 0,
          before = FZ.L;
        let L = before + 0.5 * (target - before); // bergerak bertahap, tidak melompat
        if (L < 0.05 && target < 0.05) L = 0;
        FZ.L = Math.round(L * 100) / 100;
        const [la, ic] = fzLabel(FZ.L),
          lb = fzLabel(before)[0];
        if (la == lb) return;
        const was = before < 0.05,
          now = FZ.L < 0.05;
        if (now) {
          say(`✅ APBN pulih: pajak, sewa aset negara, dan potongan Presiden kembali normal`);
          await nt(
            "<h3>✅ Fiskal Negara Normal</h3>" +
              sec("Kondisi APBN", rw("Kas APBN", fm(POOL)) + rw("insentif MBG per putaran", fm(I.per)) + rw("Tunggakan negara", fm(I.arr))) +
              sec("Kebijakan", '<p class="ct">Kas APBN sudah pulih. Pajak, sewa aset negara, dan potongan Presiden kembali ke tarif semestinya.</p>'),
          );
        } else {
          say(`${ic} Fiskal otomatis: ${la}. Pajak ×${fx(fzTax())}, sewa aset negara ×${fx(fzRent())}, potongan Presiden ×${fx(fzEff())}`);
          if (was)
            await nt(
              "<h3>🧮 APBN Defisit: Penyesuaian Fiskal</h3>" +
                sec("Kondisi APBN", rw("Kas APBN", fm(POOL)) + rw("insentif MBG per putaran", fm(I.per)) + rw("Tunggakan negara", fm(I.arr)) + rw("Cakupan kas", fx(Math.min(I.cov, 99)) + "× kewajiban")) +
                sec("Kebijakan otomatis (" + ic + " " + la + ")", rw("Pajak", "×" + fx(fzTax())) + rw("Sewa aset negara", "×" + fx(fzRent())) + rw("Potongan Presiden", "×" + fx(fzEff()))) +
                sec("Catatan", '<p class="ct">Berlaku bertahap dan kembali normal otomatis saat kas APBN pulih.</p>'),
            );
        }
      }
