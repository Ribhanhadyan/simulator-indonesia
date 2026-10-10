<div align="center">

# 🎲 Monopoli Indonesia

**Permainan papan Monopoli bertema Indonesia dengan sistem ekonomi dinamis, karier, pemilu presiden, dan multiplayer P2P.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🎮 Mainkan Sekarang](https://your-username.github.io/monopoli-indonesia/) · [🐛 Laporkan Bug](https://github.com/your-username/monopoli-indonesia/issues) · [✨ Minta Fitur](https://github.com/your-username/monopoli-indonesia/issues)

</div>

---

## 📖 Tentang Proyek

**Monopoli Indonesia** adalah adaptasi digital dari permainan papan klasik Monopoli, dikembangkan sepenuhnya dengan **HTML, CSS, dan JavaScript murni** — tanpa framework, tanpa build tool, tanpa dependensi eksternal. Cukup buka file HTML-nya di browser dan mulai bermain.

Game ini membawa nuansa Indonesia melalui:

- 🏙️ **44 petak** berisi kota-kota Indonesia (Medan, Jakarta, Bali, IKN Nusantara, dll.)
- 🎭 **16 peran karier** (Politisi, PNS, Dokter, Petani, Content Creator, dll.) dengan efek unik
- 📰 **Berita ekonomi dinamis** yang mengubah sewa, gaji, dan bunga bank
- 👑 **Sistem pemilu presiden** dengan kebijakan eksklusif
- 📉 **Krisis ekonomi bertahap** yang menaikkan tensi permainan
- 👮 **Pion OTT** yang berpatroli dan bisa menangkap pemain
- 🌐 **Multiplayer P2P** menggunakan WebRTC (via Sparrow-RTC) tanpa server pusat

---

## ✨ Fitur Utama

### 🎯 Gameplay
- **Papan 44 petak** dengan 8 grup warna (A–H), stasiun kereta, dan utilitas
- **Sistem rumah & hotel** dengan aturan pembangunan merata dalam satu grup warna
- **Sistem gadai & tebus** properti (50% / 55% dari harga beli)
- **Pinjaman bank** dengan plafon dinamis, tenor 5/10 giliran, dan suku bunga mengikuti BI
- **Lelang otomatis** untuk properti yang tidak dibeli
- **Dana Bansos APBN** yang mengumpulkan semua pajak & denda

### 🎭 Sistem Karier & Peran
- **16 peran** dengan kemampuan pasif berbeda — dari gaji multiplier hingga imunitas hukum
- Peran diganti secara acak setiap mendarat di petak **Karier & Peran**
- Interaksi antar pemain di petak yang sama (serangan fajar, tilang, duel dadu, kolaborasi viral)

### 👑 Politik & Pemerintahan
- **Pemilu setiap 5 putaran** — suara Politisi dihitung ×2
- **Presiden** mendapat gaji ×1,5, kebal pajak, dan ambil 20% dari setiap setoran APBN
- **5 kebijakan presiden** (bansos massal, naikkan pajak, atur bunga BI, amnesti, PSN)

### 📉 Ekonomi Dinamis
- **Berita ekonomi** muncul tiap 3 putaran (inflasi, resesi, harga emas, harga BBM)
- **Krisis ekonomi bertahap** — sewa naik, gaji turun, PBB wajib, pion OTT bertambah
- **3 level kesulitan**: 🌴 Santai · ⚖️ Sedang · 💀 Kejam

### 👮 Penegakan Hukum
- **Pion OTT** berpatroli tiap akhir putaran
- Pemain yang tertangkap bisa **menyuap** (15% kas) atau **masuk penjara**
- **Kartu Kesempatan & Dana Umum** berisi 100+ peristiwa khas Indonesia

### 🌐 Multiplayer P2P
- **Host-authoritative** via WebRTC — host memegang state, tamu mengirim aksi
- **Tanpa server pusat** — hanya perlu signaling server (gratis dari Sparrow-RTC)
- **Invite code** untuk bergabung ke sesi teman
- **Penonton mode** jika pemain penuh
- **Bot otomatis** mengambil alih pemain yang terputus

### 📊 Statistik & Analitik *(dalam pengembangan)*
- Papan peringkat live berdasarkan kekayaan bersih
- Grafik tren kekayaan per pemain
- Timeline keputusan & momen kritis

### 🎨 UI/UX
- **Responsif** — desktop, tablet, dan mobile dengan tata letak adaptif
- **Dark mode** otomatis mengikuti sistem
- **Auto-save** ke `localStorage` — lanjutkan permainan kapan saja
- **Buku panduan** terintegrasi (tombol 📖)
- **Animasi halus** dengan dukungan `prefers-reduced-motion`

---

## 🚀 Cara Bermain

### Mode Singleplayer (Offline)
1. Unduh atau clone repository ini
2. Buka `index.html` di browser modern (Chrome, Firefox, Safari, Edge)
3. Pilih jumlah pemain, level kesulitan, dan nama pemain
4. Mulai bermain!

### Mode Multiplayer (Online)
1. **Host**: buka game → klik tombol **🌐 Online** → salin invite code
2. **Guest**: buka game yang sama → masukkan invite code di URL dengan format:
https://your-domain.com/#join=INVITE_CODE
3. Host membagikan tautan ke teman → teman langsung masuk ke sesi

> **Catatan**: Multiplayer memerlukan koneksi HTTPS (kecuali `localhost`).

---

## 🛠️ Instalasi & Deployment

### Menjalankan Secara Lokal
```bash
# Clone repository
git clone https://github.com/your-username/monopoli-indonesia.git
cd monopoli-indonesia

# Buka file HTML langsung di browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
