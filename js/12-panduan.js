      const GD = () => {
        const S = (t, b, o) => `<details${o ? " open" : ""}><summary>${t}</summary><div>${b}</div></details>`,
          L = (a) => "<ul>" + a.map((x) => `<li>${x}</li>`).join("") + "</ul>";
        return (
          S(
            "🎯 Dasar permainan",
            L([
              "Mulai dengan kas " + fm(SET.cash) + ", berjalan searah jarum jam. Lewat MULAI terima gaji " + fm(BASE.go) + " (dikali peran dan berita ekonomi), lalu dipotong PPh 21.",
              "<b>PPh 21</b>: gaji dianggap bulanan, disetahunkan, dikurangi PTKP Rp54 juta, lalu dikenai tarif progresif UU HPP: 5% (sampai Rp60 jt), 15% (sampai Rp250 jt), 25% (sampai Rp500 jt), 30% (sampai Rp5 M), 35% (di atasnya). Nilai game dikonversi ×" +
                PPH_EQ +
                " ke rupiah nyata. Pengali pajak peran dan penyesuaian fiskal APBN ikut berlaku; Presiden bebas PPh. Pajaknya masuk Dana APBN.",
              "Lempar 2 dadu. Kembar = lempar lagi, kembar 3× = masuk penjara.",
              "Petak kosong: beli, atau dilelang jika tidak dibeli.",
              "Pajak dan denda masuk <b>Dana APBN</b>. Petak <b>KORUPSI</b>: pilih korupsi (gelapkan total dadu × " + BANSOS_PCT + "% isi kas, tapi jadi buruan OTT) atau tidak (tidak terjadi apa-apa).",
              "Penjara: bayar denda Rp500.000, lempar kembar (maks 3 percobaan), atau pakai kartu bebas.",
              "Menang: pemain terakhir yang tidak bangkrut.",
              "🔀 <b>Urutan main</b> diundi dengan animasi sekali di awal permainan (bisa dimatikan di Pengaturan Aturan), lalu tetap sama sepanjang permainan.",
              "Tips: ketuk petak untuk lihat harga sewa; ketuk kotak warna di kartu pemain untuk melihat aset.",
            ]),
            1,
          ) +
          S(
            "🏠 Properti, rumah & MBG",
            L([
              "<b>Grup aset</b>: huruf A-H menandai set warna dari termurah (A) ke termahal (H); I = stasiun, J = utilitas. Huruf tampil di petak, kartu pemain, dan semua jendela beli, lelang, dan dagang.",
              "Sewa naik dengan rumah (maks 4) lalu hotel. Set warna lengkap membuat sewa tanah kosong ×2.",
              "Bangun lewat tombol 🏠 Aset kapan saja, tidak perlu mendarat. Bangun merata dalam satu set warna.",
              "Gadai dapat 50% harga, tebus 55%. Properti berbangunan tidak bisa digadai.",
              "<b>🍱 MBG</b> (kotak biru): " +
                fm(MBG_COST) +
                " per unit, maks " +
                MBG_MAX +
                " per properti kota. Pemilik terima insentif <b>" +
                fm(MBG_PAY) +
                "</b> per unit tiap lewat atau mendarat di MULAI, dibayar dari <b>Dana APBN</b>. Jika kas APBN kurang, pemilik hanya menerima sisa kas dan kekurangannya jadi <b>tunggakan negara</b> yang dibayar lebih dulu saat kas terisi. Jual MBG dapat setengah harga.",
              "Rumah dan MBG harus dijual dulu sebelum properti didagangkan atau digadai. Properti ber-Kopdes tidak bisa didagangkan maupun digadai.",
            ]),
          ) +
          (KD_MAX
            ? S(
                "🏪 Kopdes Merah Putih",
                L([
                  "Program nasional yang aktif sejak putaran " + KD_RAPAT + ". Tiap pemain pemilik properti kota wajib membangun <b>1 Kopdes</b> (Kopdes wajib) dalam " + KD_TENGGAT + " putaran. Jika lalai, negara menunjuk satu propertimu.",
                  "Bangun lewat 🏠 Aset › Program Pemerintah. Membangun gratis; maks 1 Kopdes per petak. Kopdes tambahan bersifat sukarela, dan Kopdes wajib tidak bisa diserahkan.",
                  "<b>Cicilan</b> ditanggung APBN lewat bank negara (" + fm(KD_CIL) + " per putaran, tenor 20 putaran). Jika kas APBN kurang, kekurangannya jadi <b>tunggakan negara</b>.",
                  "Tunggakan yang melewati masa tenggang " + KD_GRACE + " putaran ditalangi pemilik dan tercatat sebagai <b>piutang ke negara</b>, dibayar saat kas APBN pulih.",
                  "<b>Iuran</b> " + KD_IURAN * 100 + "% dari sewa dibayar penyewa sebagai iuran tambahan di properti ber-Kopdes, ditahan sebagai saldo. Saat pemilik lewat MULAI, saldo melunasi tunggakan lebih dulu, sisanya dibagi antara pemilik dan APBN.",
                  "Bantuan negara bisa disalurkan lewat Kopdes pemain lain. Penyalur dapat komisi 10%, dan boleh menilap hingga 30% (menjadi jejak korupsi yang diincar OTT).",
                  "<b>Properti ber-Kopdes tidak bisa didagangkan maupun digadai.</b> Kopdes tambahan bisa diserahkan dulu bila ingin menjual petaknya. Bangkrut atau disita negara membuat Kopdes ikut hilang.",
                ]),
              )
            : "") +
          S(
            "🏦 Bank",
            L([
              "Plafon pinjaman = Rp5.000.000 + 50% nilai properti (termasuk rumah dan MBG).",
              "Tenor 5 giliran (bunga 4%) atau 10 giliran (3%). Cicilan dibayar di awal giliran: pokok ÷ tenor + bunga sisa pokok.",
              "Cicilan ditunda kena denda 10%. Sisa utang saat jatuh tempo = bangkrut.",
              "Bunga ikut berita ekonomi, peran, dan kebijakan presiden.",
            ]),
          ) +
          S(
            "📰 Berita Nasional",
            L(
              [
                "Berita hanya terbit jika berdampak pada permainan; jedanya makin pendek seiring meningkatnya tingkat kekacauan.",
                "<b>Stress level</b> (0–100) tampil sebagai lingkaran di ringkasan Situasi negara, di samping berita terakhir. Makin tinggi, lingkarannya berdenyut makin cepat, dan bila terus naik berturut-turut ia bergetar panik. Nilainya dipengaruhi putaran, tahap krisis, pion OTT, pemain di penjara, jejak korupsi, aset negara, dan pengetatan fiskal.",
                "Lima fase: Stabil, Mulai memanas, Panas, Gawat, Krisis berat. Berita menyesuaikan kondisi permainan (pemain terkaya/termiskin, monopoli warna, kas APBN, presiden, penjara, utang).",
                "Ada tiga seri bersambung (kasus rekening, Tol Langit, demonstrasi) yang dapat terulang di fase Gawat. Efek ekonomi berlaku 3 putaran atau satu kali. Contoh dasar:",
              ].concat(EV.map((e) => e.n)),
            ),
          ) +
          S(
            "👮 Pion OTT",
            L([
              "Berjalan tiap akhir putaran. OTT hanya menangkap pemain yang punya jejak korupsi (dari petak KORUPSI atau kartu Amplop DPR); pemain bersih dilepas.",
              "Berhenti di petak koruptor: suap 15% kas (min. Rp1.000.000) atau masuk penjara, lalu uang pengganti sebesar jejak korupsi dikembalikan ke APBN dan catatannya dihapus.",
              "Pion mengejar koruptor yang ada dalam jangkauan 12 petak (peluang naik seiring besar jejak korupsi).",
              "Presiden kebal OTT.",
              "Politisi yang dipenjara tetap menerima gaji tiap giliran; pemain lain tidak menerima gaji selama di penjara.",
              "Jumlah pion OTT bertambah seiring tahap krisis, sesuai level yang dipilih.",
            ]),
          ) +
          S(
            "🎭 Karier & peran",
            ROLES.map((r) => `<p><b>${r.i} ${r.n}</b><br>${r.d}</p>`).join("") +
              "<p>Setelah 2 putaran pertama selesai, semua pemain yang belum punya peran otomatis mendapat peran acak. Setelah itu peran hanya bisa didapat dengan mendarat di petak Karier & Peran, dan langsung menggantikan peran lama.</p>",
          ) +
          S("🤝 Interaksi satu petak", L(IX.map(([i, t]) => `<b>${ROLES[i].i} ${ROLES[i].n}</b>: ${t.replace("Satu petak: ", "")}`).concat(["Berlaku dua arah, tidak berlaku untuk sesama peran, dan tidak di petak Penjara."]))) +
          S(
            "👑 Presiden",
            L([
              "<b>Pemilu</b> tiap 5 putaran. Tiap pemain memilih satu pemain lain (bukan diri sendiri). Suara Politisi ×2. Seri diundi dadu.",
              "Masa jabatan 5 putaran, maks 2 periode berturut-turut.",
              "Pemilih yang memilih pemenang dapat bonus Rp200.000 dari APBN.",
              "<b>Pasif</b>: gaji MULAI ×1,5 dan kebal pajak; kebal OTT dan tilang; ambil 20% dari setiap setoran ke Dana Bansos.",
              "<b>Kebijakan</b> (tombol 👑, 1× per putaran, pilih 1 dari 3 yang diundi): " + KB.map((x) => x[1] + " (" + x[2] + ")").join("; ") + ".",
              "<b>🕊️ Redam situasi</b> (di Program Pemerintah): menurunkan stress level " + RED.bump + " poin dengan biaya " + fm(RED.cost) + " dari kas Presiden (masuk Dana APBN). Efeknya meluruh sekitar 15% tiap putaran, bisa dipakai lagi setelah " + RED.cd + " putaran, dan hanya aktif saat stress ≥ " + RED.min + ".",
            ]),
          ) +
          S(
            "🔨 Lelang, BUMN & bandara",
            L([
              "<b>🔨 Lelang</b> (1 petak): satu properti yang belum terjual dipilih acak dan langsung dilelang ke semua pemain.",
              "<b>🏭 BUMN</b>: beli saham Rp2.000.000 (maks 3 per pemain, bayarannya masuk APBN). Pemegang saham menerima dividen Rp400.000 per saham tiap lewat MULAI; dividen turun mengikuti krisis ekonomi.",
              "<b>✈️ Bandara</b>: terbang gratis ke stasiun kereta mana pun, atau tetap di sini. Sewa berlaku bila stasiun milik pemain lain.",
            ]),
          ) +
          S(
            "🕶️ Kios Gelap (dulu Market)",
            L(
              [
                "Petak Market kini dikelola <b>Bandar</b> (NPC) dan bernama <b>Kios Gelap</b>. Buka setelah peran dibagikan (putaran 3). Tiap kunjungan menjual 4-5 barang; uang masuk <b>Kas Bandar</b>, bukan Dana APBN.",
                "<b>Rak 1</b> Lotre Receh (Rp250.000, selalu ada). <b>Rak 2</b> kartu abu-abu (Dadu Ganda, Asuransi Sewa, Diskon Properti, Bebas Pajak, Kupon Kesempatan). <b>Rak 3</b> barang terlarang (Kunci Bebas Penjara, Kebal Hukum, Sabotase): tiap beli menambah jejak korupsi 30% dari harga dan membuatmu diincar pion OTT. <b>Rak 4</b> kartu khusus peranmu. <b>Rak 5</b> barang baru Bandar.",
                "🎟️ <b>Lotre Receh</b>: gosok lapisan perak; tiga nominal sama berarti menang (×1,5 / ×3 / ×8 harga tiket). Yang dipajang: peluang menang 35%, rata-rata balik 87%. <b>Bandar menyesuaikan peluang menurut kebiasaan belimu.</b> Pemain baru (Tamu) diberi umpan manis, pelanggan tetap (Langganan) mendapat peluang yang dipajang, dan pelanggan berat (Pecandu) mendapat peluang paling ketat. Pemain jeli bisa mengakali (beli beberapa kali lalu berhenti), yang lengah yang rugi.",
                "Harga naik mengikuti fase kekacauan. Saat <b>razia</b> Bandar tiarap: harga +20%, promo hilang, maks 1 kartu dan 1 lotre per pemain per putaran. Bila kas Bandar menggemuk (>150% modal) razia akan datang lewat berita; bila kas menipis (<25% modal) Bandar kepepet dan semua pemain dapat peluang terketat. Bandar yang tumbang akan buka lagi dengan modal kecil setelah sekitar 8 putaran.",
                "Pilihan lain di Kios: <b>Lapor ke aparat</b> (imbalan APBN, berisiko dibalas), <b>jadi antek Bandar</b> (komisi, jejak korupsi naik). Presiden bisa menerima upeti atau menindak Bandar saat konfrontasi.",
                "Satu kartu per jenis. Kartu aktif dipakai kapan saja lewat 🏠 Aset atau langsung di Kios; kartu pasif terpakai otomatis. Kartu khusus peran hanya muncul bila kamu sudah punya peran.",
              ].concat(
                Object.values(CARD)
                  .filter((c) => c.rak !== 0)
                  .map((c) => c.i + " <b>" + c.n + "</b> (" + (c.hd ? "30% jejak, min " : "") + sh(c.p) + (c.r !== undefined ? ", " + ROLES[c.r].n : "") + "): " + c.d),
              ),
            ),
          ) +
          S(
            "📉 Level & krisis ekonomi",
            L(
              [
                "Pilih level saat mulai: " + LVL.map((l) => l.i + " " + l.n).join(", ") + ".",
                "Setelah putaran tertentu krisis dimulai dan naik satu tahap secara berkala. Tiap tahap: sewa & pajak naik berlipat, gaji MULAI turun (minimal 25%), dan semua pemain bayar PBB ke Dana APBN.",
                "Tiap tahap tertentu, pion OTT baru diterjunkan sampai batas maksimal level.",
              ].concat(LVL.map((l) => "<b>" + l.i + " " + l.n + "</b>: " + lvd(l))),
            ),
          ) +
          S(
            "🏛️ Aset negara: sita & beli paksa",
            L([
              "<b>Pembelian paksa</b> (Proyek Strategis Nasional): negara mengambil 1 properti acak. Pemilik menerima ganti rugi 1,25× harga + nilai bangunan (dikurangi nilai gadai). Muncul lewat kartu, berita nasional, atau kebijakan Presiden.",
              "<b>Penyitaan</b>: kasus korupsi (kartu OTT KPK atau korupsi terdeteksi, bila benar-benar masuk penjara), kartu pengemplang pajak, atau berita Satgas BLBI. Properti termahal disita tanpa ganti rugi.",
              "Properti jadi <b>aset negara</b> (tanda 🏛️ di petak). MBG dibubarkan, rumah/hotel tetap berdiri, tidak bisa digadai atau didagangkan.",
              "<b>Semua sewa</b> aset negara masuk <b>Dana APBN</b> (Presiden ambil 20%), bukan ke pemain. Kas ini bisa digelapkan lewat petak KORUPSI.",
              "<b>🧮 Fiskal otomatis (logika fuzzy)</b>: tiap awal putaran negara menilai cakupan kas APBN terhadap insentif MBG dan beban tunggakan. Hasilnya tingkat pengetatan (normal, ringan, sedang, ketat) yang menaikkan pajak (maks ×1,6) dan sewa aset negara (maks ×1,4), serta memangkas potongan Presiden (maks setengahnya). Bergerak bertahap, dan kembali normal otomatis saat kas APBN pulih.",
              "Aset negara menghalangi set warna: tidak ada pemain yang bisa melengkapi set jika satu petaknya dimiliki negara.",
            ]),
          ) +
          S("🤝 Dagang & lelang", L(["Tombol 🤝 Dagang: tukar properti dan uang dengan pemain lain. Mitra bisa terima atau tolak.", "Lelang: kenaikan tawaran 10% harga; pemain boleh mundur kapan saja."])) +
          '<p style="font-size:12px;color:var(--mut);margin:14px 4px">Ikon: <a href="https://nieobie.itch.io/free-icons" target="_blank" rel="noopener">Game Icon Pack</a> oleh Nieobie (CC0).</p>'
        );
      };
      const gb = $("#gb"),
        gt = $("#gtab"),
        gOpen = (o) => {
          if (o) $("#gc").innerHTML = GD();
          gb.classList.toggle("o", o);
          gb.setAttribute("aria-hidden", String(!o));
          gt.setAttribute("aria-expanded", String(o));
          (o ? $("#gx") : gt).focus();
        };
      gt.onclick = () => gOpen(true);
      $("#gx").onclick = () => gOpen(false);
      document.addEventListener("keydown", (e) => {
        if (e.key == "Escape" && gb.classList.contains("o")) gOpen(false);
      });
      {
        let t;
        const b = $("#ng");
        b.onclick = () => {
          if (b.classList.contains("arm")) {
            clearTimeout(t);
            clearSave();
            location.reload();
            return;
          }
          b.classList.add("arm");
          b.textContent = "⚠️ Yakin? Klik lagi";
          t = setTimeout(() => {
            b.classList.remove("arm");
            b.textContent = "🔄 Game Baru";
          }, 3500);
        };
      }
