# Design systems — Jillmar Ubas

Everything from the September 2026 design work, in one place. Two systems, both
built by sampling real references pixel by pixel and frame by frame, plus the
drop-in motion layer now running on the live portfolio.

Last updated: 12 September 2026

---

## What's here

| Folder / file | What it is |
|---|---|
| `cobalt-haze/cobalt-haze.html` | **Cobalt Haze** — full glassmorphism system page. Open in a browser. |
| `cobalt-haze/tokens.css` | Cobalt Haze tokens, ready to paste into any stylesheet. |
| `settle-motion/settle-motion.html` | **Settle Motion** — full motion system page with 8 live, looping demos. |
| `settle-motion/tokens.css` | Settle Motion tokens: durations (with frame counts), curves, choreography. |
| `settle-motion/motion-layer.html` | The **drop-in motion layer**. Paste before `</body>` on any page. |
| `frost-glass/frost-glass-layer.html` | The **drop-in frost glass layer** — orange field + dark glass surfaces. Running on the live portfolio. |
| `frost-glass/cv-glass-layer.html` | The CV variant — same field, but a **light** frosted sheet, screen-only so print stays white paper. |

Both `.html` files are standalone — no build step, no server. Double-click to open.

---

## Cobalt Haze — a glass UI system

Deep cobalt field, frosted panels with lit rims, one stepped headline per screen.

- **Sampled from:** "Modern glassmorphism user interface design template" (Clarity
  Engine), Freepik via Pinterest — `https://pin.it/5uPv7CgI0`. Colours read straight
  out of the 740 × 493 source image; each swatch records where it was sampled.
- **Live page:** https://claude.ai/code/artifact/aeff85f6-48ae-4ba7-bac6-d5da02d67280
- **Covers:** 8 colours, type scale (Geist + Instrument Serif italic for one word per
  heading), four glass tiers with a live tuner, components, shape, motion, tokens.
- **The one rule to remember:** glass only reads over the cobalt field. Over a flat
  colour, backdrop blur does nothing you can see.
- **Not used on the portfolio** — kept for future projects.

### Reuse
```html
<link rel="stylesheet" href="design-system/cobalt-haze/tokens.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">
```

---

## Settle Motion — a motion system

Everything arrives fast and slows into place. Scroll is the playhead, not a timer.

- **Measured from:** "Scroll animation web design" by Egor, via Pinterest —
  `https://pin.it/yXhosP1J7`. A 38.7-second fintech reel, sampled at ~25 frames;
  the page maps all 9 beats with timecodes.
- **Live page:** https://claude.ai/code/artifact/8f3a2595-b270-4e82-ab45-6ad99497c1ec
- **Covers:** 4 principles, 5 durations (in ms **and** frames at 30/60 fps), 5 easing
  curves with CSS + GSAP + After Effects equivalents, 8 live patterns, logo rules,
  reduced-motion mapping, do/don't pairs.
- **Speed control:** the page's corner dock slows every demo to ½ or ¼ speed — useful
  for reading a curve before rebuilding it elsewhere.

### The four principles
1. **Arrive, then settle.** Entrances decelerate on `settle`; exits use `depart` and run one step shorter.
2. **Scroll is the playhead.** Section reveals scrub to scroll with a 0.12 lerp. Timed motion is for feedback only.
3. **One thing moves at a time.** Never more than 3 elements in flight; words stagger 60 ms, cards 80 ms.
4. **Mint means done.** `#ABFEC1` only for completed, live or active. Never on hover.

### Reuse — the drop-in layer
`settle-motion/motion-layer.html` is self-contained (one `<style>` + one `<script>`).
Paste it immediately before `</body>`. It finds elements by class and needs no markup
changes:

| It looks for | And gives it |
|---|---|
| `.brand .name` | letters rising from a mask, 40 ms apart |
| `.hero h1`, `.sec-head h2`, `.contact h2` | words brightening with scroll |
| `.case`, `.mini`, `.cap`, `.cred`, `.chip-row` | 48 px rise + 8 px blur, 80 ms apart |
| `.stat b`, `.metrics b` | numbers counting up (keeps `~`, `%`, `s`, `k`) |
| `#contact .mailrow` | a copy-email button that morphs: press → spinner → done |

Change those selectors at the top of each block to match a different site. Elements
already on screen are never hidden, and everything stops under reduced motion.

---

## Frost glass layer — Cobalt Haze's technique in the orange palette

Cobalt Haze's four ingredients (frost, translucency, a lit rim, layered depth) applied
to the portfolio's own orange-on-black palette. One `<style>` block, pasted before
`</body>` after the site's own CSS so it wins on equal specificity.

**What it does**
- Moves the orange aurora **behind the whole page**: a fixed, slowly drifting field of
  six radial blooms over a warm floor, so no part of the page sits at flat black.
  Glass needs something behind it — over a flat colour, backdrop blur does nothing.
- Turns every surface into dark frosted glass: nav, case panels, contact, lightbox
  (blur 20px); cards (12px); chips and buttons (10px).
- Adds grain at 5% so the wide gradients never band into visible steps.

**Two rules it enforces**
- **Never glass on glass.** Boxes nested inside a glass panel (buttons, spec blocks,
  icon boxes, image frames) get a translucent fill and rim but *no* second
  `backdrop-filter` — a nested blur re-blurs the blur and turns milky.
- **Dark fill, low alpha.** Fills are near-black at ~55% rather than white, so text
  stays legible where a bright bloom passes behind the glass.

**Performance switch.** `--glass-blur-card` (in the block's `:root`) controls every
repeated card. Set it to `none` if scrolling feels heavy on integrated graphics — the
look barely changes, because the field behind is a soft gradient with nothing sharp in
it to blur. Measured at ~13 ms median frame time while scrolling with 43 glass
surfaces on screen.

---

## Where these are used

| File | State |
|---|---|
| `site/index.html` | **Live portfolio.** Original orange design + Settle Motion layer + frost glass layer. |
| `site/index-before-glass.html` | Backup: motion applied, but before the glass. |
| `site/index-before-motion.html` | Backup: the original orange design, before either layer. |
| `site/index-settle.html` | Full Cobalt-Haze-era rebuild in Settle Motion's black/white/mint. Not live. |
| `site/cv.html` | CV with the light frosted sheet on the orange field. Screen only — print stays white paper. |
| `site/cv-before-glass.html` | Backup of the CV before the glass. |

Portfolio rebuild (published): https://claude.ai/code/artifact/574a25e4-9144-4c12-872f-dff5f74aae80

---

## Notes for later

- The portrait `site/jillmar-ubas.png` already has a transparent background. Don't run
  a background remover on it again — it comes back identical.
- `site/index.html` still credits "the Relay design system" in the footer; the motion
  now comes from Settle Motion.
- The two artifact pages above are private to your Claude account. The local `.html`
  files here are the copies that survive regardless.
