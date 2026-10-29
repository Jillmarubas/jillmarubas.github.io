# The Invisible Cassette — EffectCraft build

Built with EffectCraft 0.18.0 (compositing, 3D camera, effects) and PhotoCraft 0.17.0 (photo cut-out prep).
Look: MagnatesMedia-style documentary (CLAUDE.md), one palette from the subject: the trading terminal
(black, amber phosphor text, ticker green for up, red for down). The earlier Small Print design is retired.

- `lib.jsx`: generic helpers (comps, keys with frame snapping, effects, text, type-on, rise, 35 mm camera rig with DOF).
- `mm.jsx`: the MagnatesMedia kit: `TERM` palette, `TF` fonts, rolling counters, slam-in, break-apart,
  terminal backdrop (grid + symbol columns at Z +350), document recreation, and the global finish
  (smoke, grain, vignette).
- `s1.jsx`: Scene 1 (cold open + title card), ten shots. Depth layers: backdrop Z +350, subject Z 0,
  out-of-focus ticker Z −300; every shot has a slow camera move.
- Fonts: convert `remotion/public/fonts/*.woff2` to TTF in `~/.fonts` (fontTools) and run `fc-cache -f`;
  JetBrains Mono (system) supplies ▼ ▲.
- Build and render (absolute paths):
  ```bash
  effectcraft-cli script "$PWD/s1.jsx" --empty --save-as "$PWD/s1.ecproj"
  effectcraft-cli s1.ecproj render --comp Scene1 --out "$PWD/render/s1-mm-half.mp4" --format h264 --resolution half --audio off --progress
  ```
- Sound: `remotion/scripts/mix_ic.py remotion/src/invisible-cassette/cues_s1.json` (same film times).
- Photos: the trading-floor shot uses Carol M. Highsmith's public-domain NYSE photo (Library of Congress, via
  Wikimedia Commons; `assets/nyse_floor_highsmith.jpg`, the 1920 px standard thumbnail, because Commons rate-limits
  original files). Cut in PhotoCraft: Object Selection on the booth + lasso for the pillar, Refine Edge (radius 2,
  feather 1) → `assets/nyse_fg.png`; the same selection expanded 10 px and Content-Aware Filled → `assets/nyse_bg.png`.

Lessons:
- A text layer created empty renders nothing even with a Source Text expression; create it with its full string.
- Shape groups draw first-on-top.
- The first opacity key holds backwards, so pin a 0 key at time 0 for anything that appears later.
- Expressions have no `String.substr` and fail silently (the layer shows its full text); use `slice`. A Source Text
  expression that returns "" also shows the full text, so `typeOn()` returns a space until the first character.
- Keys snap to whole frames: two keys inside one frame merge and the later one wins, so `[t − 0.001, 0], [t, 100]`
  became a slow fade from 0 s. `keys()` and `keysOut()` now snap and push a colliding key one frame on.
