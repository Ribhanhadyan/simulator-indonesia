/* ===== UX layer v2: sinkronisasi tampilan, zoom papan, suara, keyboard, aksesibilitas ===== */
(() => {
  const q = (s) => document.querySelector(s),
    qa = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const RM = matchMedia("(prefers-reduced-motion:reduce)");
  const store = {
    get: (k) => {
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    },
  };
  const ovl = q("#ov"),
    mdl = q("#mod"),
    gbx = q("#gb");

  /* ---------- Menu sistem ---------- */
  const mb = q("#menuBtn"),
    sm = q("#sysmenu");
  const menu = (o) => {
    sm.hidden = !o;
    mb.setAttribute("aria-expanded", String(o));
  };
  mb.addEventListener("click", (e) => {
    e.stopPropagation();
    menu(sm.hidden);
  });
  document.addEventListener("click", (e) => {
    if (!sm.hidden && !e.target.closest("#sysmenu")) menu(false);
  });
  ["#stg", "#mpb"].forEach((s) => q(s).addEventListener("click", () => menu(false)));

  /* ---------- Tema: sinkronkan theme-color browser ---------- */
  const metaTC = () => {
    let m = q("meta[name=theme-color]");
    if (!m) {
      m = document.createElement("meta");
      m.name = "theme-color";
      document.head.appendChild(m);
    }
    m.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#dde7d8";
  };
  q("#thm").addEventListener("click", () => requestAnimationFrame(metaTC));
  matchMedia("(prefers-color-scheme:dark)").addEventListener?.("change", metaTC);

  /* ---------- Suara (opsional, bisa dimatikan) ---------- */
  let ac = null,
    snd = store.get("monopoli-id-snd") !== "0";
  const sbtn = q("#snd");
  const paintSnd = () => {
    sbtn.textContent = snd ? "🔊" : "🔇";
    sbtn.dataset.l = snd ? "Suara: nyala" : "Suara: mati";
    sbtn.title = sbtn.dataset.l;
    sbtn.setAttribute("aria-label", sbtn.dataset.l);
  };
  const AC = () => {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
    if (ac && ac.state === "suspended") ac.resume();
    return ac;
  };
  const tone = (f, d, type, g, at, to) => {
    if (!ac || !snd) return;
    const t = ac.currentTime + (at || 0),
      o = ac.createOscillator(),
      v = ac.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    v.gain.setValueAtTime(0.0001, t);
    v.gain.exponentialRampToValueAtTime(g || 0.05, t + 0.012);
    v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(v);
    v.connect(ac.destination);
    o.start(t);
    o.stop(t + d + 0.03);
  };
  const noise = (d, g) => {
    if (!ac || !snd) return;
    const n = Math.floor(ac.sampleRate * d),
      b = ac.createBuffer(1, n, ac.sampleRate),
      a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(),
      f = ac.createBiquadFilter(),
      v = ac.createGain();
    s.buffer = b;
    f.type = "bandpass";
    f.frequency.value = 1800;
    v.gain.value = g;
    s.connect(f);
    f.connect(v);
    v.connect(ac.destination);
    s.start();
  };
  const SFX = {
    click: () => tone(540, 0.05, "triangle", 0.035),
    step: () => tone(250 + Math.random() * 50, 0.05, "square", 0.018),
    dice: () => noise(0.08, 0.07),
    up: () => {
      tone(784, 0.09, "triangle", 0.05);
      tone(1175, 0.18, "triangle", 0.05, 0.08);
    },
    dn: () => tone(330, 0.18, "sawtooth", 0.03, 0, 190),
    turn: () => tone(660, 0.12, "sine", 0.04),
    pop: () => tone(440, 0.07, "triangle", 0.03, 0, 660),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, "triangle", 0.06, i * 0.12)),
  };
  const play = (n) => {
    if (snd && ac && ac.state === "running" && SFX[n]) SFX[n]();
  };
  sbtn.addEventListener("click", () => {
    snd = !snd;
    store.set("monopoli-id-snd", snd ? "1" : "0");
    paintSnd();
    if (snd) {
      AC();
      play("click");
    }
  });
  ["pointerdown", "keydown"].forEach((ev) =>
    addEventListener(
      ev,
      () => {
        if (snd) AC();
      },
      { passive: true },
    ),
  );
  document.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest && e.target.closest("button");
      if (b && !b.disabled && e.isTrusted && b.id !== "snd") play("click");
    },
    true,
  );
  {
    let first = 1;
    new MutationObserver(() => {
      if (first) {
        first = 0;
        return;
      }
      play("dice");
    }).observe(q("#dice"), { childList: true });
  }

  /* ---------- Modal: aksesibilitas, fokus, tombol sekunder ---------- */
  let back = null;
  const GH = /^(Lewati|Tolak|Batal|Tutup|Mundur|Menyerah|Tetap|Tunda|Skip)/i;
  const ACT = /^[^A-Za-z0-9]*(Beli|Bayar|Terima|Lelang|Kelola|Suap|Gali|Lempar|OK|Tawar|Sewa|Pakai|Ajukan|Mulai|Lanjut|Selesai|Tutup|Main|Lunasi|Pinjam|Jual|Ya)\b/i;
  /* ---------- Kecilkan kartu: lihat papan dulu tanpa menutup kartu ----------
           Overlay tetap "terbuka" (ov.hidden = false) supaya klik papan/tombol tetap terblokir dan
           pilihan kartu (Beli/Lelang, dst.) tetap menunggu; hanya tampilannya yang dikecilkan. */
  const pill = document.createElement("button");
  pill.id = "modmin";
  pill.type = "button";
  pill.hidden = true;
  document.body.appendChild(pill);
  const setMin = (on) => {
    if (on && ovl.hidden) return;
    ovl.classList.toggle("min", on);
    pill.hidden = !on;
    if (on) {
      const h = mdl.querySelector("h3");
      pill.textContent = "Buka kartu" + (h ? " · " + h.textContent.trim() : "");
      pill.focus({ preventScroll: true });
    } else {
      pill.textContent = "";
      if (!ovl.hidden) {
        try {
          mdl.focus({ preventScroll: true });
        } catch (e) {}
      }
    }
  };
  pill.addEventListener("click", () => setMin(false));
  const addMin = (h) => {
    if (h.querySelector(".mn")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mn";
    b.tabIndex = -1;
    b.title = "Kecilkan kartu untuk melihat papan (Esc)";
    b.setAttribute("aria-label", "Kecilkan kartu");
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      setMin(true);
    });
    h.classList.add("hmn");
    h.appendChild(b);
  };
  /* kartu baru / kartu ditutup = kembali ke tampilan penuh */
  new MutationObserver(() => {
    if (ovl.classList.contains("min")) setMin(false);
  }).observe(mdl, { childList: true });
  new MutationObserver(() => {
    if (ovl.hidden && ovl.classList.contains("min")) setMin(false);
  }).observe(ovl, { attributes: true, attributeFilter: ["hidden"] });

  /* tombol pertama = aksi utama (merah), kecuali jendela pilihan (jumlah pemain, level, daftar stasiun, dst.) */
  const decorate = () => {
    qa("#mod .mb").forEach((m) => {
      const bs = [...m.querySelectorAll("button")],
        ch = !bs.some((b) => ACT.test(b.textContent.trim()));
      m.classList.toggle("choice", ch);
      m.classList.toggle("stack", bs.length > 3 || bs.some((b) => b.textContent.trim().length > 24));
      bs.forEach((b, i) => {
        b.classList.toggle("pri", (!ch && i === 0) || /^Beli /.test(b.textContent.trim()));
        if (GH.test(b.textContent.trim())) b.classList.add("ghost");
      });
    });
    const h = mdl.querySelector("h3");
    if (h) {
      mdl.setAttribute("aria-label", h.textContent.trim());
      addMin(h);
    }
  };
  new MutationObserver(decorate).observe(mdl, { childList: true });
  new MutationObserver(() => {
    if (!ovl.hidden) {
      if (!back) back = document.activeElement;
      mdl.setAttribute("role", "dialog");
      mdl.setAttribute("aria-modal", "true");
      mdl.tabIndex = -1;
      mdl.scrollTop = 0;
      decorate();
      try {
        mdl.focus({ preventScroll: true });
      } catch (e) {}
      const h = mdl.querySelector("h3");
      play(h && /Menang/.test(h.textContent) ? "win" : "pop");
    } else {
      if (back && back.isConnected && !back.disabled) {
        try {
          back.focus({ preventScroll: true });
        } catch (e) {}
      }
      back = null;
    }
  }).observe(ovl, { attributes: true, attributeFilter: ["hidden"] });
  /* ketuk latar gelap = tutup, hanya untuk jendela info (satu tombol "Tutup") */
  ovl.addEventListener("click", (e) => {
    if (e.target !== ovl || ovl.classList.contains("min")) return;
    const bs = qa("#mod .mb button");
    if (bs.length === 1 && /^Tutup$/i.test(bs[0].textContent.trim())) bs[0].click();
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const ae = document.activeElement,
      typing = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
    if (e.key === "Escape") {
      if (!sm.hidden) {
        menu(false);
        return;
      }
      if (!ovl.hidden) {
        if (ovl.classList.contains("min")) {
          setMin(false);
          return;
        }
        const bs = qa("#mod .mb button");
        if (bs.length === 1 && /^Tutup$/i.test(bs[0].textContent.trim())) bs[0].click();
        else setMin(true);
        return;
      }
      return;
    }
    if (e.key === "Tab" && !ovl.hidden && !ovl.classList.contains("min")) {
      const f = qa("#mod button:not(:disabled):not(.mn),#mod input,#mod select").filter((x) => x.offsetParent !== null);
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const i = f.indexOf(ae);
      if (ae === mdl || i < 0) {
        e.preventDefault();
        f[e.shiftKey ? f.length - 1 : 0].focus();
        return;
      }
      if (e.shiftKey && i === 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
      return;
    }
    if (typing || e.repeat || !ovl.hidden || gbx.classList.contains("o")) return;
    const k = e.key.toLowerCase(),
      go = (id) => {
        const b = q(id);
        if (b && !b.disabled && b.offsetParent !== null) {
          e.preventDefault();
          b.click();
        }
      };
    if (e.key === " ") {
      if (ae && ae.id === "roll") return;
      if (!ae || ae === document.body || ae.closest("#dock,#pl,#log,#board")) go("#roll");
      return;
    }
    if (ae && ae.tagName === "BUTTON" && !ae.closest("#dock")) return;
    if (k === "a") go("#mng");
    else if (k === "b") go("#bnk");
    else if (k === "d") go("#trd");
    else if (k === "k") go("#kbj");
  });

  /* ---------- Zoom papan (HP) + kamera ikut pion ---------- */
  const zb = q("#zbtn"),
    mq = matchMedia("(max-width:759px)");
  let zoom = store.get("monopoli-id-zoom") === "1",
    ft = 0;
  const paintZ = () => {
    document.body.classList.toggle("zoom", zoom && mq.matches);
    zb.textContent = zoom ? "🗺️ Muat layar" : "🔍 Perbesar";
    zb.setAttribute("aria-pressed", String(zoom));
  };
  const follow = (force) => {
    clearTimeout(ft);
    ft = setTimeout(
      () => {
        if (!document.body.classList.contains("zoom")) return;
        const bw = q("#bw"),
          pin = q(".pw.cur") || q(".pw");
        if (!pin) return;
        const r = pin.getBoundingClientRect(),
          b = bw.getBoundingClientRect();
        bw.scrollBy({ left: r.left + r.width / 2 - (b.left + bw.clientWidth / 2), top: r.top + r.height / 2 - (b.top + bw.clientHeight / 2), behavior: RM.matches ? "auto" : "smooth" });
      },
      force ? 40 : 110,
    );
  };
  zb.addEventListener("click", () => {
    zoom = !zoom;
    store.set("monopoli-id-zoom", zoom ? "1" : "0");
    paintZ();
    follow(true);
  });
  mq.addEventListener?.("change", paintZ);
  /* ticker pesan saat papan diperbesar (pesan tengah papan bisa di luar layar) */
  new MutationObserver(() => {
    const n = q("#now");
    q("#tick").textContent = n ? n.textContent : "";
  }).observe(q("#ctr"), { childList: true, subtree: true, characterData: true });

  /* ---------- Sinkronisasi tampilan setelah setiap render() ---------- */
  let prev = { cur: -1, pos: -1, cash: [] };
  function sync() {
    if (typeof P === "undefined" || !P.length || !P[cur]) return;
    const w = P[cur],
      ro = R(w);
    /* banner giliran */
    const set = (el, h) => {
      if (el._h !== h) {
        el._h = h;
        el.innerHTML = h;
      }
    };
    const who = q("#who");
    set(
      who,
      `<div class="wi${prev.cur !== cur ? " turn" : ""}" style="--pc:${w.c}"><span class="wp">${w.k}</span><div class="wt"><b>${esc(w.n)}${w.b ? " 🤖" : ""}</b><small>Giliran · ${ro.i} ${esc(ro.n)}${w.jail >= 0 ? " · ⛓️ di penjara" : ""}${w.loans.length ? " · 🏦 ada utang" : ""}</small></div><div class="wc">${w.x ? "bangkrut" : fm(w.cash)}</div></div>`,
    );
    /* situasi negara: kartu ringkas */
    const cr = crS(),
      pr = PRES.id >= 0 ? `${esc(P[PRES.id].n)} · periode ${PRES.t}/2` : "belum ada";
    const nc = nChaos(),
      nz = NPH[nPh(nc)];
    set(q("#nh"), `<span>📰 ${nz[1]} Kacau ${nc}% · ${esc(ECO.n)}</span><em>Putaran ${rnd}${SET.rl ? "/" + SET.rl : ""}</em>`);
    set(
      q("#news"),
      `<div class="nz">` +
        `<div class="w"><b>Meter kekacauan · ${nz[1]} ${nz[0]}</b><span class="cbar"><i style="width:${nc}%;background:${nz[2]}"></i></span>${nc}%</div>` +
        `<div class="w"><b>Berita terakhir</b>${esc(NW.last || "Belum ada berita.")}</div>` +
        `<div class="w"><b>Ekonomi</b>${esc(ECO.n)}${ECO.d ? ` · ${ECO.d} putaran lagi` : ""}</div>` +
        `<div><b>Dana APBN</b>${fm(POOL)}</div><div><b>Aset negara</b>${nneg()} properti</div>${FZ.L >= 0.05 ? '<div class="w"><b>🧮 Fiskal · ' + fzLabel(FZ.L)[0] + "</b>pajak ×" + fx(fzTax()) + ", sewa aset negara ×" + fx(fzRent()) + ", potongan Presiden ×" + fx(fzEff()) + "</div>" : ""}` +
        `<div class="w"><b>Krisis · ${LV.i} ${LV.n}</b>${cr ? `Tahap ${cr} · sewa ×${fx(crM())}, gaji ×${fx(crG())}` : SET.cr ? `mulai putaran ${LV.st}` : "dimatikan"}${DIR < 0 ? " · 🔁 arah terbalik" : ""}</div>` +
        `<div><b>Presiden 👑</b>${pr}</div><div><b>Pemilu 🗳️</b>setelah putaran ${Math.ceil(rnd / 5) * 5}</div>` +
        `<div class="w"><b>Pion OTT 👮 (${POLS.length})</b>${POLS.map((x) => esc(T[x.pos].n)).join(", ")}</div></div>`,
    );
    /* petak tempat pemain giliran berada */
    qa(".t.here").forEach((e) => e.classList.remove("here"));
    if (!w.x) {
      const t = q("#t" + w.pos);
      if (t) t.classList.add("here");
    }
    /* kartu pemain aktif terlihat (strip horizontal di HP) */
    if (prev.cur !== cur) {
      const pl = q("#pl"),
        c = pl.querySelector(".pc.on");
      if (c && pl.scrollWidth > pl.clientWidth + 4) pl.scrollTo({ left: c.offsetLeft - (pl.clientWidth - c.offsetWidth) / 2, behavior: RM.matches ? "auto" : "smooth" });
    }
    /* kamera */
    if (prev.cur !== cur || prev.pos !== w.pos) follow();
    /* suara */
    if (prev.cur >= 0) {
      if (prev.cur !== cur) play("turn");
      else if (prev.pos !== w.pos) play("step");
      if (prev.cash.length === P.length) {
        let up = 0,
          dn = 0;
        P.forEach((p, i) => {
          const d = p.cash - prev.cash[i];
          if (d >= 1e4) up++;
          else if (d <= -1e4) dn++;
        });
        if (up) play("up");
        else if (dn) play("dn");
      }
    }
    prev = { cur, pos: w.pos, cash: P.map((p) => p.cash) };
  }
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    try {
      sync();
    } catch (e) {
      console.error("UX sync", e);
    }
    return r;
  };

  paintSnd();
  paintZ();
  metaTC();
})();
