      /* ===== Konverter emoji -> ikon SVG (Game Icon Pack by Nieobie, CC0) ===== */
      (() => {
        const MAP = {
          "⚖": ["hammer", null],
          "🏦": ["bank", null],
          "🏠": ["house", null],
          "🏛": ["flag-02", null],
          "👑": ["crown", null],
          "🕵": ["binoculars", null],
          "👮": ["shield-03", null],
          "🤝": ["friends", null],
          "🍱": ["bowl", null],
          "🏭": ["tower-05", null],
          "🎲": ["dice", null],
          "📰": ["paper", null],
          "🛒": ["plastic-bag", null],
          "🩺": ["medical-kit", null],
          "🔨": ["hammer-02", null],
          "🏗": ["shovel", null],
          "⚠": ["exclamation-02", "#d98a00"],
          "📱": ["mobile-phone", null],
          "🏅": ["trophy", null],
          "🧮": ["function", null],
          "⛓": ["lock", null],
          "✈": ["plane", null],
          "🤖": ["microchip", null],
          "📉": ["arrow-down-right", "#b3261e"],
          "🗳": ["mail", null],
          "⛏": ["pickaxe", null],
          "📈": ["arrow-up-right", "#1b7f3a"],
          "🎖": ["ranking", null],
          "🛡": ["shield", null],
          "🌐": ["earth", null],
          "✅": ["tick", "#1b7f3a"],
          "🎁": ["chest", null],
          "🎭": ["user-avatar", null],
          "🧾": ["file", null],
          "⏭": ["next", null],
          "📖": ["book", null],
          "🌓": ["dark-mode", null],
          "🔊": ["volume", null],
          "🔇": ["mute", null],
          "⚙": ["settings", null],
          "🔄": ["refresh", null],
          "🔍": ["zoom-in", null],
          "🔎": ["search", null],
          "🟢": ["circle", "#2ea043"],
          "🟡": ["circle", "#e3b341"],
          "🟠": ["circle", "#f2994a"],
          "🔴": ["circle", "#e5484d"],
          "💸": ["coin", "#b3261e"],
          "💰": ["coin", "#c98a00"],
          "⚡": ["lightning", null],
          "🔁": ["change", null],
          "🔑": ["key", null],
          "🏨": ["tower-02", null],
          "🏢": ["tower-03", null],
          "🕌": ["lantern-02", null],
          "💼": ["backpack", null],
          "🌾": ["sickle", null],
          "🎣": ["fishing-rod", null],
          "📚": ["book", null],
          "🎨": ["palette", null],
          "💻": ["laptop", null],
          "💥": ["hit-effect", null],
          "▶": ["play", null],
          "⏰": ["clock", null],
          "⏱": ["time", null],
          "🏆": ["trophy", null],
          "🏷": ["tag", null],
          "🍀": ["clover", null],
          "🕳": ["death", null],
          "🃏": ["cards", null],
          "⏳": ["time", null],
          "🔌": ["connection", null],
          "❌": ["cross", "#b3261e"],
          "🚉": ["bus-side", null],
          "❓": ["question-mark", null],
          "➡": ["arrow-right", null],
          "💧": ["water", null],
          "💎": ["diamond", null],
          "🌀": ["wind", null],
          "🧑": ["user", null],
          "🌴": ["tree-03", null],
          "💀": ["skull", null],
          "🆕": ["level", null],
          "☀": ["light-mode", null],
          "🌙": ["dark-mode", null],
          "🏖": ["sun", null],
          "🗺": ["map", null],
          "🎯": ["target", null],
          "👀": ["visible", null],
          "☰": ["menu", null],
          "✕": ["cross", null],
          "➜": ["arrow-right", null],
        };
        const keys = Object.keys(MAP)
          .sort((a, b) => b.length - a.length)
          .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const RE = new RegExp("(" + keys.join("|") + ")\\uFE0F?", "g");
        const NS = "http://www.w3.org/2000/svg";
        const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|SELECT|TITLE)$/i;
        const mk = (n, c) => {
          const v = document.createElementNS(NS, "svg"),
            u = document.createElementNS(NS, "use");
          v.setAttribute("class", "ico");
          v.setAttribute("aria-hidden", "true");
          if (c) v.style.color = c;
          u.setAttribute("href", "#ic-" + n);
          v.appendChild(u);
          return v;
        };
        const conv = (t) => {
          const p = t.parentNode;
          if (!p || SKIP.test(p.nodeName) || p.closest("svg")) return;
          const s = t.nodeValue;
          RE.lastIndex = 0;
          if (!RE.test(s)) return;
          RE.lastIndex = 0;
          const f = document.createDocumentFragment();
          let last = 0,
            m;
          while ((m = RE.exec(s))) {
            if (m.index > last) f.appendChild(document.createTextNode(s.slice(last, m.index)));
            const e = MAP[m[1]];
            f.appendChild(mk(e[0], e[1]));
            last = m.index + m[0].length;
          }
          if (last < s.length) f.appendChild(document.createTextNode(s.slice(last)));
          p.replaceChild(f, t);
        };
        const scan = (n) => {
          if (n.nodeType === 3) return conv(n);
          if (n.nodeType !== 1 || n.closest("svg")) return;
          const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT),
            a = [];
          while (w.nextNode()) a.push(w.currentNode);
          a.forEach(conv);
        };
        scan(document.body);
        new MutationObserver((ms) => {
          for (const m of ms) {
            if (m.type === "characterData") conv(m.target);
            else m.addedNodes.forEach(scan);
          }
        }).observe(document.body, { childList: true, subtree: true, characterData: true });
      })();
