/* Tes otomatis kartu & papan. Jalankan dari folder proyek:  node tools/tes-kartu.js
   Memeriksa: tujuan kartu "Maju ke" valid, teks kartu = Efek = uang yang dibayar untuk SEMUA peran,
   dan kartu menuju Kios Gelap benar-benar mendarat di petak Kios Gelap. */
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.resolve(__dirname, "..");
const noop = () => {};
const el = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : el), apply: () => el, set: () => true });
const ctx = vm.createContext({
  document: { querySelector: () => el, querySelectorAll: () => [], createElement: () => el, getElementById: () => el, addEventListener: noop, documentElement: el, body: el },
  window: {}, navigator: {}, localStorage: { getItem: () => null, setItem: noop }, location: { search: "", hash: "" },
  setTimeout, clearTimeout, console, Math, Date, JSON, Object, Array, String, Number, RegExp, Promise, Set, Map,
});
ctx.window = ctx;
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, "js", f), "utf8"), ctx, { filename: f });
for (const f of ["01-fiskal.js", "02-data-game.js", "06-bank-peran.js", "08-pengaturan.js"]) {
  try { load(f); } catch (e) { console.error("GAGAL memuat " + f + ": " + e.message); process.exit(2); }
}
const get = (expr) => vm.runInContext(expr, ctx);
const T = get("T"), CH = get("CH"), CC = get("CC"), ROLES = get("ROLES"), K = get("K");
let gagal = 0;
const cek = (ok, msg) => { if (!ok) { gagal++; console.log("  ✗ " + msg); } };

console.log("1) Tujuan kartu 'Maju ke ...'");
const idx = (n) => T.findIndex((t) => t.n === n);
for (const [deck, nm] of [[CH, "Kesempatan"], [CC, "Dana Umum"]])
  for (const c of deck) if (c[1] === "g") {
    cek(Number.isInteger(c[2]) && c[2] >= 0 && c[2] < T.length, nm + ': "' + c[0] + '" tujuan tidak valid (' + c[2] + ")");
    const nama = c[0].replace(/^.*maju ke /i, "").replace(/\. .*$/, "");
    const cocok = T[c[2]] && (T[c[2]].n === nama || /MULAI/i.test(nama) && T[c[2]].t === "go");
    cek(cocok, nm + ': "' + c[0] + '" mendarat di ' + (T[c[2]] && T[c[2]].n));
  }
cek(CH.some((c) => c[1] === "g" && T[c[2]] && T[c[2]].t === "mk"), "tidak ada kartu menuju Kios Gelap");

console.log("2) Teks kartu = Efek = pembayaran (semua peran x semua kartu uang)");
get("var __p = null");
let n = 0;
const roleIdx = [-1, ...ROLES.map((_, i) => i)];
for (const r of roleIdx) for (const gk of [0, 1]) for (const c of [...CH, ...CC].filter((c) => c[1] === "m")) {
  const p = { role: r, gk };
  ctx.__p = p; ctx.__c = c;
  const nom = get("kartuNom(__p, __c)"), teks = get("kartuTeks(__p, __c)"), role = get("R(__p)");
  const m = teks.match(/Rp([\d.]+)/);
  const tampil = m ? Number(m[1].replace(/\./g, "")) : NaN;
  const kes = c[2] < 0 ? get("cm(__p, __c[0])") : role.cg;
  const sehat = /dokter|sakit|vaksin|kesehatan|BPJS|kecelakaan/i.test(c[0]);
  const harap = c[2] < 0 && gk && sehat ? 0 : Math.round((Math.abs(c[2]) * K * kes) / 1e3) * 1e3;
  n++;
  cek(nom && nom.amt === harap, '"' + c[0] + '" peran ' + r + ": nominal " + (nom && nom.amt) + " != " + harap);
  cek(tampil === harap, '"' + c[0] + '" peran ' + r + ": teks menampilkan " + tampil + ", seharusnya " + harap);
  cek(nom.free === (c[2] < 0 && !!gk && sehat), '"' + c[0] + '" peran ' + r + ": status gratis salah");
}
console.log("   " + n + " kombinasi diperiksa");
console.log(gagal ? "\nGAGAL: " + gagal + " masalah" : "\nSEMUA LOLOS ✔");
process.exit(gagal ? 1 : 0);
