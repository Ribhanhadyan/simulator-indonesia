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

  /* ---------- Pasang aplikasi (PWA) ---------- */ // NEW (mulai)
  {
    const ib = q("#inst");
    let dp = null;
    const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const paint = () => {
      ib.hidden = standalone() || !(dp || ios);
    };
    addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      dp = e;
      paint();
    });
    addEventListener("appinstalled", () => {
      dp = null;
      paint();
    });
    ib.addEventListener("click", async () => {
      menu(false);
      if (dp) {
        const p = dp;
        dp = null;
        paint();
        p.prompt();
        await p.userChoice.catch(() => {});
      } else if (ios && ovl.hidden) {
        await ask(
          `<h3>📲 Pasang di iPhone / iPad</h3>${sec("Langkah", '<p class="ct">1. Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas) di Safari.<br>2. Pilih <b>Tambahkan ke Layar Utama</b>.<br>3. Ketuk <b>Tambah</b>.</p>')}`,
          [["OK", 1]],
          {},
        );
      }
    });
    paint();
  } // NEW (selesai)

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
  const dock = document.createElement("div"),
    pill = document.createElement("button"),
    quick = document.createElement("button");
  dock.id = "modmin";
  dock.hidden = true;
  pill.type = quick.type = "button";
  pill.className = "mo";
  quick.className = "ma";
  quick.hidden = true;
  dock.append(pill, quick);
  document.body.appendChild(dock);
  /* kartu yang hanya punya satu tombol (Selesai, OK, Lanjut, ...): tombolnya ikut tampil di bar kecil,
     jadi tidak perlu membuka kartu lagi hanya untuk menutupnya */
  const soleBtn = () => {
    const bs = qa("#mod .mb button:not(:disabled)");
    return qa("#mod .mb button").length === 1 && bs.length === 1 ? bs[0] : null;
  };
  const resetDrag = () => {
    mdl.style.transition = mdl.style.transform = "";
    ovl.style.opacity = "";
  };
  const setMin = (on) => {
    if (on && ovl.hidden) return;
    resetDrag();
    ovl.classList.toggle("min", on);
    dock.hidden = !on;
    if (on) {
      const h = mdl.querySelector("h3"),
        sb = soleBtn();
      pill.textContent = "Buka kartu" + (h && !sb ? " · " + h.textContent.trim() : "");
      quick.hidden = !sb;
      quick.textContent = sb ? sb.textContent.trim() : "";
      (sb ? quick : pill).focus({ preventScroll: true });
    } else {
      pill.textContent = quick.textContent = "";
      quick.hidden = true;
      if (!ovl.hidden) {
        try {
          mdl.focus({ preventScroll: true });
        } catch (e) {}
      }
    }
  };
  pill.addEventListener("click", () => setMin(false));
  quick.addEventListener("click", () => {
    const b = soleBtn();
    setMin(false);
    if (b) b.click();
  });
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
  /* ---------- Gestur: seret kartu ke bawah = kecilkan, seret bar ke atas = buka ---------- */
  {
    let y0 = 0, x0 = 0, t0 = 0, dy = 0, st = 0; /* st: 0 diam, 1 menunggu arah, 2 menyeret */
    let swallow = 0;
    document.addEventListener(
      "click",
      (e) => {
        if (swallow && Date.now() - swallow < 400) {
          e.stopPropagation();
          e.preventDefault();
        }
        swallow = 0;
      },
      true,
    );
    const pt = (e) => (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    const begin = (e) => {
      if (ovl.hidden || ovl.classList.contains("min")) return;
      if (e.target.closest && e.target.closest("input,select,textarea,.stp")) return;
      /* tetap bisa menyeret dari mana saja saat isi kartu sudah di paling atas; bila isi sedang tergulir, hanya dari judul */
      if (mdl.scrollTop > 0 && !(e.target.closest && e.target.closest("h3"))) return;
      const p = pt(e);
      y0 = p.clientY;
      x0 = p.clientX;
      t0 = Date.now();
      dy = 0;
      st = 1;
    };
    const move = (e) => {
      if (!st) return;
      const p = pt(e),
        ddy = p.clientY - y0,
        ddx = p.clientX - x0;
      if (st === 1) {
        if (Math.abs(ddx) > 12 || ddy < -8) return void (st = 0);
        if (ddy < 10 || ddy < Math.abs(ddx) * 1.2) return;
        st = 2;
        mdl.style.transition = "none";
      }
      dy = Math.max(0, ddy);
      if (e.cancelable) e.preventDefault();
      mdl.style.transform = "translateY(" + dy + "px)";
      ovl.style.opacity = String(Math.max(0.35, 1 - dy / 420));
    };
    const end = () => {
      if (st === 2) {
        swallow = Date.now();
        const v = dy / Math.max(1, Date.now() - t0);
        if (dy > 90 || (dy > 30 && v > 0.5)) {
          mdl.style.transition = "transform 0.16s ease-out";
          mdl.style.transform = "translateY(110%)";
          const d = dy;
          setTimeout(() => setMin(true), 140);
          void d;
        } else {
          mdl.style.transition = "transform 0.18s var(--ease)";
          mdl.style.transform = "";
          ovl.style.opacity = "";
          setTimeout(() => (mdl.style.transition = ""), 200);
        }
      }
      st = 0;
    };
    mdl.addEventListener("touchstart", begin, { passive: true });
    mdl.addEventListener("touchmove", move, { passive: false });
    mdl.addEventListener("touchend", end);
    mdl.addEventListener("touchcancel", end);
    /* mouse / pena: seret lewat judul kartu */
    mdl.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button || !(e.target.closest && e.target.closest("h3")) || e.target.closest(".mn")) return;
      begin(e);
      if (st !== 1) return;
      const mv = (ev) => move(ev),
        up = () => {
          removeEventListener("pointermove", mv);
          removeEventListener("pointerup", up);
          end();
        };
      addEventListener("pointermove", mv);
      addEventListener("pointerup", up);
    });
    /* bar kecil: seret ke atas = buka kartu */
    let by = 0, bt = 0;
    dock.addEventListener("touchstart", (e) => ((by = pt(e).clientY), (bt = 1)), { passive: true });
    dock.addEventListener("touchmove", (e) => {
      if (bt && by - pt(e).clientY > 28) {
        bt = 0;
        swallow = Date.now();
        setMin(false);
      }
    }, { passive: true });
    dock.addEventListener("touchend", () => (bt = 0));
  }
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
    else setMin(true);
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
  const stV = { nc: -1, up: 0, rise: 0, ch: 0 };
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
    /* stress level: naik terus = animasi panik; ringkasan menampilkan berita terakhir */
    if (nc !== stV.nc) {
      if (stV.nc >= 0) {
        if (nc > stV.nc) (stV.up++, (stV.rise = 1));
        else (stV.up = 0), (stV.rise = 0);
      }
      stV.nc = nc;
      stV.ch = 1;
    }
    {
      const nh = q("#nh"),
        nwEl = q("#newsw");
      if (!nh._b) {
        nh.innerHTML = '<span class="sg"></span><span class="nl"></span>';
        nh._b = 1;
      }
      const sg = nh.querySelector(".sg"),
        nl = nh.querySelector(".nl"),
        ph = nPh(nc),
        climb = stV.up >= 3 && ph >= 2;
      set(sg, `<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="bg" cx="22" cy="22" r="18"/><circle class="fg" cx="22" cy="22" r="18" stroke-dasharray="${((nc / 100) * 113.1).toFixed(1)} 113.1"/></svg><b>${nc}</b>${stV.rise && nc < 100 ? "<u>▲</u>" : ""}`);
      sg.style.setProperty("--sc", nz[2]);
      sg.className = `sg st${ph}${climb ? " climb" : ""}`;
      sg.title = `Stress level ${nc}/100 · ${nz[0]}`;
      if (stV.ch) {
        st
