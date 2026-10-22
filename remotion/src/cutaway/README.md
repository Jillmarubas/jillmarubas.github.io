# Cutaway demo: what's inside a fridge compressor

A 27 s, 1920×1080, 30 fps demo for a "how products work" channel. Everything is modelled in code
(three.js inside Remotion), so there are no third-party models, photos or logos.

```
npx remotion render src/cutaway/index.ts CompressorCutaway out/compressor_cutaway.mp4 --gl=swangle
python3 scripts/make_compressor_sfx.py   # rebuilds public/cutaway/compressor_sfx.wav
```

## Shots
| Time | Shot | Technique |
|---|---|---|
| 0–3.6 s | The closed compressor, title | Camera orbits and dollies (no zoom) |
| 3.6–6.4 s | A section plane sweeps through the shell | three.js clipping plane; the cut edge glows in the accent colour |
| 6.4–13.8 s | Parts lift apart; five parts get named | Exploded view with staggered offsets; labels with leader lines pinned to the parts (pre-training) |
| 13.8–22.9 s | Hard cut on the "clunk" to a close-up of the cylinder | One slow turn with Suction → Compression → Discharge, then speeds up |
| 22.9–27 s | Pull back; hot gas leaves through the discharge line | Particles ride the tube out of the shell |

## How the cutaway works (reusable)
- **Section plane:** one `THREE.Plane` shared by every material that should be cut (`clippingPlanes`), with
  `renderer.localClippingEnabled = true`. Animate `plane.constant` to sweep the cut.
- **Solid-looking cut faces:** each cut part is drawn twice: its normal material, and a flat
  `MeshBasicMaterial` on `BackSide` in a lighter "section" colour. Looking into a clipped solid you see
  its back faces, so the cut reads as a solid face. Moving parts (piston, rod, crankshaft, rotor) are not cut,
  as in printed cutaway drawings.
- **Shell rim:** the curve where the plane meets the shell is rebuilt each frame as a thin tube.
- **Labels:** `anchors(sec)` gives world positions; the HTML overlay projects them with the same camera
  function (`camAt`) the 3D scene uses, so dots stay glued to the parts while the camera moves.
- **Gas:** instanced dots. In the cylinder their count follows the gas mass and their spread follows the
  piston, so they crowd together as it compresses; colour goes from cold blue to hot red with compression.
  Suction and discharge streams follow curves and only flow while their reed valve is open.
- **Sound:** `scripts/make_compressor_sfx.py` uses the same crank-angle maths, so every reed tick lands on
  the frame its valve opens. Lessons from the first cut (the user heard "swoosh the entire video"):
  - No noise beds. Filtered noise that swells once per stroke reads as a stream of whooshes; keep the
    machine's sound tonal (hum, ticks, a soft rising tone) and let the picture show the gas.
  - Never single-pass `loudnorm`: it acts like auto-gain and pumped a -46 dB room tone up to full level.
    Use two-pass `loudnorm` with `linear=true` (one fixed gain).
  - Trim long whoosh files (`whoosh1.mp3` is 10.9 s) and keep whooshes to the big moves only.

## HyperFrames version
`hyperframes/` holds the same demo for HyperFrames: `host.ts` runs the same scene code and labels on
every `hf-seek`, and `index.html` holds the canvas, the labels, the GSAP timeline for the title and
pills, and the sound. Build and render:
```
npx hyperframes@0.8.185 init cutaway-hf --example blank
bash src/cutaway/hyperframes/build.sh cutaway-hf   # esbuild bundle + assets
cd cutaway-hf && npx hyperframes check && npx hyperframes render . -w 4
```

## Facts on screen
- "Real speed: ~50 strokes a second (fixed-speed motor on 50 Hz power)": a 2-pole induction motor runs
  just under its synchronous speed of 120 × 50 Hz / 2 = 3,000 rpm, about 2,900 rpm, so about 48 piston
  strokes a second. On 60 Hz power it's about 58. Variable-speed (inverter) compressors vary.
- Part layout follows a typical small hermetic reciprocating fridge compressor: motor below, pump on
  top, the whole mechanism on internal springs, oil sump at the bottom, reed valves on a valve plate,
  a plastic suction muffler, and a looped discharge line. Proportions are simplified, and real models
  differ in detail. Check them against the manufacturer's documentation before publishing a video
  about a specific model.
