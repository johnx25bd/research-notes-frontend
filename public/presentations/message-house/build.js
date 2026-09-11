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
const DECK_FOOT = "Message house options · RISE Verifiable AI";

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

            // Every room gets an anchor. Where the source writes a headline,
            // that is it; where it does not, the room's opening sentence is
            // set as a lead. No words are added either way.
            let anchor, rest;
            if (room.head) {
                anchor = `<div class="room-head" data-id="${house.id}-h${n}">${esc(room.head)}</div>`;
                rest = room.lines;
            } else {
                anchor = `<p class="room-lead" data-id="${house.id}-h${n}">${esc(room.lines[0])}</p>`;
                rest = room.lines.slice(1);
            }
            const lines = rest.map((l, k) => `<p data-id="${house.id}-l${n}-${k}">${esc(l)}</p>`).join("");

            return `
                <div class="${cls}" data-id="${house.id}-room${n}">
                    <div class="room-open">
                        <div class="room-tag" data-id="${house.id}-t${n}">${esc(room.tag)}</div>
                        ${anchor}
                        <div class="room-lines">${lines}</div>
                    </div>
                    <div class="room-spine"><span>${esc(room.tag)}</span></div>
                </div>`;
        })
        .join("");

    const found = house.evidence.map((e) => `<span>${esc(e)}</span>`).join("");

    return `
        <div class="hh" data-id="${house.id}-hh">
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
        <div class="house" data-id="${house.id}-house">
            <div class="roof" data-id="${house.id}-roof">
                <span class="label label--accent">Main message</span>
                <p>${esc(house.core)}</p>
            </div>
            <div class="rooms" data-id="${house.id}-rooms" style="grid-template-columns: ${lv.cols}">${rooms}</div>
            <div class="found${lv.key === "all" ? "" : " is-empty"}" data-id="${house.id}-found">
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
    const cards = HOUSES.map(
        (h) => `
        <div class="st">
            <div class="st-head"><span class="st-aud">${esc(h.audience)}</span><span class="st-var">Variant ${esc(h.variant)}</span></div>
            <div class="st-name">“${esc(h.name)}”</div>
            <div class="st-core">${esc(h.core)}</div>
            <div class="st-rooms">${h.rooms.map((r) => `<b>${esc(r.tag)}</b>`).join("")}</div>
        </div>`,
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
        <h2>Across for variants, down for detail.</h2>
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
                <h4>Out <span class="keys">Esc</span></h4>
                <p>The full grid, every house and every level at once. <span class="keys">S</span> opens the speaker notes.</p>
            </div>
        </div>
        <p class="label" style="margin-top: 36px">Every house runs the same spine — risk, then the reason restraint is hard, then verification</p>`;
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
        <h2 style="font-size: 36px">Lines that work in any house.</h2>
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
        <section class="title">
            <p class="label">RISE × Lucid Computing · Verifiable AI</p>
            <h1>Message<br /><span class="text-accent">house options.</span></h1>
            <p class="lead">Six ways to say the same thing, for three audiences.<br />Working draft · ${new Date().getFullYear()}</p>
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
            <div class="eyebrow"><span class="label label--accent">Message house options</span></div>
            <h2>Which house?</h2>
            <p>Pick one per audience, then fill the evidence.<br />RISE × Lucid Computing · Verifiable AI</p>
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
