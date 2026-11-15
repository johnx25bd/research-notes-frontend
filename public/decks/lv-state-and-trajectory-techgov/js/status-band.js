// Status band: a strip of small blocks along the bottom of every slide. It
// starts mostly red and turns green as the deck advances, one step per slide
// and per fragment; now and then a green block drops back to red for a step.
// The layout is seeded, so every slide carries the same blocks and only their
// state differs.
(function () {
  const UNITS = 64, UNIT = 20, ROWS = 3, ROW_H = 6, ROW_GAP = 2, TOP = 3;
  const GREEN = ["#1ed46a", "#17b259", "#8eecb2"];
  const RED = ["#f2a2ec", "#f6bdf1"];
  const NEUTRAL = "#e1e6da";

  function rng(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Each block: where it sits, and when (as a share of the deck) it turns green.
  function layout(steps) {
    const r = rng(11), blocks = [], dip = Math.max(0.05, 1.5 / steps);
    for (let row = 0; row < ROWS; row++) {
      for (let x = 0; x < UNITS; ) {
        const w = Math.min(1 + Math.floor(r() * 3), UNITS - x), kind = r();
        const b = { x: x * UNIT + 1, y: TOP + row * (ROW_H + ROW_GAP), w: w * UNIT - 2, shade: Math.floor(r() * 6) };
        x += w;
        if (kind < 0.12) continue;                    // a gap
        if (kind < 0.2) { b.neutral = true; blocks.push(b); continue; }
        const u = r();
        b.at = u < 0.12 ? -1 : u > 0.93 ? 2 : 0.03 + r() * 0.94;   // green from the start, never, or partway
        if (b.at < 0.6 && r() < 0.14) b.dip = Math.min(Math.max(b.at, 0) + 0.1 + r() * 0.25, 0.92 - dip);
        b.dipLen = dip;
        blocks.push(b);
      }
    }
    return blocks;
  }

  function colour(b, p) {
    if (b.neutral) return NEUTRAL;
    const green = p >= b.at && !(b.dip !== undefined && p >= b.dip && p < b.dip + b.dipLen);
    return green ? GREEN[b.shade % GREEN.length] : RED[b.shade % RED.length];
  }

  function install(Reveal) {
    const slides = Reveal.getSlides();
    const base = [];
    let steps = 0;
    slides.forEach((s) => {
      base.push(steps);
      const idx = new Set([...s.querySelectorAll(".fragment")].map((f) => f.dataset.fragmentIndex));
      steps += 1 + idx.size;
    });
    const blocks = layout(steps);
    const NS = "http://www.w3.org/2000/svg";

    function paint(svg, k, animate) {
      const p = steps > 1 ? Math.max(k, 0) / (steps - 1) : 1;
      [...svg.children].forEach((rect, i) => {
        const c = colour(blocks[i], p);
        if (rect.getAttribute("fill") === c) return;
        rect.setAttribute("fill", c);
        if (!animate) return;
        rect.classList.remove("flip");
        void rect.getBoundingClientRect();   // restart the pulse
        rect.classList.add("flip");
      });
    }

    const strips = slides.map((s, n) => {
      let svg = s.querySelector(":scope > .status-band");
      if (!svg) {
        svg = document.createElementNS(NS, "svg");
        svg.setAttribute("class", "status-band");
        svg.setAttribute("viewBox", `0 0 ${UNITS * UNIT} ${TOP * 2 + ROWS * ROW_H + (ROWS - 1) * ROW_GAP}`);
        svg.setAttribute("aria-hidden", "true");
        blocks.forEach((b) => {
          const rect = document.createElementNS(NS, "rect");
          rect.setAttribute("x", b.x); rect.setAttribute("y", b.y);
          rect.setAttribute("width", b.w); rect.setAttribute("height", ROW_H);
          svg.appendChild(rect);
        });
        s.appendChild(svg);
      }
      // Rest one step behind the slide's first state, so arriving shows a change.
      paint(svg, base[n] - 1, false);
      return svg;
    });

    function update() {
      const i = Reveal.getIndices();
      const f = i.f === undefined ? -1 : i.f;
      paint(strips[i.h], base[i.h] + f + 1, true);
    }
    Reveal.on("slidechanged", update);
    Reveal.on("fragmentshown", update);
    Reveal.on("fragmenthidden", update);
    update();
  }

  window.StatusBand = { install };
})();
