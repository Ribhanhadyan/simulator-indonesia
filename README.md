<div align="center">

# 🎲 Simulator Indonesia

**Game papan bergaya game papan properti bertema Indonesia dengan ekonomi dinamis, karier, pemilu presiden, APBN, dan pion OTT.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)

[🎮 Mainkan Sekarang](https://ribhanhadyan.github.io/simulator-indonesia/) · [🐛 Laporkan Bug](https://github.com/ribhanhadyan/simulator-indonesia/issues) · [✨ Minta Fitur](https://github.com/ribhanhadyan/simulator-indonesia/issues)

</div>

---

## 📖 Tentang Proyek

**Simulator Indonesia** adalah adaptasi permainan papan properti yang dibuat sepenuhnya dengan **HTML, CSS, dan JavaScript murni**: tanpa framework, tanpa build step, tanpa dependensi untuk dijalankan. Buka `index.html` di browser dan mulai bermain.

Nuansa Indonesia hadir lewat:

- 🏙️ **44 petak** berisi kota-kota Indonesia (Medan sampai IKN Nusantara), stasiun, dan utilitas
- 🎭 **16 peran karier** (Politisi, PNS, Dokter, Petani, Content Creator, dan lainnya) dengan kemampuan unik
- 📰 **Berita nasional** bersambung yang mengubah sewa, gaji, dan bunga bank
- 👑 **Pemilu presiden** dengan kebijakan eksklusif
- 🏛️ **Dana APBN**, PPh 21 progresif, dan penyesuaian fiskal otomatis berbasis logika fuzzy
- 📉 **Krisis ekonomi bertahap** yang menaikkan tensi permainan
- 👮 **Pion OTT** yang memburu pemain berjejak korupsi

---

## ✨ Fitur Utama

### 🎯 Papan & Properti
- **44 petak**: 8 grup warna (A–H), 2 stasiun kereta, utilitas (PLN, PDAM), dan petak khusus
- **Petak khusus**: Kesempatan, Dana Umum, Karier & Peran, Tambang Emas, KORUPSI, Penjara, Lelang, Kios Gelap (dulu Market), BUMN, Bandara, Pajak Penghasilan, dan Pajak Barang Mewah
- **Rumah & hotel**: bangun merata dalam satu grup warna, kapan saja lewat tombol 🏠 Aset
- **Gadai 50% dan tebus 55%**, lelang, dan dagang antar pemain
- **🍱 MBG**: unit khusus pada properti kota. Insentifnya dibayar dari Dana APBN; bila kas habis negara meminjam ke bank, dan kekurangan di atas plafon menjadi tunggakan negara
- **🔨 Lelang, 🏭 BUMN (saham & dividen), dan ✈️ Bandara** (terbang gratis ke stasiun mana pun)

### 💰 Ekonomi & Fiskal
- **PPh 21** atas gaji MULAI dengan tarif progresif UU HPP (dikurangi PTKP)
- **Dana APBN** menampung pajak dan denda, dimulai dari **Rp100.000.000**. Belanja di Kios Gelap masuk **Kas Bandar**, bukan APBN
- **👔 Gaji pemerintahan**: gaji MULAI **Presiden, Politisi, PNS, dan TNI/Polri** dibayar dari Dana APBN (PPh 21 kembali ke APBN)
- **🏦 Utang negara**: saat kas APBN habis, negara **meminjam ke bank** untuk gaji pemerintahan, insentif MBG, dan cicilan Kopdes (plafon Rp100.000.000, bunga 2% per putaran mengikuti suku bunga BI). Kas di atas Rp20.000.000 otomatis melunasi utang. Di atas plafon, kekurangan menjadi tunggakan negara
- Pengambilan "persen dari kas APBN" (petak KORUPSI, dua kartu Kios Gelap, bansos) dibatasi **Rp5.000.000** (`PCT_MAKS` di `js/01-fiskal.js`) agar tetap wajar saat kas APBN besar
- **🧮 Fiskal otomatis (logika fuzzy)**: tingkat pengetatan dihitung dari kas APBN dan tunggakan negara, lalu menaikkan pajak (maks ×1,6) dan sewa aset negara (maks ×1,4)
- **Bank**: plafon pinjaman Rp5 juta + 50% nilai properti, tenor 5 giliran (bunga 4%) atau 10 giliran (3%), bunga mengikuti berita, peran, dan kebijakan presiden
- **📰 Berita nasional** yang menyesuaikan kondisi permainan, dengan tingkat kekacauan 0–100% dalam lima fase
- **📉 Krisis ekonomi bertahap** menurut level: 🌴 Santai, ⚖️ Sedang, 💀 Kejam. Sewa dan pajak naik, gaji turun, ada PBB, dan pion OTT bertambah

### 🎭 Peran & Politik
- **16 peran**: Politisi, PNS, Ulama, Karyawan Swasta, Pegawai BUMN, Pengusaha, Petani, Content Creator, Nelayan, Guru, Dokter, TNI/Polri, Pengacara, Atlet, Seniman, dan Programmer
- Peran acak otomatis diberikan setelah 2 putaran pertama, lalu berganti tiap mendarat di petak **Karier & Peran**
- **Interaksi satu petak** antar pemain (serangan fajar, konsultasi, sewa jasa, tilang, kolaborasi, duel dadu)
- **Pemilu presiden** tiap 5 putaran (suara Politisi ×2, maksimal 2 periode berturut-turut)
- **Presiden**: gaji ×1,5, kebal pajak, OTT, dan tilang, serta mengambil 20% setoran APBN
- **5 kebijakan presiden**: Bansos massal, Naikkan pajak, Atur bunga BI, Amnesti, dan Proyek Strategis Nasional

### 👮 Penegakan Hukum & Aset Negara
- **Pion OTT** berpatroli tiap akhir putaran dan hanya menangkap pemain yang punya jejak korupsi (dari petak KORUPSI atau kartu Amplop DPR). Tersangka bisa **menyuap (15% kas)** atau masuk penjara
- **Pembelian paksa (PSN)** dan **penyitaan** mengubah properti menjadi **aset negara** 🏛️. Sewanya masuk Dana APBN, bukan ke pemain
- **Kartu Kesempatan & Dana Umum** berisi lebih dari 100 peristiwa khas Indonesia

### 🕶️ Kios Gelap (Market yang Dikelola Bandar)
- Petak Market (tipe `mk` tetap, agar simpanan lama terbaca) kini bernama **Kios Gelap** dan dikelola **Bandar** (NPC). Buka setelah peran dibagikan (putaran 3). Uang belanja masuk **Kas Bandar**
- **Lewat vs injak**: cukup melewati petak Kios Gelap sudah bisa belanja (harga normal). Berhenti tepat di petaknya memberi bonus acak: diskon 30% semua barang, atau satu barang spesial −50%
- Tiap kunjungan menjual 4–5 barang dalam lima rak: **Lotre Receh** (selalu ada, Rp250.000), kartu abu-abu (Dadu Ganda, Asuransi Sewa, Diskon Properti, Bebas Pajak, Kupon Kesempatan), barang terlarang (Kunci Bebas Penjara, Kebal Hukum, Sabotase; menambah jejak korupsi 30% dari harga), kartu khusus peran, dan barang baru (Uang Tutup Mulut, Cuci Uang, Informan OTT, Bocoran Berita)
- **Satire**: Bandar membaca kebiasaan belimu. Pemain naik tier *Tamu → Langganan → Pecandu* dan peluang lotre bergeser dari umpan ke panen. Yang dipajang hanya tabel Langganan (balik ±87%); tabel sesungguhnya tersembunyi per pemain
- Bandar punya dinamika sendiri: setoran ke oknum, kupon pancing balik, razia saat kas menggemuk (>150% modal), mode kepepet saat kas menipis (<25%), tiga akhir konfrontasi (negara menang, Bandar menang, perang oknum), dan reboot dengan modal kecil setelah 8 putaran
- Pilihan pemain: pemburu umpan, pelapor, antek Bandar, Presiden (terima upeti atau tindak Bandar), atau disiplin tidak membeli
- Ringkasan akhir menampilkan total belanja lotre dan total hadiah lotre tiap pemain

### ⚙️ Pengaturan & UX
- **2–4 pemain**, tiap slot bisa **Manusia** atau **Bot** (hot-seat di satu perangkat)
- **Aturan awal**: uang awal (Rp10 jt / Rp15 jt / Rp25 jt), MBG, krisis ekonomi, batas putaran (tanpa batas / 30 / 50 / 80), gaya bot (Seimbang, Agresif, Konservatif), dan kecepatan animasi
- Dengan batas putaran, **pemain terkaya** (kas + aset − utang) menang. Tanpa batas, pemenangnya pemain terakhir yang tidak bangkrut
- **Ringkasan akhir permainan** berisi kekayaan bersih, sewa diterima, berapa kali masuk penjara, dan aset yang disita negara
- **Simpan otomatis** ke `localStorage` tiap awal giliran, jadi permainan bisa dilanjutkan
- **Tema** otomatis, terang, atau gelap, serta efek suara
- **Pintasan keyboard**: `Spasi` lempar dadu, `A` Aset, `B` Bank, `D` Dagang, `K` Kebijakan presiden
- **Responsif** untuk desktop, tablet, dan HP (dengan zoom papan), serta dukungan `prefers-reduced-motion`
- **📖 Buku panduan** terintegrasi yang dibuat langsung dari data game, jadi selalu sama dengan aturan terbaru

---

## 🚀 Cara Bermain

1. Unduh atau clone repository ini
2. Buka `index.html` di browser modern (Chrome, Firefox, Safari, Edge)
3. Pilih jumlah pemain, tingkat kesulitan, aturan awal, dan nama pemain
4. Lempar dadu dan mulai bermain!

> **Multiplayer Online sedang dimatikan.** Kodenya (WebRTC via Sparrow-RTC, host-authoritative) masih ada di `js/13-multiplayer.js`. Lihat bagian [Catatan Penting](#-catatan-penting) untuk mengaktifkannya kembali.

---

## 🛠️ Menjalankan & Deployment

### Secara Lokal
```bash
git clone https://github.com/ribhanhadyan/simulator-indonesia.git
cd simulator-indonesia

# Buka langsung di browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux

# Atau jalankan server statis
python3 -m http.server 8000
```

### GitHub Pages
Letakkan semua file di root repository, lalu aktifkan **Settings → Pages → Deploy from a branch** (branch `main`, folder `/root`).

---

## 📁 Struktur Proyek

```
index.html   kerangka halaman (sprite ikon SVG + markup #app, menu, modal)
css/         gaya, dimuat berurutan 01 → 12
js/          logika, dimuat berurutan 01 → 15
```

<details>
<summary><b>css/</b></summary>

| File | Isi |
|---|---|
| 01-tokens | variabel desain (warna, ukuran) |
| 02-base | reset dan gaya dasar |
| 03-layout | kerangka halaman, header, menu sistem, tombol Trakteer |
| 04-board | papan permainan |
| 05-panel | panel samping |
| 06-modal | modal / bottom sheet |
| 07-guide | buku panduan |
| 08-online | panel Online (multiplayer) |
| 09-mobile | aturan layar HP (<760px) |
| 10-desktop | aturan desktop dan tablet landscape |
| 11-market | gaya Kios Gelap (kartu & lotre) |
| 12-icons | gaya ikon SVG |

</details>

<details>
<summary><b>js/</b></summary>

| File | Isi |
|---|---|
| 01-fiskal | PPh 21, APBN, logika fuzzy penyesuaian fiskal |
| 02-data-game | data petak, kartu, peristiwa, state pemain |
| 03-tampilan | render papan, info petak, dialog `ask` |
| 04-aset | kelola aset, gaji, likuidasi, bot |
| 05-berita | mesin berita nasional |
| 06-bank-peran | bank/pinjaman, peran, korupsi, polisi, tambang |
| 07-transaksi | trade, cicilan, pembayaran, bangkrut, level & krisis |
| 08-pengaturan | aturan awal, simpan/muat, tema, `boot()` |
| 09-market | Kios Gelap: rak, kartu kemampuan, lotre |
| 10-permainan | lelang, pergerakan, pendaratan, pemilu, kebijakan presiden, giliran |
| 11-interaksi | klik papan dan tombol aksi |
| 12-panduan | buku panduan |
| 13-multiplayer | fitur Online (dimatikan, lihat `MP_ENABLED`) |
| 14-ikon-emoji | konversi emoji menjadi ikon SVG |
| 15-ux | tema, suara, keyboard, zoom, aksesibilitas |
| 16-replay | replay cepat dan titik balik |
| 17-bandar | Bandar: state, tier pelanggan, tick akhir putaran, arc razia |

</details>

---

## 📌 Catatan Penting

- File `js/01` sampai `js/15` berbagi scope global, jadi **urutan `<script>` di `index.html` tidak boleh diubah**.
- Menambah file baru: buat file di `js/` atau `css/`, lalu daftarkan di `index.html` pada posisi yang sesuai.
- Indentasi file JS masih mengikuti format lama (6 spasi). Untuk merapikan: `npx prettier --write js css`.
- **Mengaktifkan multiplayer Online**: ubah `MP_ENABLED` jadi `true` di `js/13-multiplayer.js` dan hapus aturan `#mpb` di `css/03-layout.css`. Multiplayer butuh HTTPS (kecuali `localhost`) dan memuat `sparrow-rtc` dari esm.sh.
- Kunci `localStorage`: simpanan permainan (`monopoli-id-save`), tema (`monopoli-id-theme`), suara (`monopoli-id-snd`), dan zoom (`monopoli-id-zoom`).
- Font (Oswald dan Plus Jakarta Sans) dimuat dari Google Fonts.

---

## 🙏 Kredit

- Ikon: [Game Icon Pack](https://nieobie.itch.io/free-icons) oleh Nieobie (CC0)
- Dukung pengembang: [☕ Trakteer](https://trakteer.id/wi2qdwl5mqp5bjjqumjl/tip)


---

## ⚡ Catatan Performa & Stabilitas

- **Muat ulang / "Main Lagi" cepat**: `sw.js` memakai strategi *cache dulu, perbarui di latar belakang* (sebelumnya semua file menunggu jaringan). Naikkan `CACHE` di `sw.js` setiap kali merilis versi baru.
- **Font Google tidak lagi memblokir tampilan** (dimuat non-blocking, ada fallback sistem).
- `render()` dan `say()` hanya menulis DOM bila isinya berubah; konverter emoji → ikon memproses mutasi per frame.
- **Mode efek otomatis ringan** di perangkat lemah (RAM/CPU kecil atau hemat data): tanpa canvas partikel, blend-mode layar penuh, dan blur.
- `js/19-stabil.js`: galat beruntun memunculkan bilah "Muat ulang" (progres tetap tersimpan), dan animasi CSS dijeda saat tab di latar belakang.
