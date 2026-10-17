---
name: paper-cutout
description: Make paper-cutout style story films in Remotion (scissor-cut shapes, lifted paper shadows, animation on twos, jointed paper puppets, multiplane camera), at the film standard 23.976 fps, with a CC0 sound mix, a frame-accurate review room, and a 4K Lambda master. Use when asked for a paper-cutout, papercraft, cut-paper or construction-paper video, or for another film in the style of "The Paper Kite" or "The Keeper".
---

# Paper-cutout films: SOP

Built from two films made in this repo:
- **The Paper Kite** (`remotion/src/paperkite/`): the toolkit and the look.
- **The Keeper** (`remotion/src/keeper/`): the camera, story method, grade, sound and review loop. **Start new films from The Keeper.**

Follow the steps in order. Each one ends with a check.

**Read first, every time:**
- `anthropic-skills:video-production-psychology`: picture, edit, sound and colour decisions, and the review loop.
- `anthropic-skills:script-writing`: the story layer.
- The `motion-video` skill's non-negotiables still apply: original content only, CC0 or self-made assets, final render on Lambda.

## House defaults (the user's choices)
| Setting | Value |
|---|---|
| Frame rate | **23.976 fps**: `fps={24000 / 1001}` in `Root.tsx`, never 23 or 24. 60 s = 1,439 frames. |
| Canvas | 1080×1920 vertical. The master is rendered at `SCALE=2`, giving 4K (2160×3840). |
| Length | about 60 s, 10–15 shots |
| Look | cream and white paper, muted greys and sage, **one accent colour** carried by the story object (the kite's red, the lantern's amber) |
| Motion | drawings held **on twos** (`useStep()` / `useTw()`); camera moves on ones |
| Camera | multiplane: dolly, truck and crane through stacked paper planes; **never zoom**. This replaces the motion-video "locked camera" rule for paper films (video-production-psychology skill). |
| Text | title and end card only, on paper strips. Wordless story. |
| Sound | CC0 recordings (BigSoundBank). No music unless asked. A Shepard tone counts as sound design for tension. |
| Previews | rendered locally (free). **Lambda only for the approved master.** |

## 1. Story (15 min) → `src/<film>/SCRIPT.md`
Copy `src/keeper/SCRIPT.md` and fill it in:
- **Character:** one person with a Lie, a Ghost or wound, a Want and a Need. Pick an arc (usually positive change).
- **Schema:** set up the expected genre move, then break it. In The Keeper the keeper doesn't relight the lamp; the village becomes the light.
- **Loops:**
  - one macro loop opened in the first 2 s,
  - two meso loops,
  - micro loops per shot,
  - one deliberate grain of sand left open at the end.
  List where each loop opens and closes.
- **Suspense:** show the danger to the viewer before the character (the rocks shot).
- **Shot list:** one row per shot with time, shot type, camera move, picture, sound and grade.
  - Cut on event boundaries (a head turn, a grab, a flash).
  - Put the shot that sets the emotion right before a face (Kuleshov).
  - Alternate fast inserts with long takes; never hold peak intensity.
- **Colour curve:** brightness is lowest at the darkest beat and brightest at the release.

**Check:** every loop is paid off except the grain of sand. Every shot names its camera move, and none of them is a zoom.

## 2. Build (in `remotion/src/<film>/`)
Copy `src/keeper/` (`stage.tsx`, `props.tsx`, `shots.tsx`, `Film.tsx`, `review.json`, `SCRIPT.md`). Reuse; don't rebuild.

**Toolkit (`src/paperkite/kit.tsx`):**
- `cut(points, seed)`: a scissor-cut edge (subdivided, nudged along the normal).
- Shape generators: `ellipsePts`, `rectPts`, `bandPts`, `burstPts`.
- `<Cut lift={0..4}>`: paper with a drop shadow (glued → floating near the lens) and a pale cut-edge highlight. Define the filters once per SVG with `<PaperDefs/>`.
- `useStep()`: holds drawings on twos.
- `<Boil>` / `useBoil()`: hand-placed wobble, re-seeded every 4 frames.
- `enter()`: directional entrance with a soft settle. `towardViewer()`: exit toward the viewer.
- `<Strip>`: a word on a paper strip, in Fraunces 900 or Caveat 600.
- `<PaperFinish>`: paper-fibre texture (`public/paperkite/fiber.png`, from `scripts/make_paper_texture.py`) plus a vignette.

**Puppets (`src/paperkite/cast.tsx`):**
- `<Kid>` is a split-pin rig. It has angles for each arm and leg, `lean`, `bob`, `headTilt` and `flip`.
- Expressions: `happy`, `neutral`, `worried`, `shocked`, `joy`. `blinkAt()` for blinks.
- `walk()` gives walk and run cycles; `handPos()` returns where a hand is, for props and strings.
- `look` sets the costume: coat, hair `style: 'bob'`, sou'wester `hat`, `beard`, `stripe: null`. Examples: `GIRL`, `GRANDPA` and `VILLAGERS` in `keeper/shots.tsx`.
- Raised arms are drawn behind the head automatically so they never cover the face.

**Camera and light (`src/keeper/stage.tsx`):**
- `<Shot cam={{x, y, z}}>` wraps a shot. `<Plane d={…}>` is one paper layer: 1000 is the reference, bigger is further away.
- Moving `z` is a physical dolly (near planes grow faster). `x`/`y` truck and crane with parallax.
- Time helpers: `useT()` is seconds on ones (for the camera); `useTw()` is seconds on twos (for drawings).
- Palettes `N` (night) and `D` (day); `palMix(t)` blends between them.
- Light and weather: `Glow` (lantern light, screen blend), `Dim` (night tone on puppets), `flash()` and `FlashOverlay` (lightning, at most one strike a second), `Rain`.

**Timeline:**
- `review.json` is the single source for frames, chapters (≤ 120 s each) and shot starts plus labels.
- `Film.tsx` maps shots to components and applies the grade curve (`GRADE`: brightness and saturation per second as a CSS filter).
- Register the composition with `fps={24000 / 1001}`, `durationInFrames={REVIEW.frames}` and `defaultProps={{sound: false}}`.

**Check:** `npx tsc --noEmit` passes.

## 3. QA stills (local, about 1 min)
`node scripts/stills.mjs <Comp> <outdir> 0.3 <sec> <sec> …` gives at least one still per shot, plus the key moments (flashes, the catch, the title). The sheet's own labels assume 60 fps, so label sheets by seconds yourself. Check:
- [ ] Faces are never covered by arms or props, and a held object sits above the head (draw it before the puppet).
- [ ] The key subject is centred, and the last frame of a camera move lands on it.
- [ ] Lightning reveals and doesn't wash out (overlay ≤ 0.15, lit colours only a little lighter).
- [ ] Paper strips are wide enough for their words (Fraunces is about 0.7 em per character).
- [ ] Things that should be seen in the dark (a rope, a path) are visible before the flash.
- [ ] No stray shapes read as something else (spray ovals looked like stones on the cliff).
- [ ] Only the accent colour is saturated.

## 4. Sound → `scripts/mix_<film>.py` (copy `mix_keeper.py`)
- **Find sounds:** `python3 scripts/bsb_search.py rain "fog+horn" "church+bell"`. It reads each result's id from its own link, so ids and titles always match; an older parser shifted titles by one. All BigSoundBank sounds are CC0. List each id in the mixer's `SOUNDS` dict.
- **Levels:**
  - Level beds by body loudness (`body_rms`), around −25 to −31 dBFS.
  - Level one-shots by peak (`peak=True`), −3 to −16 dBFS. Spiky sounds like a page flick click if levelled by body.
- **Psychology rules:**
  - Off-screen sound opens the film (and can pay off at the end).
  - Audio leads a mood change by about 0.5 s (gulls before the dawn cut, the Shepard tone before the climb).
  - The storm is low-passed inside buildings (`lp=700–900`).
  - `shepard(start, end, release)` runs the tension and is released on the payoff frame.
- **Master:** −18 dBFS RMS with peaks at −1 dBFS. Output `public/<film>/mix.m4a`. Keep large WAVs in `out/`.

**Check:** the report shows every cue at its intended time, and the master is about −18 RMS and −1 peak.

## 5. Review cut (local, free)
```
cd remotion
npx remotion render src/index.ts <Comp> out/<film>-review.mp4 --scale=0.5 --props='{"sound":true}' \
  --gl=swangle --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  --concurrency=4 --crf=20
```
- It takes about 0.6 s per frame at half size (around 15 min for 60 s). Run it in the background with a 1-hour timeout; 10 minutes is not enough.
- Then split and build the page:
  - `python3 scripts/review_parts.py out/<film>-review.mp4 out/review/<film>` gives frame-exact chapter parts at 540×960, about 850 kb/s, each under 15 MB.
  - `python3 scripts/review_page.py out/review/<film>`

**Check:** every part's frame count equals its chapter length, and chapter 2's first frame matches the film's frame at that cut.

## 6. Review room (the user's notes)
- **Publish:** `out/review/<film>/index.html` with `files: {"v/<part>.mp4": …}` and `capabilities: {db: {}, user: {scopes: ["profile"]}}`, icon `film`.
- **Smoke-test the notes store:** `ArtifactData` set `notes/probe`, list it, then delete it with `if_version`.
- **What the page has:**
  - chapters, a phone-sized player, a HH:MM:SS:FF timecode (24-frame non-drop for 23.976) and frame stepping
  - a timeline with shot blocks and note pins
  - notes pinned to frames, stored in the `notes` collection as `{frame, text, author, status, reply, cut}`
- **When the user says the notes are in:**
  1. `ArtifactData list notes`.
  2. Fix each note in the code.
  3. Write a short `reply`, set `status: "fixed"` and keep `if_version`.
  4. Bump `cut` in `review.json`.
  5. Re-render locally (only the changed chapters, using `--frames`, if that's faster).
  6. Re-split and republish the same file path.
- Repeat until the user approves the cut.

## 7. Final master (Lambda, once, after approval)
```
cd remotion && SITE=<film> SCALE=2 PROPS='{"sound":true}' FRAMES_PER_LAMBDA=15 ./render-lambda.sh <Comp> out/<film>-4k.mp4
```
- `SITE=<film>` keeps other films' Lambda sites untouched.
- Verify with `npx remotion ffprobe`: 2160×3840, `24000/1001`, the right frame count and an audio stream.
- Pull 4 frames out and look at them.
- Send the file if it's under the 30 MB chat limit. Otherwise upload it to S3 `deliveries/` and send a small preview.

## 8. Deliver
- Send the film and the review-room link.
- Summarise the story beats, what each skill changed, the sound sources, and what wasn't verified (audio can't be listened to here).
- Commit `src/<film>/`, the mixer and `public/<film>/mix.m4a`; keep `out/` out of git.
- Push to a `claude/` branch and open a draft PR.

## Gotchas (learned the hard way)
- **Remotion's bundled ffmpeg is a minimal build:**
  - there is no `f32le` or `rawvideo` output: write 16-bit WAV with Python's `wave` module, and extract PNGs to compare frames;
  - an `.m4a` needs `-f mp4`;
  - there are no `trim` or `setpts` filters: cut with input `-ss` plus `-frames:v`, which is frame-exact when re-encoding.
- `ffprobe -of csv=p=0` can end its line with a trailing comma, so strip it before parsing.
- Animation on twos makes neighbouring frames identical, so a frame-match check can land one frame early. That is still correct.
- On a puppet, `bob` moves the whole body. A crouch is `bob: -60` plus bent legs, and the floor in front hides the feet.
- `Plane` scale is `d / (d - z)`. To centre a point on plane `d`, set `cam.x = (px - 540) / (1000 / d)`.
- Lightning: keep sky mixes at or below 0.6 and the screen overlay at or below 0.15. More reads as a white-out, not a flash.
- A wipe or a cut needs nothing extra in sound beyond the scene's own cues. The kite film used a whoosh plus a page flick per paper wipe; The Keeper uses hard cuts.

## Files
- `remotion/src/paperkite/`: kit, cast, set, The Paper Kite (paper wipes, locked camera, 23 fps; made before this SOP).
- `remotion/src/keeper/`: The Keeper, the reference for this SOP.
- `remotion/scripts/`: `make_paper_texture.py`, `bsb_search.py`, `mix_paperkite.py`, `mix_keeper.py`, `review_parts.py`, `review_page.py`, `stills.mjs`.
- `remotion/render-lambda.sh`: `SCALE` and `PROPS` environment options for the 4K master.
