// Section rail: the deck's main sections, small, down the left margin of every
// slide inside a section, with the current one marked. slides.json lists the
// sections in order as { label, start }: a section runs from the slide whose
// id is `start` to the next section's start. An entry with no label ends the
// rail (the closing slide). Slides before the first start carry no rail.
(function () {
  function install(sections) {
    if (!Array.isArray(sections) || !sections.length) return;
    const labelled = sections.filter((s) => s.label);
    let current = null;
    document.querySelectorAll(".reveal .slides > section").forEach((slide) => {
      const hit = sections.find((s) => s.start === slide.id);
      if (hit) current = hit;
      if (!current || !current.label || slide.querySelector(":scope > .section-rail")) return;
      const rail = document.createElement("div");
      rail.className = "section-rail";
      rail.setAttribute("aria-hidden", "true");
      for (const s of labelled) {
        const item = document.createElement("span");
        item.textContent = s.label;
        if (s === current) item.className = "on";
        rail.appendChild(item);
      }
      slide.appendChild(rail);
    });
    for (const s of sections) {
      if (!document.getElementById(s.start)) console.warn("[rail] no slide with id:", s.start);
    }
  }
  window.SectionRail = { install };
})();
