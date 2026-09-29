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
4. **The look comes from the user's references, never from my own taste.** This user's references are white or cream paper (see `reference/breakdowns.md`), so white paper is the default. Switching to a dark or cinematic look needs the user's explicit OK first.
5. **Default 30 fps.** 24/25 fps is for cinematic or documentary looks, 60 fps only for glossy tech with fast moves. The user prefers 30.

## The house style, as measured
These values come from the references; the full evidence is in `reference/breakdowns.md`.
- **Canvas:** 1080×1920. Length 14–24 s, with a new beat every 1.5–3.5 s.
- **Palette:** near-monochrome (saturation ≤ 35/255) plus **one accent colour** on one word or object at a time.
- **Rhythm:** about 45 % of the runtime moving, about 55 % holding so viewers can read.
- **Move length:** 380–600 ms, i.e. **11–18 frames at 30 fps**.
- **Easing:** ease-in-out with peak speed at the midpoint (`bezier(0.45,0,0.2,1)`) for most moves. For a cinematic feel, snap in and settle (`bezier(0.22,1,0.36,1)`, peak speed about 20 % in).
- **Type:** pair a small script or thin serif lead-in with a heavy sans key word. Add a giant ghost word (8–15 % opacity) behind the subject.
- **Depth layers,** back to front: backdrop (paper, grid, black) → ghost word → shadow/gobo overlay → hero object → text → foreground props cut off by the frame (blurred) → grain, vignette, lens effects.

## Choreography: the objects move, not the camera
Measured across all references (`reference/breakdowns.md`, "Asset choreography"): 58 directional entrances and 38 pops in place, and almost no camera zooms. So:
- **The camera is locked flat on the paper.** Scenes change with a whip pan along the paper wall, never a push-in or zoom.
- **Objects float in front of the paper** and cast soft shadows onto it, down and to the right.
- **Every object enters from somewhere:** left, right, top, bottom, diagonal, from the camera, or a pop. Rotate the directions so consecutive objects differ.
- **Entrances:** smooth glide, rotating, no overshoot, long soft settle (`settle()` in `cola/motion3d.tsx`). After landing, objects keep drifting a few millimetres; nothing freezes.
- **Objects interact:** pour, stamp, knock out of frame, spin down.
- **Exits come toward the viewer** (the user's preference): at the end of each scene every object eases forward off the paper, left to right a few frames apart, drifting outward so it slips past the lens, and blurs as it gets close. Entrances stay directional (left, right, top, bottom); no scale-in pops. Implemented by `ExitContext` in `cola/motion3d.tsx` plus the near-field depth-of-field pass in `MotionBlurRenderer` (`dof` prop: sharp beyond 0.92 m, fully soft at 0.35 m, 70 px max at 1080 wide). The DOF pass runs only on frames where something is near the lens.
- **True 3D motion blur:** use `Mover` + `MotionBlurRenderer` (`cola/motion3d.tsx`). Poses are functions of time; fast frames are rendered up to 8 times across a 180° shutter and averaged.
- **Reference build:** `remotion/src/cola/ColaOrigin.tsx`.

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
- **Daily news videos:** always use the approved living-gradient background (`<LivingGradient>` in `remotion/src/gradient/GradientLoop.tsx`) in the chosen design system's colours. See the SOP section "Daily news videos".
- `reference/vector-story-film.md`: **default for story videos.** 2D vector films where every script line is its own scene with a main character, emotions and cinematic shots. Read it before planning any story or explainer film.
- `remotion/`: the working project. Compositions `BrandStory` (2D + SVG), `MoonDistance` (3D procedural) and `RealMoon` (NASA data, photoreal). Scripts: `render-lambda.sh`, `scripts/analyze-reference.sh`, `scripts/prepare-nasa-textures.py`, and the `make_*_sfx.py` sound generators.
