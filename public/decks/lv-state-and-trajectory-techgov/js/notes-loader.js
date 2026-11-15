/* Speaker notes from one markdown file.
 *
 * NOTES.md sits beside index.html:
 *
 *   ## slide-id
 *   - a bullet
 *   - another
 *
 * A heading is a slide's id (<section id="slide-id">); the bullets under it
 * are that slide's notes. Text before the first "## " heading is ignored.
 *
 * NotesLoader.load() fetches the file (never from cache) and writes each
 * block into its slide's <aside class="notes"> before Reveal.initialize(),
 * so reveal's own notes plugin and speaker view (s) work unchanged.
 *
 * Rules, kept deliberately simple because this runs on stage:
 *   - All of a slide's notes show for as long as the slide is up. Nothing is
 *     shown or hidden per fragment; any data-fragment tag on a note is removed.
 *   - A heading with notes under it replaces whatever notes the slide's HTML
 *     carries. A heading with nothing under it leaves the slide's own notes
 *     (a generated diagram slide has some) in place.
 *   - If NOTES.md does not load, or a heading matches no slide, a red banner
 *     says so at the top of the notes of every slide, where the speaker view
 *     shows it. It is never only in the console, and never on the slides.
 *
 * scripts/notes.py scaffolds the headings and checks them against the slides.
 */
window.NotesLoader = (function () {
  var BANNER = "margin:0 0 12px;padding:10px 14px;background:#c2412d;color:#ffffff;" +
    "font:600 16px/1.35 system-ui,sans-serif;";

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  // NOTES.md -> [{ id, line, lines: [...] }], in file order.
  function parse(text) {
    var blocks = [], cur = null;
    text.replace(/\r\n?/g, "\n").split("\n").forEach(function (line, n) {
      var h = /^##\s+(.+?)\s*$/.exec(line);
      if (h) { cur = { id: h[1], line: n + 1, lines: [] }; blocks.push(cur); }
      else if (cur) cur.lines.push(line);
    });
    return blocks;
  }

  // Bullets ("- " or "* ", nested by indentation) become lists; any other
  // non-empty line becomes a paragraph.
  function render(lines) {
    var out = [], depth = 0;
    function close(to) { while (depth > to) { out.push("</li></ul>"); depth--; } }
    lines.forEach(function (line) {
      var b = /^(\s*)[-*]\s+(.*)$/.exec(line);
      if (b) {
        var want = Math.floor(b[1].replace(/\t/g, "  ").length / 2) + 1;
        if (want > depth + 1) want = depth + 1;
        if (want > depth) { out.push("<ul>"); depth = want; }
        else { close(want); out.push("</li>"); }
        out.push("<li>" + inline(b[2]));
      } else if (line.trim()) {
        close(0);
        out.push("<p>" + inline(line.trim()) + "</p>");
      }
    });
    close(0);
    return out.join("");
  }

  function aside(slide) {
    var a = slide.querySelector(":scope > aside.notes");
    if (!a) {
      a = document.createElement("aside");
      a.className = "notes";
      slide.appendChild(a);
    }
    return a;
  }

  function slides() {
    // Leaf slides only: a vertical stack's wrapper is not a slide.
    return [].slice.call(document.querySelectorAll(".reveal .slides section"))
      .filter(function (s) { return !s.querySelector(":scope > section"); });
  }

  // Problems go where the speaker will see them and the audience will not:
  // first thing in every slide's notes, so the speaker view shows them
  // whichever slide is up. Nothing is drawn on the slides themselves.
  function report(problems) {
    if (!problems.length) return;
    var html = problems.map(function (p) {
      return '<p class="notes-problem" style="' + BANNER + '">' + esc(p) + "</p>";
    }).join("");
    slides().forEach(function (s) {
      var a = aside(s);
      a.querySelectorAll(".notes-problem").forEach(function (el) { el.remove(); });
      a.insertAdjacentHTML("afterbegin", html);
    });
    problems.forEach(function (p) { console.error("[notes] " + p); });
  }

  async function load(url) {
    url = url || "NOTES.md";
    var problems = [], text = null;
    try {
      var res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      text = await res.text();
    } catch (err) {
      problems.push("NOTES: " + url + " did not load (" + (err && err.message ? err.message : err) +
        "). The notes below are only what the slide files carry.");
    }

    var all = slides();
    // Nothing is per fragment, whatever a generated slide's notes were tagged with.
    all.forEach(function (s) {
      s.querySelectorAll(":scope > aside.notes [data-fragment]").forEach(function (el) {
        el.removeAttribute("data-fragment");
        el.hidden = false;
      });
    });

    if (text !== null) {
      var byId = {};
      all.forEach(function (s) { if (s.id) byId[s.id] = s; });
      var seen = {};
      parse(text).forEach(function (b) {
        if (seen[b.id]) {
          problems.push('NOTES: heading "## ' + b.id + '" appears twice in ' + url +
            " (line " + seen[b.id] + " and line " + b.line + "). The first one is shown.");
          return;
        }
        seen[b.id] = b.line;
        var slide = byId[b.id];
        if (!slide) {
          problems.push('NOTES: heading "## ' + b.id + '" (' + url + " line " + b.line +
            ") matches no slide. Its notes are not shown anywhere.");
          return;
        }
        var html = render(b.lines);
        if (html) aside(slide).innerHTML = html;
      });
    }
    report(problems);
    return problems;
  }

  return { load: load, parse: parse, render: render };
})();
