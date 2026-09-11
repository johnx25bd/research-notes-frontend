/* ============================================================
   Message House — machinery
   ============================================================

   Builds the deck from HOUSES in houses.js, then starts reveal.

   Horizontal = which house.  Vertical = how far into it you are.
   Every house has the same six levels, so Down always means "more
   detail" and Up always means "pull back", whichever house you are
   standing in. Consecutive levels share element ids, so reveal's
   auto-animate tweens between them and the zoom reads as a camera
   move rather than a cut.

   In ?print-pdf mode only the final level is built, which is what
   makes "one full house per page" fall out of a normal PDF export.
   ============================================================ */

const IS_PRINT = /print-pdf/gi.test(window.location.search);
const DECK_FOOT = "Verifiable AI Message House";

// Horizontal index of the first house: cover, instructions, overview, draft.
// The overview's links are built from it.
const HOUSE_SLIDE_0 = 4;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---- Levels -------------------------------------------------
   Six rungs, identical in every house.
   ------------------------------------------------------------ */
function levelsFor(house) {
    return [
        { key: "core", label: "Main message", cols: "1fr 1fr 1fr" },
        { key: "frame", label: "Three rooms", cols: "1fr 1fr 1fr" },
        { key: "room", room: 0, label: house.rooms[0].tag, cols: "1fr 72px 72px" },
        { key: "room", room: 1, label: house.rooms[1].tag, cols: "72px 1fr 72px" },
        { key: "room", room: 2, label: house.rooms[2].tag, cols: "72px 72px 1fr" },
        { key: "all", label: "Whole house", cols: "1fr 1fr 1fr" },
    ];
}

/* ---- One house at one zoom level ---------------------------- */
function houseHTML(house, levels, i) {
    const lv = levels[i];

    const ladder = levels.map((_, n) => `<i class="${n <= i ? "on" : ""}"></i>`).join("");

    const rooms = house.rooms
        .map((room, n) => {
            let cls = "room";
            if (lv.key === "core") cls += " is-empty";
            else if (lv.key === "frame") cls += " is-frame";
            else if (lv.key === "room") cls += n === lv.room ? " is-focus" : " is-collapsed";

            // Sub-messages land one at a time at the frame level; a room's
            // bullets land one at a time once you are standing in it.
            const headFrag = lv.key === "frame" ? ` fragment fade-in" data-fragment-index="${n}` : "";
            const lineFrag = lv.key === "room" && n === lv.room ? " fragment fade-in" : "";

            // Every room gets an anchor. Where the source writes a headline,
            // that is it; where it does not, the room's opening sentence is
            // set as a lead. No words are added either way.
            let anchor, rest;
            if (room.head) {
                anchor = `<div class="room-head${headFrag}">${esc(room.head)}</div>`;
                rest = room.lines;
            } else {
                anchor = `<p class="room-lead${headFrag}">${esc(room.lines[0])}</p>`;
                rest = room.lines.slice(1);
            }
            const lines = rest.map((l) => `<p class="${lineFrag.trim()}">${esc(l)}</p>`).join("");

            // data-id lives only on the room box. The auto-animate matcher
            // below pairs nothing else, so changing level moves these three
            // boxes horizontally and cross-fades their contents. Nothing flies
            // in from a corner, and a fast keypress has little to interrupt.
            return `
                <div class="${cls}" data-id="${house.id}-room${n}">
                    <div class="room-open">
                        <div class="room-tag">${esc(room.tag)}</div>
                        ${anchor}
                        <div class="room-lines">${lines}</div>
                    </div>
                    <div class="room-spine"><span>${esc(room.tag)}</span></div>
                </div>`;
        })
        .join("");

    const found = house.evidence.map((e) => `<span>${esc(e)}</span>`).join("");

    // One cue, on the first house's empty first level: at that point nothing
    // on screen says the detail is underneath rather than to the right.
    const cue =
        house.id === HOUSES[0].id && lv.key === "core"
            ? `<div class="cue"><button type="button" onclick="Reveal.down()">
                   <span>Go deeper</span><span class="chev"></span>
               </button></div>`
            : "";

    return `${cue}
        <div class="hh">
            <div class="hh-l">
                <span class="hh-aud">${esc(house.audience)}</span>
                <span class="hh-var">Variant ${esc(house.variant)}</span>
                <span class="hh-name">“${esc(house.name)}”</span>
            </div>
            <div class="hh-r">
                <span class="hh-lvl">${esc(lv.label)}</span>
                <span class="ladder">${ladder}</span>
            </div>
        </div>
        <div class="house">
            <div class="roof">
                <span class="label label--accent">Main message</span>
                <p>${esc(house.core)}</p>
            </div>
            <div class="rooms" style="grid-template-columns: ${lv.cols}">${rooms}</div>
            <div class="found${lv.key === "all" ? "" : " is-empty"}">
                <span class="label">Evidence</span>
                <div class="found-items">${found}</div>
            </div>
        </div>`;
}

/* ---- Speaker notes ------------------------------------------
   Scannable, structural: what is on screen and what to watch.
   ------------------------------------------------------------ */
function notesFor(house, levels, i) {
    const lv = levels[i];
    const tags = house.rooms.map((r) => r.tag).join(" → ");
    let bullets;

    if (lv.key === "core") {
        bullets = [
            `Audience: ${house.audience}. Variant ${house.variant}, “${house.name}”.`,
            "Read the roof. That is the whole message if you only get one sentence.",
            "The house is empty — nothing is claimed yet.",
        ];
    } else if (lv.key === "frame") {
        bullets = [`The three rooms: ${tags}.`, "Same spine in all six houses — only the words change.", "Down to walk into the first room."];
    } else if (lv.key === "room") {
        const room = house.rooms[lv.room];
        bullets = [`Room ${lv.room + 1} of 3 — ${room.tag}.`].concat(room.lines.map((l) => l));
    } else {
        bullets = [
            "The whole house, foundation included.",
            "This is the level that exports to PDF — one page per house.",
            `Evidence: ${house.evidence.length} items.`,
            "Right to the next variant, up to climb back out.",
        ];
    }

    return `<aside class="notes"><ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></aside>`;
}

/* ---- Static slides ------------------------------------------ */
function streetHTML() {
    // Each card links straight into its house. HOUSE_SLIDE_0 is the horizontal
    // index of the first house, so the hrefs stay right if slides are added
    // before them.
    const cards = HOUSES.map(
        (h, i) => `
        <a class="st" href="#/${HOUSE_SLIDE_0 + i}">
            <div class="st-head"><span class="st-aud">${esc(h.audience)}</span><span class="st-var">Variant ${esc(h.variant)}</span></div>
            <div class="st-name">“${esc(h.name)}”</div>
            <div class="st-core">${esc(h.core)}</div>
        </a>`,
    ).join("");
    return `
        <div class="eyebrow"><span class="label label--accent">Overview</span></div>
        <h2>Six houses, one street.</h2>
        <div class="street" style="margin-top: 26px">${cards}</div>`;
}

function draftHTML() {
    const rooms = SESSION_DRAFT.rooms
        .map((r) =>
            r.open
                ? `<div class="dr open"><span class="dr-open-label">Third slot open</span></div>`
                : `<div class="dr"><div class="room-tag">${esc(r.tag)}</div>${r.lines.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`,
        )
        .join("");
    return `
        <div class="eyebrow"><span class="label label--accent">Reference</span></div>
        <h2 style="font-size: 34px">Johanna's kickoff draft.</h2>
        <div class="roof" style="margin-top: 16px">
            <span class="label">Main message (draft)</span>
            <p style="font-size: 17px; font-weight: 400">${esc(SESSION_DRAFT.core)}</p>
        </div>
        <div class="draft-rooms">${rooms}</div>
        <p class="label" style="margin-top: 12px">${esc(SESSION_DRAFT.evidence)}</p>`;
}

function howHTML() {
    return `
        <div class="eyebrow"><span class="label label--accent">How to move</span></div>
        <h2>Instructions</h2>
        <div class="legend">
            <div>
                <h4>Across <span class="keys">←</span> <span class="keys">→</span></h4>
                <p>Six houses in three audience pairs: general public, scientific, policy. Each pair is two ways of saying the same thing.</p>
            </div>
            <div>
                <h4>Down <span class="keys">↑</span> <span class="keys">↓</span></h4>
                <p>Six levels inside every house: the main message, the three rooms named, each room walked into, then the whole house with its evidence.</p>
            </div>
            <div>
                <h4>Step <span class="keys">Space</span></h4>
                <p>Sub-messages arrive one at a time, and so do the bullets inside a room. Down skips straight to the next level.</p>
            </div>
            <div>
                <h4>Out <span class="keys">Esc</span></h4>
                <p>The full grid, every house and every level at once. <span class="keys">S</span> opens the speaker notes.</p>
            </div>
        </div>
        <p class="label" style="margin-top: 32px">On the next slide, click any house to jump straight into it</p>`;
}

function crossHTML() {
    const cards = CROSS_CUTTING.map(
        (c) => `
        <div class="card">
            <div class="card-header"><span>${esc(c.tag)}</span></div>
            <div class="card-body"><p>${esc(c.line)}</p></div>
        </div>`,
    ).join("");
    return `
        <div class="eyebrow"><span class="label label--accent">Cross-cutting</span></div>
        <h2 style="font-size: 36px">Global messages</h2>
        <div class="xc">${cards}</div>`;
}

function sayHTML() {
    const rows = RIGHT_NOW.map(
        (r) => `<div class="row"><b>${esc(r.prompt)}</b><p>${esc(r.line)}</p></div>`,
    ).join("");
    return `
        <div class="eyebrow"><span class="label label--accent">Agreed</span></div>
        <h2 style="font-size: 36px">What we can say right now.</h2>
        <div class="say">${rows}</div>`;
}

/* ---- Assemble ----------------------------------------------- */
(function build() {
    const slides = document.querySelector(".reveal .slides");
    const out = [];

    out.push(`
        <section class="title" data-foot="RISE × Lucid Computing">
            <h1>Verifiable AI<br /><span class="text-accent">Message House</span></h1>
            <aside class="notes"><ul>
                <li>Six houses, three audiences, two variants each</li>
                <li>Same structure every time: one roof, three rooms, one foundation</li>
                <li>Next slide explains how to move around</li>
            </ul></aside>
        </section>`);

    out.push(`<section>${howHTML()}<aside class="notes"><ul>
        <li>Across = variants, down = detail</li>
        <li>Esc for the whole grid</li>
        <li>The shared spine is the finding: all six argue in the same order</li>
    </ul></aside></section>`);

    out.push(`<section>${streetHTML()}<aside class="notes"><ul>
        <li>All six main messages side by side</li>
        <li>Third chip is Verification in every house — that is the slot Johanna's draft left open</li>
        <li>Pick one and go down</li>
    </ul></aside></section>`);

    out.push(`<section>${draftHTML()}<aside class="notes"><ul>
        <li>Johanna's working draft from the kickoff, kept for comparison</li>
        <li>Third sub-message slot is blank</li>
        <li>The six houses fill that slot with the verification pillar</li>
        <li>Evidence not yet filled</li>
    </ul></aside></section>`);

    HOUSES.forEach((house) => {
        const levels = levelsFor(house);
        const foot = `${house.audience} · Variant ${house.variant}`;
        const idx = IS_PRINT ? [levels.length - 1] : levels.map((_, i) => i);

        const sections = idx
            .map(
                (i) => `
            <section class="house-slide" data-auto-animate data-auto-animate-duration="0.6"
                     data-foot="${esc(foot)}" id="${house.id}${IS_PRINT ? "" : "-" + i}">
                ${houseHTML(house, levels, i)}
                ${notesFor(house, levels, i)}
            </section>`,
            )
            .join("");

        out.push(IS_PRINT ? sections : `<section>${sections}</section>`);
    });

    out.push(`<section>${crossHTML()}<aside class="notes"><ul>
        <li>Usable in any house, with any audience</li>
        <li>Remit line is the one to lead with when asked what we think policy should be</li>
    </ul></aside></section>`);

    out.push(`<section>${sayHTML()}<aside class="notes"><ul>
        <li>Short agreed statements anyone on the project can use</li>
        <li>Answering the prompts from the kickoff slide</li>
    </ul></aside></section>`);

    out.push(`
        <section class="ink closing">
            <div class="eyebrow"><span class="label label--accent">Verifiable AI Message House</span></div>
            <h2>Questions</h2>
            <aside class="notes"><ul>
                <li>The ask: one house per audience</li>
                <li>Then the foundation gets filled with real evidence</li>
            </ul></aside>
        </section>`);

    slides.innerHTML = out.join("\n");

    Reveal.initialize({
        width: 1280,
        height: 720,
        margin: 0,
        minScale: 0.2,
        maxScale: 2.0,
        center: false, // the theme centres with flex
        display: "flex", // so section layout rules own the slide
        hash: true,
        slideNumber: false, // numbering lives in the slide foot
        transition: "fade",
        transitionSpeed: "fast",
        controls: false,
        progress: true,
        pdfMaxPagesPerSlide: 1,
        pdfSeparateFragments: false,

        // Auto-animate pairs elements by data-id first and then guesses at the
        // rest by shape and text. The guessing is what made the zoom lurch:
        // headings and bullets in one room were being matched to their
        // counterparts in another and flown diagonally across the slide, and
        // interrupting that mid-flight left the house in pieces. Pair only
        // what carries a data-id -- the three room boxes -- so the only thing
        // that moves is a room's width. Everything else cross-fades in place.
        autoAnimateMatcher: (fromSlide, toSlide) => {
            const pairs = [];
            toSlide.querySelectorAll("[data-id]").forEach((to) => {
                const from = fromSlide.querySelector(`[data-id="${to.dataset.id}"]`);
                if (from) pairs.push({ from, to });
            });
            return pairs;
        },
        autoAnimateDuration: 0.45,
        autoAnimateEasing: "cubic-bezier(0.2, 0, 0, 1)",
        autoAnimateUnmatched: false,

        plugins: [RevealNotes],
    }).then(() => {
        // Slide foot: brand mark + wordmark left, mono label right.
        document.querySelectorAll(".reveal .slides section:not(.stack)").forEach((s) => {
            if (s.classList.contains("no-foot") || s.querySelector(":scope > .slide-foot")) return;
            const foot = document.createElement("div");
            foot.className = "slide-foot";
            foot.innerHTML =
                '<div class="brand"><img src="theme/lucid-logo.svg" alt=""><span>Lucid Computing</span></div>' +
                '<span class="label"></span>';
            foot.querySelector(".label").textContent = s.dataset.foot || DECK_FOOT;
            s.appendChild(foot);
        });

        if (!IS_PRINT) buildNav();

        fitRooms();
        // A slide is only measurable once reveal has laid it out, so fit the
        // one being shown as it arrives.
        Reveal.on("slidechanged", (e) => fitRooms(e.currentSlide));
        Reveal.on("ready", (e) => fitRooms(e.currentSlide));

        // Print view builds its pages asynchronously and finishes after this
        // promise resolves, so a fit done now measures boxes that do not exist
        // yet. Wait for the pages and the webfonts, then fit and raise a flag
        // the PDF exporter waits on. The fitter resets to the base size before
        // measuring, so running it twice is safe.
        if (IS_PRINT) settleForPrint();
    });
})();

/* ---- Click navigation ----------------------------------------
   Everything the arrow keys do, for a viewer using a mouse.

   The deeper button is deliberately not a plain Reveal.down(): if the
   slide still has hidden fragments it steps those first, so clicking
   through never skips the sub-messages the way bare Down does.
   ------------------------------------------------------------ */
function buildNav() {
    const chev = (dir) => `<span class="g g-${dir}"></span>`;
    const grid =
        '<svg class="grid" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">' +
        '<rect x="0" y="0" width="6" height="6"/><rect x="8" y="0" width="6" height="6"/>' +
        '<rect x="0" y="8" width="6" height="6"/><rect x="8" y="8" width="6" height="6"/></svg>';

    const nav = document.createElement("nav");
    nav.className = "nav";
    nav.setAttribute("aria-label", "Slide navigation");
    nav.innerHTML = `
        <button type="button" data-go="left"  title="Previous house"   aria-label="Previous house">${chev("left")}</button>
        <button type="button" data-go="up"    title="Back out a level" aria-label="Back out a level">${chev("up")}</button>
        <button type="button" data-go="down"  title="Go deeper"        aria-label="Go deeper" class="primary">${chev("down")}</button>
        <button type="button" data-go="right" title="Next house"       aria-label="Next house">${chev("right")}</button>
        <button type="button" data-go="grid"  title="Overview of every slide" aria-label="Overview of every slide">${grid}</button>`;

    nav.addEventListener("click", (e) => {
        const go = e.target.closest("button")?.dataset.go;
        if (!go) return;
        if (go === "grid") Reveal.toggleOverview();
        else if (go === "down") Reveal.availableFragments().next ? Reveal.next() : Reveal.down();
        else Reveal[go]();
    });

    document.querySelector(".reveal").appendChild(nav);

    const sync = () => {
        const routes = Reveal.availableRoutes();
        const frags = Reveal.availableFragments();
        const can = { left: routes.left, right: routes.right, up: routes.up, down: routes.down || frags.next, grid: true };
        nav.querySelectorAll("button").forEach((b) => {
            b.disabled = !can[b.dataset.go];
        });
    };

    ["ready", "slidechanged", "fragmentshown", "fragmenthidden", "overviewshown", "overviewhidden"].forEach((ev) =>
        Reveal.on(ev, sync),
    );
    sync();
}

/* ---- Fit -----------------------------------------------------
   The houses carry real copy of uneven length, and a room that
   clips is worse than a room set a point smaller. Everything in a
   room is sized in em off .room-open, so shrinking that one value
   scales the whole room. Step down until it fits, then stop.
   ------------------------------------------------------------ */
function fitRooms(root) {
    (root || document).querySelectorAll(".room-open").forEach((el) => {
        const room = el.closest(".room");
        if (room.classList.contains("is-collapsed")) return; // measured at the wrong width
        if (!el.clientHeight) return; // slide not laid out yet — nothing to measure against

        const base = room.classList.contains("is-focus") ? 18 : 13;
        const min = base * 0.72;
        let size = base;
        el.style.fontSize = size + "px";

        // scrollHeight vs clientHeight: .room-open clips, so this is content height
        let guard = 40;
        while (el.scrollHeight > el.clientHeight + 1 && size > min && guard--) {
            size -= 0.25;
            el.style.fontSize = size + "px";
        }
    });
}

// Room widths only settle once reveal has laid the slide out and scaled it.
window.addEventListener("resize", () => {
    clearTimeout(window.__fitT);
    window.__fitT = setTimeout(() => fitRooms(), 150);
});

/* ---- Print readiness ----------------------------------------
   scripts/export-deck-pdf.ts waits for data-print-ready rather
   than guessing at a sleep, so the export cannot race the fit.
   ------------------------------------------------------------ */
async function settleForPrint() {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < 150 && !document.querySelector(".pdf-page"); i++) await wait(100);
    try {
        await document.fonts.ready;
    } catch {
        /* no font loading API — measure with what we have */
    }

    fitRooms();
    await wait(300);
    fitRooms(); // second pass: the first can shift wrapping and so the boxes

    document.documentElement.dataset.printReady = "1";
}
