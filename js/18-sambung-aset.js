/* ===== 18-sambung-aset.js: menyambungkan aset PNG (assets-visual.js/css) ke game =====
   - ikon petak & pion bawaan diganti PNG
   - aura pion OTT saat dekat pemain berjejak korupsi
   - efek layar (breaking news, razia, Kios tumbang, lampu Kios) dipicu dengan memantau state game,
     tanpa mengubah alur game. Semua langkah dibungkus guard: aset gagal dimuat tidak boleh mematikan game. */
(() => {
  const guard = (fn) => {
    try {
      return fn();
    } catch (e) {
      console.warn("[aset]", e);
    }
  };

  /* ---- ikon petak (petak dibuat sekali di 03-tampilan.js, jadi cukup sekali) ---- */
  const TILE_ICO = { go: "start", jl: "penjara", mk: "mk", c: "kesempatan", x: "pajak", fp: "amplop" };
  function ikonPetak() {
    T.forEach((t, i) => {
      const k = TILE_ICO[t.t];
      const host = k && document.querySelector("#t" + i + " .in i");
      if (host && !host.querySelector(".fx-ico")) host.innerHTML = '<u class="fx-ico ' + k + ' fx-tile"></u>';
    });
  }

  /* ---- pion: SVG bawaan diganti PNG tiap kali PINS() membuat elemen baru ---- */
  const dekatKorup = (pol) => P.some((q) => !q.x && (q.kor || 0) > 0 && Math.min((q.pos - pol.pos + NN) % NN, (pol.pos - q.pos + NN) % NN) <= 6);
  if (typeof PINS == "function") {
    const _PINS = PINS;
    PINS = function () {
      const r = _PINS.apply(this, arguments);
      guard(() =>
        PINEL.forEach((el, p) => {
          const isPol = POLS.includes(p);
          let d = el.firstElementChild;
          if (!d || !d.classList.contains("fx-pion")) {
            const n = isPol ? 0 : P.indexOf(p) + 1;
            const nd = document.createElement("div");
            nd.className = "fx-pion pn-fx " + (isPol ? "ott" : "p" + Math.min(6, Math.max(1, n)));
            nd.setAttribute("aria-hidden", "true");
            if (d) el.replaceChild(nd, d);
            else el.appendChild(nd);
            d = nd;
          }
          if (isPol) d.classList.toggle("dekat", dekatKorup(p));
        }),
      );
      return r;
    };
  }

  /* ---- efek layar: pantau state game tiap 0,6 dtk ---- */
  const S = { news: typeof NW != "undefined" ? NW.last : "", razia: false, tutup: false, cur: -1, pos: -1 };
  setInterval(() => {
    if (document.hidden || typeof SimFX == "undefined") return;
    guard(() => {
      if (typeof NW != "undefined" && NW.last && NW.last !== S.news) {
        S.news = NW.last;
        SimFX.breaking(NW.last);
      }
      if (typeof bandar != "undefined") {
        const razia = !!bandar.tiarap,
          tutup = bandar.rebootSetelah != null;
        if (razia && !S.razia) SimFX.skandal("Razia! Kios Gelap tiarap");
        if (tutup && !S.tutup) SimFX.skandal("Bandar tumbang! Kios Gelap tutup");
        S.razia = razia;
        S.tutup = tutup;
      }
      const p = typeof cur == "number" ? P[cur] : null;
      if (p) {
        if (S.cur === cur && S.pos !== p.pos && T[p.pos] && T[p.pos].t == "mk") SimFX.mkLampu(p.pos);
        S.cur = cur;
        S.pos = p.pos;
      }
    });
  }, 600);

  guard(ikonPetak);
  guard(render);
})();
