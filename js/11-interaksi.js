      async function showTile(i) {
        const o = own[i],
          w = P[cur],
          ok = o && o.o != NEG && w && !w.b && !w.x && o.o != w.id && P[o.o] && !P[o.o].x,
          c = await ask(
            info(i),
            ok
              ? [
                  ["Tawar Dagang", 1],
                  ["Tutup", 0],
                ]
              : [["Tutup"]],
            {},
          );
        if (c && ok && ov.hidden) await trade(w, P[o.o], i);
      }
      $("#board").onclick = (e) => {
        const t = e.target.closest(".t");
        if (t && ov.hidden) showTile(+t.id.slice(1));
      };
      $("#pl").onclick = (e) => {
        const s = e.target.closest("s");
        if (s && ov.hidden) showTile(+s.dataset.i);
      };
      $("#mng").onclick = () => {
        if (ov.hidden && P[cur] && !P[cur].x && !P[cur].b) manage(P[cur]);
      };
      $("#bnk").onclick = () => {
        if (ov.hidden && P[cur] && !P[cur].x && !P[cur].b) bank(P[cur]);
      };
      $("#trd").onclick = () => {
        if (ov.hidden && P[cur] && !P[cur].x && !P[cur].b) trade(P[cur]);
      };
      $("#kbj").onclick = () => {
        if (ov.hidden && P[cur] && !P[cur].x && !P[cur].b && isP(P[cur])) kebijakan(P[cur]);
      };
