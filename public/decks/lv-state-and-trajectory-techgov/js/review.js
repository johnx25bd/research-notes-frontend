/* Deck review overlay. No dependencies, no network.
 *
 * Press  r  in the deck to open the panel. The slide shrinks to make room;
 * nothing is covered. The panel has two boxes:
 *   - This slide: notes on the slide you are on. It follows you as you move.
 *   - Whole deck: notes that apply everywhere (structure, theme, cuts).
 * Both save as you type; there is no submit. "Pin a spot" drops a numbered
 * marker on the slide with its own box, stamped with position, fragment and
 * the nearest element. "Copy" puts the review on the clipboard as markdown;
 * "Download" saves review.md with the raw JSON appended.
 * State lives in localStorage keyed by the deck title.
 *
 * Nothing renders until  r  is pressed, so exports and screenshots stay clean.
 *
 * Install: load after reveal.js, then after Reveal.initialize() call
 *   DeckReview.install(Reveal);
 */
window.DeckReview = (function () {
  const KEY = () => "deck-review-v3:" + document.title;
  const WIDTH = 360;
  let deck, panel, pinMode = false, open = false;
  // slides: { "h.v": { title, text } }; pins: [{ id, h, v, f, title, text, x, y, target }]
  let state = { deck: "", slides: {}, pins: [] };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY())); if (s) state = Object.assign({ deck: "", slides: {}, pins: [] }, s); } catch (e) {}
    migrate();
  }
  // One-time carry-over from the earlier format (a list of submitted notes).
  function migrate() {
    const oldKey = "deck-review-v2:" + document.title;
    let old; try { old = JSON.parse(localStorage.getItem(oldKey)); } catch (e) {}
    if (!old) return;
    if (old.general && old.general.trim()) state.deck = [state.deck, old.general].filter((t) => t && t.trim()).join("\n");
    (old.notes || []).forEach((n) => {
      if (n.pin) state.pins.push({ id: n.id, h: n.h, v: n.v, f: n.f, title: n.title, text: n.text || "", x: n.pin.x, y: n.pin.y, target: n.pin.target });
      else if (n.text) { const k = `${n.h}.${n.v}`, cur = state.slides[k]; state.slides[k] = { title: n.title, text: cur ? cur.text + "\n" + n.text : n.text }; }
    });
    save(); localStorage.setItem(oldKey + ":migrated", localStorage.getItem(oldKey)); localStorage.removeItem(oldKey);
  }
  function save() { localStorage.setItem(KEY(), JSON.stringify(state)); }
  function where() {
    const i = deck.getIndices();
    const s = deck.getCurrentSlide();
    const h = s.querySelector("h1, h2");
    return { h: i.h, v: i.v || 0, f: i.f == null ? -1 : i.f, title: h ? h.textContent.trim().replace(/\s+/g, " ") : "(untitled)" };
  }
  const key = (w) => `${w.h}.${w.v}`;
  const num = (w) => `${w.h + 1}${w.v ? "." + (w.v + 1) : ""}`;
  function esc(t) { return (t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  const css = `
  .dr-open .reveal{width:calc(100% - ${WIDTH}px) !important}
  #dr-panel{position:fixed;top:0;right:0;bottom:0;width:${WIDTH}px;box-sizing:border-box;z-index:1000;background:#fafaf9;color:#16181d;
    font:14px/1.45 -apple-system,system-ui,sans-serif;border-left:1px solid #d9d9d6;display:none;flex-direction:column}
  #dr-panel .dr-sec{padding:16px 18px}
  #dr-panel .dr-slide{flex:1;overflow:auto;background:#fff;border-bottom:1px solid #d9d9d6}
  #dr-panel .dr-head{display:flex;align-items:center}
  #dr-panel .dr-kicker{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6d6a65;margin-bottom:2px}
  #dr-panel .dr-title{font-size:16px;font-weight:600;margin-bottom:10px;display:flex;align-items:baseline;gap:8px}
  #dr-panel .dr-title .n{font-variant-numeric:tabular-nums;color:#6d6a65;font-weight:500}
  #dr-panel .dr-sub{font-size:13px;color:#6d6a65;margin-bottom:10px}
  #dr-panel textarea{width:100%;box-sizing:border-box;border:1px solid #d9d9d6;border-radius:4px;padding:8px 10px;font:inherit;resize:vertical;background:#fff}
  #dr-panel textarea:focus{outline:none;border-color:#6d7782}
  #dr-panel #dr-text{min-height:120px}
  #dr-panel #dr-deck{min-height:90px}
  #dr-panel button{font:inherit;font-size:13px;font-weight:500;border:1px solid #d9d9d6;background:#fff;color:#16181d;border-radius:4px;padding:6px 12px;cursor:pointer}
  #dr-panel button.primary{background:#16181d;color:#fff;border-color:#16181d}
  #dr-panel button.on{background:#b58a4d;color:#fff;border-color:#b58a4d}
  #dr-panel button.link{border:none;background:none;padding:6px 4px;color:#6d6a65}
  #dr-panel button.link:hover{color:#16181d}
  #dr-panel .dr-pinbar{display:flex;align-items:center;gap:10px;margin:10px 0 4px;font-size:12px;color:#6d6a65}
  #dr-panel .dr-pinnote{display:flex;gap:8px;align-items:flex-start;margin-top:8px}
  #dr-panel .dr-pinnote .b{flex:none;width:20px;height:20px;border-radius:50%;background:#b58a4d;color:#fff;font:700 11px/20px -apple-system,system-ui,sans-serif;text-align:center;margin-top:7px}
  #dr-panel .dr-pinnote textarea{min-height:40px}
  #dr-panel .dr-pinnote .x{flex:none;border:none;background:none;color:#9a6d6d;padding:6px 2px;font-size:15px}
  #dr-panel footer{white-space:nowrap;padding:10px 18px;border-top:1px solid #d9d9d6;display:flex;gap:6px;align-items:center;font-size:12px;color:#6d6a65}
  #dr-panel .dr-close{margin-left:auto;border:none;background:none;font-size:18px;line-height:1;padding:2px 4px;color:#6d6a65}
  .dr-pin{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#b58a4d;color:#fff;
    font:700 11px/22px -apple-system,system-ui,sans-serif;text-align:center;z-index:50;box-shadow:0 0 0 2px #fff;pointer-events:none}
  .dr-pinmode .reveal .slides section{cursor:crosshair}
  #dr-hint{position:fixed;left:calc((100% - ${WIDTH}px) / 2);bottom:24px;transform:translateX(-50%);background:#16181d;color:#fff;font:13px -apple-system,system-ui,sans-serif;padding:8px 14px;border-radius:999px;z-index:1001;display:none}
  `;

  function ensurePanel() {
    if (panel) return;
    const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
    panel = document.createElement("div"); panel.id = "dr-panel";
    panel.innerHTML = `
      <div class="dr-sec dr-slide">
        <div class="dr-head"><div class="dr-kicker">This slide</div>
          <button class="dr-close" id="dr-close" title="Close (r)">×</button></div>
        <div class="dr-title"><span class="n" id="dr-num"></span><span id="dr-name"></span></div>
        <textarea id="dr-text" placeholder="Notes on this slide. Saved as you type."></textarea>
        <div class="dr-pinbar"><button id="dr-pin">Pin a spot</button><span>to note one element</span></div>
        <div id="dr-pins"></div>
      </div>
      <div class="dr-sec">
        <div class="dr-kicker">Whole deck</div>
        <div class="dr-sub">Applies everywhere: structure, theme, cuts.</div>
        <textarea id="dr-deck" placeholder="Notes on the whole deck. Saved as you type."></textarea>
      </div>
      <footer><span id="dr-count"></span><span style="margin-left:auto"></span>
        <button id="dr-clear" class="link">Clear</button>
        <button id="dr-download" class="link" title="Save review.md">Download</button>
        <button id="dr-copy" class="primary">Copy</button></footer>`;
    document.body.appendChild(panel);
    const hint = document.createElement("div"); hint.id = "dr-hint"; hint.textContent = "Click the spot on the slide · Esc to cancel"; document.body.appendChild(hint);

    // Typing in the panel must never drive the deck.
    panel.addEventListener("keydown", (e) => { if (e.key !== "Escape") e.stopPropagation(); });
    panel.querySelector("#dr-text").addEventListener("input", (e) => {
      const w = where(), k = key(w);
      if (e.target.value.trim()) state.slides[k] = { title: w.title, text: e.target.value };
      else delete state.slides[k];
      save(); count();
    });
    panel.querySelector("#dr-deck").addEventListener("input", (e) => { state.deck = e.target.value; save(); count(); });
    panel.querySelector("#dr-pin").onclick = () => setPinMode(!pinMode);
    panel.querySelector("#dr-close").onclick = toggle;
    panel.querySelector("#dr-clear").onclick = () => { if (confirmClear()) { state = { deck: "", slides: {}, pins: [] }; save(); render(); drawPins(); } };
    panel.querySelector("#dr-copy").onclick = copy;
    panel.querySelector("#dr-download").onclick = download;
  }

  // No window.confirm: a modal would block automation. A second click within 4s confirms.
  let clearArmed = 0;
  function confirmClear() {
    const b = panel.querySelector("#dr-clear"), now = Date.now();
    if (now - clearArmed < 4000) { clearArmed = 0; b.textContent = "Clear"; return true; }
    clearArmed = now; b.textContent = "Click again to clear";
    setTimeout(() => { if (panel) b.textContent = "Clear"; }, 4000);
    return false;
  }

  function setPinMode(on) {
    pinMode = on;
    panel.querySelector("#dr-pin").classList.toggle("on", on);
    document.body.classList.toggle("dr-pinmode", on);
    document.getElementById("dr-hint").style.display = on ? "block" : "none";
  }

  function onSlideClick(e) {
    if (!open || !pinMode) return;
    const section = e.target.closest(".reveal .slides section");
    if (!section) return;
    e.preventDefault(); e.stopPropagation();
    const r = section.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    const el = e.target.closest("[id], .chip, .card, li, h1, h2, h3, p, svg *");
    const TRANSIENT = /^(fragment|visible|current-fragment|fade-in|fade-out|semi-fade-out|highlight-current|present|past|future|stack)$/;
    const cls = (el && typeof el.className === "string" ? el.className : (el && el.className && el.className.baseVal) || "").trim().split(/\s+/).filter((c) => c && !TRANSIENT.test(c));
    const target = el ? (el.id ? "#" + el.id : el.tagName.toLowerCase() + (cls.length ? "." + cls.join(".") : "")) : "";
    const pin = Object.assign({ id: Date.now(), text: "", x: +x.toFixed(3), y: +y.toFixed(3), target }, where());
    state.pins.push(pin); save(); setPinMode(false); render(); drawPins();
    const ta = panel.querySelector(`[data-pin="${pin.id}"]`); if (ta) ta.focus();
  }

  const pinNumber = (p) => state.pins.indexOf(p) + 1;

  function drawPins() {
    document.querySelectorAll(".dr-pin").forEach((p) => p.remove());
    if (!open) return;
    const sections = [...document.querySelectorAll(".reveal .slides > section")];
    state.pins.forEach((n) => {
      let s = sections[n.h]; if (!s) return;
      if (s.querySelector(":scope > section")) s = s.querySelectorAll(":scope > section")[n.v] || s;
      const p = document.createElement("div"); p.className = "dr-pin"; p.textContent = pinNumber(n);
      p.style.left = n.x * 100 + "%"; p.style.top = n.y * 100 + "%";
      s.style.position = s.style.position || "relative";
      s.appendChild(p);
    });
  }

  function slidesWithNotes() {
    return new Set([...Object.keys(state.slides), ...state.pins.map((p) => `${p.h}.${p.v}`)]);
  }
  function count() {
    const n = slidesWithNotes().size, parts = [];
    if (n) parts.push(`${n} slide${n === 1 ? "" : "s"}`);
    if (state.deck.trim()) parts.push("deck");
    panel.querySelector("#dr-count").textContent = parts.length ? "Notes: " + parts.join(" + ") : "No notes yet";
  }

  function render() {
    if (!panel) return;
    const w = where();
    panel.querySelector("#dr-num").textContent = num(w);
    panel.querySelector("#dr-name").textContent = w.title;
    const text = panel.querySelector("#dr-text");
    const saved = (state.slides[key(w)] || {}).text || "";
    if (text.value !== saved) text.value = saved;
    const deckBox = panel.querySelector("#dr-deck");
    if (deckBox.value !== state.deck) deckBox.value = state.deck;
    const here = state.pins.filter((p) => p.h === w.h && p.v === w.v);
    panel.querySelector("#dr-pins").innerHTML = here.map((p) => `
      <div class="dr-pinnote"><span class="b">${pinNumber(p)}</span>
        <textarea data-pin="${p.id}" placeholder="What about this spot?">${esc(p.text)}</textarea>
        <button class="x" data-del="${p.id}" title="Remove pin">×</button></div>`).join("");
    panel.querySelectorAll("[data-pin]").forEach((ta) => ta.addEventListener("input", () => {
      const p = state.pins.find((m) => String(m.id) === ta.dataset.pin); p.text = ta.value; save(); count();
    }));
    panel.querySelectorAll("[data-del]").forEach((b) => b.onclick = () => {
      state.pins = state.pins.filter((p) => String(p.id) !== b.dataset.del); save(); render(); drawPins();
    });
    count();
  }

  function markdown() {
    const lines = [`# Deck review: ${document.title}`, "", `_${new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}_`, "", "## Whole deck", "", state.deck.trim() || "None.", ""];
    [...slidesWithNotes()].map((k) => k.split(".").map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([h, v]) => {
      const s = state.slides[`${h}.${v}`], pins = state.pins.filter((p) => p.h === h && p.v === v);
      const title = (s && s.title) || (pins[0] && pins[0].title) || "";
      lines.push(`## Slide ${h + 1}${v ? "." + (v + 1) : ""}: ${title}`, "");
      if (s) lines.push(s.text.trim(), "");
      pins.forEach((p) => {
        const frag = p.f >= 0 ? `, fragment ${p.f + 1}` : "";
        lines.push(`- Pin ${pinNumber(p)} (${Math.round(p.x * 100)}% across, ${Math.round(p.y * 100)}% down${p.target ? ", on " + p.target : ""}${frag}): ${p.text.trim() || "(no text)"}`);
      });
      if (pins.length) lines.push("");
    });
    return lines.join("\n");
  }
  function flash(msg) { panel.querySelector("#dr-count").textContent = msg; setTimeout(count, 2000); }
  function copy() {
    const md = markdown();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(md).then(() => flash("Copied"), () => flash("Copy failed; use Download"));
    else flash("Copy unavailable; use Download");
  }
  function download() {
    const a = document.createElement("a");
    const blob = new Blob([markdown() + "\n\n<!-- json -->\n" + JSON.stringify(state, null, 2)], { type: "text/markdown" });
    a.href = URL.createObjectURL(blob); a.download = "review.md"; a.click();
    flash("Saved review.md");
  }

  function toggle() {
    open = !open; ensurePanel();
    panel.style.display = open ? "flex" : "none";
    document.body.classList.toggle("dr-open", open);
    if (!open) setPinMode(false);
    deck.layout();
    render(); drawPins();
  }

  function install(reveal) {
    deck = reveal; load();
    document.addEventListener("keydown", (e) => {
      const typing = e.target && /TEXTAREA|INPUT/.test(e.target.tagName);
      if (e.key === "r" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing) toggle();
      if (e.key === "Escape" && pinMode) setPinMode(false);
      if (e.key === "Escape" && typing && open) e.target.blur();
    });
    document.addEventListener("click", onSlideClick, true);
    ["slidechanged", "fragmentshown", "fragmenthidden"].forEach((ev) => reveal.on(ev, () => { if (open) render(); }));
    reveal.on("ready", drawPins);
  }
  return { install, toggle, markdown };
})();
