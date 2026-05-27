# Building with agents

A reveal.js deck introducing how AI agents actually work: the anatomy of an agent (model, harness, prompts, tools), four questions to interrogate any agent, the agent loop, the current landscape, and a closing discussion of limitations.

This is the general, reusable talk. It was extracted from the johnx "AI Agents Workshop" Session-1 deck — the Surveyor build-arc and live-demo blocks were left behind, since they belong with the [surveyor-demo](https://github.com/johnx25bd/surveyor-demo) repo.

## Run it

```bash
cd decks/building-with-agents
python3 -m http.server 8765
# open http://localhost:8765
```

Opening `index.html` directly via `file://` also works. Speaker notes: press **S**. Overview: **Esc**. Fullscreen: **F**.

reveal.js is **vendored** in `lib/reveal/`, so the deck runs fully offline. The only network dependency is Google Fonts; the token font-stacks fall back to Georgia / system / Menlo if it is blocked.

## Layout

```
building-with-agents/
  index.html         the deck (flat list of horizontal sections)
  theme/johnx.css     johnx Design System → reveal.js theme
  lib/reveal/         vendored reveal.js (offline)
  media/              agent-loop.svg (inlined on "The agent loop")
  README.md           this file
```

## Conventions

- Slides are flat horizontal sections — no vertical stacks — so live navigation is a single axis.
- `section.dark` inverts to the ink theme (used for the agent-loop slide).
- `section.top` top-aligns content; default is vertically centred.
- `section.no-meridian` hides the meridian (cover + questions slides).
- Components available: `.eyebrow`, `.lede`, `.pill` / `.pill-row`, `.flowline`, `.principle`, `.cols`, `.card`, `.stat` / `.stat-label`, `.dot` (`.good`/`.warn`/`.bad`).
- This is a self-contained HTML deck — it is not built by `reveal-md` like the markdown decks under `presentations/`.
