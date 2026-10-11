      /* ===== Multiplayer (Sparrow-RTC): host menjalankan game, tamu melihat cermin tampilan & mengirim klik ===== */
      const MP = { on: 0, cl: 0, peers: new Set(), tk: {}, ao: null, mv: 0, seat: -1, cur: 0, last: {}, lost: new Set(), code: "", pv: 0, st: "" };
      const mpL = async () => {
        const m = await import("https://esm.sh/sparrow-rtc");
        return m.Sparrow || m.default;
      };
      /* Server TURN (relay) untuk jaringan yang memblokir UDP/STUN. Isi dengan kredensial dari penyedia TURN, mis.
         {urls:["turn:HOST:443?transport=tcp"], username:"...", credential:"..."} */
      const MP_TURN = [];
      const mpIce = async () => ({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }, { urls: ["stun:stun.services.mozilla.com:3478"] }, { urls: ["stun:server2024.stunprotocol.org:3478"] }, ...MP_TURN],
      });
      const mpTx = (o) => {
        try {
          MP.sp.connection.cable.reliable.send(JSON.stringify(o));
        } catch (e) {}
      };
      const mpAll = (o) => {
        const t = JSON.stringify(o);
        MP.peers.forEach((p) => {
          try {
            p.c.cable.reliable.send(t);
          } catch (e) {}
        });
      };
      const mpOwn = () => (MP.ao != null ? MP.ao : cur),
        mpRem = (q) => [...MP.peers].some((p) => p.seat === q),
        mpNm = (q) => (P[q] ? P[q].n : "Host");
      const mpR = {
        who: () => [$("#who").innerHTML, $("#who").style.background],
        tiles: () =>
          [...$("#board").children]
            .filter((e) => e.id != "pins" && e.id != "ctr")
            .map((e) => e.outerHTML)
            .join(""),
        pins: () => $("#pins").innerHTML,
        ctr: () => $("#ctr").innerHTML,
        news: () => $("#news").innerHTML,
        pl: () => $("#pl").innerHTML,
        log: () => $("#log").innerHTML,
        btn: () => [$("#roll").innerHTML, $("#roll").disabled, $("#kbj").style.display],
        ov: () => [ov.hidden, mod.innerHTML],
        m: () => [mpOwn(), cur, mpNm(mpOwn()), MP.mv],
      };
      function mpSnap(full) {
        const d = {};
        for (const k in mpR) {
          const v = JSON.stringify(mpR[k]());
          if (full || MP.last[k] !== v) {
            if (!full) {
              MP.last[k] = v;
              if (k == "ov") MP.mv++;
            }
            d[k] = JSON.parse(v);
          }
        }
        return d;
      }
      function mpTick() {
        if (!MP.on) return;
        if (ov.hidden) MP.ao = null;
        const d = mpSnap(0);
        if (Object.keys(d).length) mpAll({ t: "s", d });
        const w = $("#wtb");
        w.hidden = ov.hidden || !mpRem(mpOwn());
        w.textContent = "⏳ Menunggu " + mpNm(mpOwn()) + "…";
      }
      function mpSeat(p) {
        const used = (q) => [...MP.peers].some((x) => x !== p && x.seat === q);
        if (p.tok && MP.tk[p.tok] != null && !used(MP.tk[p.tok])) return MP.tk[p.tok];
        for (let q = 1; q < 4; q++) {
          if (used(q)) continue;
          if (P.length && !(P[q] && (!P[q].b || MP.lost.has(q)))) continue;
          if (p.tok) MP.tk[p.tok] = q;
          return q;
        }
        return -1;
      }
      function mpPre() {
        const rows = mod.querySelectorAll(".sr");
        if (!rows.length || ov.hidden) return;
        rows.forEach((r, i) => {
          if (!i) return;
          const q = [...MP.peers].find((x) => x.seat === i),
            se = r.querySelector("select"),
            inp = r.querySelector("input");
          if (q) {
            se.value = "0";
            inp.value = q.name;
            r.dataset.mp = 1;
          } else if (r.dataset.mp) {
            se.value = "1";
            delete r.dataset.mp;
          }
        });
      }
      const $$ = (s) => [...document.querySelectorAll(s)],
        fnd = (r, a) => a.reduce((e, i) => e && e.children[i], r),
        pth = (r, e) => {
          const a = [];
          for (; e !== r; e = e.parentNode) a.unshift([...e.parentNode.children].indexOf(e));
          return a;
        };
      function mpMsg(p, raw) {
        let m;
        try {
          m = JSON.parse(raw);
        } catch (e) {
          return;
        }
        if (m.t == "j") {
          p.name = String(m.n || "Tamu").slice(0, 12);
          p.tok = String(m.k || "").slice(0, 40);
          p.seat = mpSeat(p);
          MP.peers.add(p);
          if (p.seat > 0 && P[p.seat]) {
            P[p.seat].b = 0;
            MP.lost.delete(p.seat);
            say("🔌 " + P[p.seat].n + " tersambung kembali");
            render();
          }
          mpSend(p, { t: "hi", seat: p.seat });
          mpSend(p, { t: "s", d: mpSnap(1) });
          mpPre();
          mpPanel();
          mpTick();
          return;
        }
        if (!MP.peers.has(p)) return;
        const q = p.seat;
        if (m.t == "b") {
          if (q === cur && P[cur] && !P[cur].b && /^(roll|mng|bnk|trd|kbj)$/.test(m.id)) $("#" + m.id).click();
        } else if (m.t == "c") {
          let el;
          if (m.r == "mod") {
            if (q !== mpOwn() || m.v !== MP.mv) return;
            el = fnd(mod, m.p);
          } else if (ov.hidden) {
            el = m.r == "t" ? $$("#board .t")[m.p] : fnd($("#pl"), m.p);
            MP.ao = q;
          }
          if (el) el.click();
        } else if (m.t == "i") {
          if (q !== mpOwn() || m.v !== MP.mv) return;
          const el = fnd(mod, m.p);
          if (!el) return;
          if ("val" in m) el.value = m.val;
          if ("ck" in m) el.checked = m.ck;
          el.dispatchEvent(new Event(m.ev, { bubbles: true }));
        }
      }
      function mpLeave(p) {
        if (!MP.peers.delete(p)) return;
        const q = p.seat;
        if (q > 0 && P[q] && !P[q].x && !P[q].b) {
          P[q].b = 1;
          MP.lost.add(q);
          say("🔌 " + P[q].n + " terputus, dikendalikan bot");
          render();
          if (q === cur && ov.hidden && !$("#roll").disabled) setTimeout(() => $("#roll").click(), 400);
        }
        mpPre();
        mpPanel();
        mpTick();
      }
      function mpPanel(show) {
        const e = $("#mp");
        if (show != null) MP.pv = show;
        e.hidden = !MP.pv;
        if (!MP.pv) return;
        if (MP.cl) {
          e.innerHTML = "<b>🌐 Online</b><div>" + MP.st + "</div>";
          return;
        }
        const link = location.href.split("#")[0] + "#join=" + MP.code,
          ps = [...MP.peers].map((p) => `<div>• ${p.name} → ${p.seat >= 0 ? "Pemain " + (p.seat + 1) : "Penonton"}</div>`).join("") || "<div>Belum ada tamu.</div>";
        e.innerHTML = `<b>🌐 Main Online</b><div>Kode: <code>${MP.code}</code></div><input id="mpl" readonly value="${link}"><div class="btns"><button id="mpc">Salin tautan</button><button id="mpx">Tutup</button></div>${ps}`;
        $("#mpc").onclick = () => {
          $("#mpl").select();
          navigator.clipboard?.writeText(link);
        };
        $("#mpx").onclick = () => mpPanel(false);
      }
      async function mpHost() {
        if (MP.on) return mpPanel(true);
        const S = await mpL();
        MP.sp = await S.host({
          rtcConfigurator: mpIce,
          welcome: (pr) => (c) => {
            const p = { c, seat: -2, name: "", tok: "" };
            c.cable.reliable.onmessage = (e) => mpMsg(p, e.data);
            return () => mpLeave(p);
          },
          closed: () => {
            MP.on = 0;
            MP.st = "Koneksi ke signaller putus";
            mpPanel();
          },
        });
        MP.on = 1;
        MP.code = MP.sp.invite;
        mpPanel(true);
        const ob = new MutationObserver(() => {
            clearTimeout(MP.tm);
            MP.tm = setTimeout(mpTick, 70);
          }),
          o = { subtree: true, childList: true, attributes: true, characterData: true };
        ob.observe($("#app"), o);
        ob.observe(ov, o);
        document.addEventListener(
          "click",
          (e) => {
            if (!e.isTrusted) return;
            const t = e.target;
            if ((t.closest("#mod") && mpRem(mpOwn())) || (t.closest("#roll,#mng,#bnk,#trd,#kbj") && mpRem(cur))) {
              e.stopPropagation();
              e.preventDefault();
            }
          },
          true,
        );
        {
          const _a = ask;
          ask = function (h, b, w) {
            const ww = w || P[cur];
            if (!ww?.b) MP.ao = ww && ww.id >= 0 ? ww.id : ww && ww.id < 0 ? cur : 0;
            const r = _a(h, b, w);
            r.then(() => {
              MP.ao = null;
            });
            if (/Nama Pemain/.test(h)) mpPre();
            return r;
          };
        }
        mpTick();
      }
      function mpApply(d) {
        for (const k in d) {
          const v = d[k];
          if (k == "who") {
            $("#who").innerHTML = v[0];
            $("#who").style.background = v[1];
          } else if (k == "tiles") {
            $("#board")
              .querySelectorAll(":scope>:not(#pins):not(#ctr)")
              .forEach((e) => e.remove());
            $("#board").insertAdjacentHTML("beforeend", v);
          } else if (k == "btn") {
            $("#roll").innerHTML = v[0];
            MP.rd = v[1];
            $("#kbj").style.display = v[2];
          } else if (k == "ov") {
            ov.hidden = v[0];
            mod.innerHTML = v[1];
          } else if (k == "m") {
            [MP.ow, MP.cur, MP.on_, MP.mv] = v;
          } else $("#" + k).innerHTML = v;
        }
        const my = MP.cur === MP.seat;
        $("#roll").disabled = !!MP.rd || !my;
        ["mng", "bnk", "trd", "kbj"].forEach((i) => ($("#" + i).disabled = !my));
        const lk = MP.ow !== MP.seat;
        ov.classList.toggle("wt", lk);
        const w = $("#wtb");
        w.hidden = ov.hidden || !lk;
        w.textContent = "⏳ Menunggu " + MP.on_ + "…";
      }
      async function mpJoin(code) {
        MP.cl = 1;
        document.body.classList.add("cl");
        MP.pv = 1;
        MP.st = "Menyambung…";
        mpPanel();
        const nm = (prompt("Nama kamu:", sessionStorage.mpn || "") || "Tamu").trim().slice(0, 12);
        sessionStorage.mpn = nm;
        const k = (sessionStorage.mpk = sessionStorage.mpk || Math.random().toString(36).slice(2));
        document.addEventListener("click", (e) => {
          const t = e.target,
            b = t.closest("#roll,#mng,#bnk,#trd,#kbj"),
            T = t.closest("#board .t");
          if (b) mpTx({ t: "b", id: b.id });
          else if (T && ov.hidden) mpTx({ t: "c", r: "t", p: $$("#board .t").indexOf(T) });
          else if (t.closest("#pl") && ov.hidden) mpTx({ t: "c", r: "pl", p: pth($("#pl"), t) });
          else if (t.closest("#mod") && !ov.classList.contains("wt")) mpTx({ t: "c", r: "mod", p: pth(mod, t), v: MP.mv });
        });
        ["input", "change"].forEach((ev) =>
          mod.addEventListener(ev, (e) => {
            const t = e.target;
            if (ov.classList.contains("wt")) return;
            mpTx({ t: "i", ev, p: pth(mod, t), val: t.value, ck: t.checked, v: MP.mv });
          }),
        );
        try {
          const S = await mpL();
          MP.sp = await S.join({
            rtcConfigurator: mpIce,
            invite: code,
            disconnected: () => {
              MP.st = "❌ Terputus dari host. Muat ulang halaman untuk bergabung lagi.";
              mpPanel();
            },
          });
          MP.sp.connection.cable.reliable.onmessage = (e) => {
            const m = JSON.parse(e.data);
            if (m.t == "hi") {
              MP.seat = m.seat;
              MP.st = m.seat >= 0 ? "✅ Tersambung · kamu Pemain " + (m.seat + 1) : "👀 Tersambung sebagai penonton";
              mpPanel();
            } else if (m.t == "s") mpApply(m.d);
          };
          mpTx({ t: "j", n: nm, k });
        } catch (e) {
          MP.st = "❌ Gagal bergabung: " + (e.message || e);
          mpPanel();
        }
      }
      $("#mpb").onclick = () => mpHost().catch((e) => alert("Gagal memulai online: " + (e.message || e)));
      const MP_ENABLED = false; /* ubah ke true untuk mengaktifkan lagi fitur Online */
      MP_ENABLED && location.hash.startsWith("#join=") ? mpJoin(location.hash.slice(6)) : boot();
