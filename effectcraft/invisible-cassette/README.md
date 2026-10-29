# The Invisible Cassette — EffectCraft build

Built with EffectCraft 0.18.0 (compositing, 3D camera, effects) and PhotoCraft 0.17.0 (photo cut-out prep).
Look: MagnatesMedia-style documentary (CLAUDE.md), one palette from the subject: the trading terminal
(black, amber phosphor text, ticker green for up, red for down; paper stock only for documents and props).
Every scene follows the production file's VISUAL DIRECTIVES as corrected by the fact-check: see
`DIRECTIVES.md` for the directive → narration anchor → build table.

## Files
- `lib.jsx`: generic helpers (comps, keys with frame snapping, effects, text, type-on, rise, the 35 mm camera
  rig: a 4–6 % push per 8–10 s or a pull-back, a 0.5–1° Dutch drift, depth of field, 2-frame slams).
- `mm.jsx`: the MagnatesMedia kit: `TERM` palette, `TF` fonts, counters, break-apart, terminal backdrop,
  document recreation, three-layer photo parallax, and the global finish (smoke, grain 12 %, dust, vignette 18 %).
- `kit2.jsx`: the scene kit: `Shot`, `at("word")` (narration word times), keywords, tags, stamps, folders,
  slides, drops, highlights, maps, icons, the story-turn colour flip, and `EVENTS` (sound events for the mix).
- `s1.jsx` … `s10.jsx`, `acts.jsx`: the scenes and the four music-only act cards.
- `maps.jsx` (`tools/make_maps.py`) and `assets/world.png` (`tools/make_world.py`): Natural Earth, public domain.
- `assets/layers/<photo>/`: three-layer cut-outs (`tools/photo_layers.py`: ONNX Depth Anything V2 Small for the
  masks, PhotoCraft Refine Edge and Content-Aware Fill). The PNGs are regenerated, not committed; `check.jpg`
  shows each split.

## Build, mix, render
```bash
tools/build_all.sh                      # builds every .ecproj and writes events.json (sound events)
python3 -I ../../remotion/scripts/ic_cues.py   # cue lists placed by spoken word + build events
python3 -I ../../remotion/scripts/mix_ic.py ../../remotion/src/invisible-cassette/cues/s1.json ../../remotion/out/invisible-cassette/mix/s1.wav
tools/queue.sh "s1 Scene1 mix/s1.wav" …  # 960x540 previews with sound in render/
python3 -I tools/text_audit.py          # on-screen text must not repeat the narration
python3 -I tools/assemble_film.py       # render/film-half.mp4 + the review timeline
```
Fonts: convert `remotion/public/fonts/*.woff2` to TTF in `~/.fonts` (fontTools) and run `fc-cache -f`;
JetBrains Mono (system) supplies ▼ ▲.

## Lessons
- A text layer created empty renders nothing even with a Source Text expression; create it with its full string.
- Shape groups draw first-on-top.
- The first opacity key holds backwards, so pin a 0 key at time 0 for anything that appears later.
- Expressions have no `String.substr` and fail silently (the layer shows its full text); use `slice`. A Source Text
  expression that returns "" also shows the full text, so `typeOn()` returns a space until the first character.
- Keys snap to whole frames: two keys inside one frame merge and the later one wins. `keys()` and `keysOut()` snap
  and push a colliding key one frame on.
- A 3D layer scaled to exactly 0 under a camera crashes the renderer; use 0.5 %.
- CC Sphere: set Offset to the layer's centre explicitly (it defaults to the comp centre in layer pixels).
