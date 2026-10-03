# AI News, 3 Oct 2026: design

**Autopilot Blue** (`design-system/autopilot-blue/`), applied to a 16:9 Vox-style explainer at 24 fps.

- **Ground:** the SOP's living gradient in Autopilot's blue-greys (`paletteFrom([#CDDDEC, #DCE3ED, #EAEAEA, #C5D3EE])`), with Autopilot's top-to-floor wash and one low blue bloom on top, static grain. Never a diagonal wash.
- **One saturated object per view:** the cobalt (`#0571F8` body, `#2082FD` lit plane, 1.5 px white rim) goes on the one thing the line is about: the $1B brick, the agent cube, the lit cores. Everything else is blue-biased grey. Brand colours appear only on the brands' own logos.
- **Shadows are blue bloom** (`rgba(10,58,140,…)`), never grey. 3D logos cast a blue contact shadow.
- **Type:** Instrument Sans 600 for names and numbers, IBM Plex Mono for labels/sources (blue ink on blue wash), Hanken Grotesk for rows. On-screen text is only names and titles, quoted words, numbers and sources.
- **Story cards:** the story number dissolves down the veil ramp (.62 → .05), the title at full ink.
- **Motion:** arrive on `swift (.22,1,.36,1)` in 13 frames, change size on `morph (.65,0,.35,1)`, no overshoot; drift while held; exit toward the viewer with blur. Pieces are keyed to the exact spoken word (`useW`, word timestamps in `timing.json`).
- **Outro:** the Autopilot signature morph — a cobalt pill widening into a card.
