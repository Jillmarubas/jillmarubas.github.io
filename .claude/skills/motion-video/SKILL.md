---
name: motion-video
description: Make short vertical motion-graphics videos (Reels/TikTok/Shorts, 1080×1920) in Remotion with realistic 3D assets, cinematic lighting, shadows and reflections, rendered on AWS Lambda. Use when asked to create, recreate the style of, or improve a motion-graphics / explainer / quote / brand-story / documentary-style video, to break down a reference video frame by frame, or to make 3D look real.
---

# Motion video: realistic 3D motion graphics with Remotion

This skill turns a topic or a reference video into a finished vertical video. It is built
from frame-by-frame study of six reference videos (see `reference/breakdowns.md`) and
three videos produced in this repo.

**Always follow `SOP.md` step by step.** The sections below are the rules the SOP relies on.

## Non-negotiables
1. **Render on AWS Lambda,** always (the user's standing instruction). Use `remotion/render-lambda.sh`. Local rendering is only for single preview stills.
2. **Original content only.** Learn techniques from references, but never reuse their footage, photos, logos, characters, scripts or trademarks. Use the client's own assets, public-domain data (NASA), CC0 assets (Poly Haven), or assets drawn in code.
3. **Facts must be checkable.** Every number on screen gets verified, and the source is credited on screen when it's data (for example "Moon: NASA LRO").
4. **Default 30 fps.** 24/25 fps is for cinematic or documentary looks, 60 fps only for glossy tech with fast moves. The user prefers 30.

## The house style, as measured
These values come from the references; the full evidence is in `reference/breakdowns.md`.
- **Canvas:** 1080×1920. Length 14–24 s, with a new beat every 1.5–3.5 s.
- **Palette:** near-monochrome (saturation ≤ 35/255) plus **one accent colour** on one word or object at a time.
- **Rhythm:** about 45 % of the runtime moving, about 55 % holding so viewers can read.
- **Move length:** 380–600 ms, i.e. **11–18 frames at 30 fps**.
- **Easing:** ease-in-out with peak speed at the midpoint (`bezier(0.45,0,0.2,1)`) for most moves. For a cinematic feel, snap in and settle (`bezier(0.22,1,0.36,1)`, peak speed about 20 % in).
- **Type:** pair a small script or thin serif lead-in with a heavy sans key word. Add a giant ghost word (8–15 % opacity) behind the subject.
- **Depth layers,** back to front: backdrop (paper, grid, black) → ghost word → shadow/gobo overlay → hero object → text → foreground props cut off by the frame (blurred) → grain, vignette, lens effects.

## Motion vocabulary
Each entry says which reference(s) it came from, then what already exists in this repo's
code (`remotion/src/promo/motion.tsx` unless another file is named).

| Technique | Source refs | Implementation in this repo |
|---|---|---|
| Letter reveal, blur to sharp | 1, 3 | `TypeText` (trail 4–7 frames) |
| Random-order letter pop | 4 | `ScatterText` |
| Words rising or sliding in | all | `WordRise` (`from="below"` or `"right"`) |
| Tracking-in title (letters collapse together) | 4 | Animate `letterSpacing` from 1.2em to −0.02em over 8 frames with ease-out |
| Self-drawing dashed ring / line / annotation | 3, 5 | `DashedRing`, `DrawPath` |
| Dot-grid panel behind the hero | 1, 6 | `DotGrid` |
| Motion blur by velocity | all | `velocityBlur` |
| Whip pan, zoom punch, fade | 1, 3, 5 | `stageTransform` in `remotion/src/space/Space.tsx` |
| Foreground object wipe | promo | Giant blurred object crossing the lens (`Promo.tsx`) |
| Flash / light leak | 2, 3, 6 | Full-frame warm gradient, `screen` blend, 4–8 frames |
| Iris wipe (ring or black circle) | 3, 6 | Radial mask whose radius animates 0 → 1.2 × diagonal over 8–30 frames |
| Burst reveal (radial spikes plus pop) | 4 | SVG spikes rotating and scaling behind the product |
| Photo breaks out of its card | 1, 5, 6 | Card with `overflow:hidden` plus a cut-out copy of the subject drawn over the card |
| Rapid montage in a taped frame | 5 | Swap the image every 12 frames |
| Rack focus | 2 | Per-layer CSS blur from 20 px to 0 over 25–30 frames |
| Light-sweep reveal | 6 | Animate key-light position or intensity over 20–40 frames (see realism) |

## Realism
Read `reference/realism.md` before building any 3D asset. The short version:
**real data + one consistent key light + contact shadows + an environment for
reflections + lens effects (DOF, grain, vignette, subtle chromatic aberration).**

## Files
- `SOP.md`: the step-by-step procedure (brief → reference study → build → QA → Lambda → deliver).
- `reference/breakdowns.md`: measured breakdowns of the six references.
- `reference/realism.md`: lighting, shadow, reflection, material and lens recipes, with numbers.
- `remotion/`: the working project. Compositions `BrandStory` (2D + SVG), `MoonDistance` (3D procedural) and `RealMoon` (NASA data, photoreal). Scripts: `render-lambda.sh`, `scripts/analyze-reference.sh`, `scripts/prepare-nasa-textures.py`, and the `make_*_sfx.py` sound generators.
