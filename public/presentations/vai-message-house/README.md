# Message house options — RISE Verifiable AI

Six message houses for three audiences, built on the Lucid Computing design
system. Served at `/presentations/vai-message-house`, behind the same kind of
passphrase gate as the RISE design-01 deck (`VAI_MESSAGE_HOUSE_PASSWORD` in the
Vercel project env).

## Files

| File | What it is |
| --- | --- |
| `houses.js` | **The copy.** Six houses, the kickoff draft, the cross-cutting lines. Edit this to change any words. |
| `build.js` | The machinery. Builds the slides from `houses.js`, then starts reveal. |
| `index.html` | Page shell and the deck-specific CSS. |
| `theme/lucid.css` | The Lucid Computing design system, copied verbatim from the RISE deck. |

## How it is laid out

Across is which house, down is how far into it you are. Every house has the
same six levels, so Down always means more detail whichever house you are
standing in:

1. the main message, house otherwise empty
2. the three rooms named
3. room one, zoomed in
4. room two, zoomed in
5. room three, zoomed in
6. the whole house, evidence included

Consecutive levels share element ids, so reveal's auto-animate tweens between
them and the move reads as a camera rather than a cut.

Rooms are sized in `em` off a single font-size on `.room-open`, and `fitRooms()`
in `build.js` steps that one number down until dense copy fits. That is why
houses with long sub-messages stay inside their boxes.

## Exporting the PDF

The export gives **one full house per page**: in `?print-pdf` mode `build.js`
emits only the final level of each house, so the six zoom steps collapse to a
single complete page.

The reliable way is the script, which prints at true slide size (1280×720px).
Chrome's plain `--print-to-pdf` ignores reveal's CSS page size and gives US
Letter portrait instead.

```sh
# serve the deck (from public/)
python3 -m http.server 8771

# export — 13 pages at 960×540pt
node scripts/export-deck-pdf.mjs \
  "http://localhost:8771/presentations/vai-message-house/?print-pdf" \
  ~/Desktop/vai-message-house.pdf
```

By hand in a browser: open `…/message-house/?print-pdf`, print, choose
**Landscape**, paper size **13.33 × 7.5 in**, margins **None**, and enable
background graphics.
