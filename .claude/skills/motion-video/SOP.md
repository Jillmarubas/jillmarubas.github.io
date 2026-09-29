# SOP: making a realistic motion-graphics video

Follow the steps in order. Each step ends with a check; don't move on until it passes.

---

## 0. Set up (once per session, about 3 min)
1. `cd remotion && npm install`
2. Check Lambda access: `./render-lambda.sh --check`. It prints the function and sites. If it fails, see "Troubleshooting".
3. Check the account's concurrency: it was 10 when this was written, with an increase to 1,000 requested. Use `FRAMES_PER_LAMBDA = ceil(frames / (concurrency - 2))`, which leaves room for the orchestrator.

**Check:** the function `remotion-render-4-0-529-...` is listed.

## 1. Brief (5 min)
Write these down before touching code:
- **Topic and one-line message.** The hook question is asked in the first 2 s and answered by the end.
- **Beats:** 4–6 scenes of 1.5–3.5 s each, plus a call-to-action scene. Total 14–24 s.
- **Look:** use the look of the user's references (white paper for this user). Only pick another from `reference/breakdowns.md` (white studio, dark cinematic, cream paper with window light, black listicle, archival grey, editorial poster). Choose **one accent colour**.
- **Frame rate:** 30 (default), 24/25 for cinematic, 60 for fast glossy tech.
- **Assets:** what's real data, what comes from CC0, what gets modelled in code. There must be **no** third-party logos, characters or footage.
- **Facts:** list every number, each with its source.

**Check:** every on-screen claim has a source, and every asset has a licence.

## 2. Study any reference the user sends (10–20 min per video)
1. Download it (Pinterest: resolve `pin.it` → find `v1.pinimg.com/videos/..._720w.mp4`).
2. Run `scripts/analyze-reference.sh <video.mp4> <outdir>`. It produces:
   - contact sheets at 4 fps with timestamps (look at every sheet), and
   - a metrics report: fps, cuts, shot lengths, luma/contrast/saturation, move durations and where the peak speed falls.
3. For each scene, write down in `reference/breakdowns.md` (append a new section):
   - the **layers, back to front**, and what moves in each (direction, distance in px, frames, easing),
   - **entrances and exits** (fade, blur, slide, scale, mask, break-out),
   - **transitions** (cut, whip, flash, iris, defocus, object wipe) with frame counts,
   - **light** (key direction, rim, colour temperature, gobo), **shadows** (contact, cast, gobo), **reflections** (environment, rim highlights),
   - **lens** effects (DOF, grain, vignette, chromatic aberration, bloom, light leaks).
4. Pull the techniques into a style list. Don't copy the content.

**Check:** you can say, for any second of the reference, what is moving and how.

## 3. Build (in `remotion/src/<project>/`)
1. **Timeline first.** Put the scene cut frames in a `CUTS` array; transitions straddle the cuts.
2. **Stage:** backdrop, ghost word and grid in HTML/CSS; 3D in a single `ThreeCanvas` for the whole video (switch its content by scene); text overlays in HTML above it.
3. **3D assets:** follow `reference/realism.md`.
   - Load real textures with `delayRender`, and release them with `continueRender` only after React has committed.
   - Use one key light per scene, contact shadows, an environment map for anything metallic, and ACES tone mapping.
4. **Motion:** reuse `promo/motion.tsx`. Moves are 11–18 frames at 30 fps; hold 40–60 % of each scene still for reading.
5. **Lens pass:** vignette, grain, velocity blur on fast moves, a subtle chromatic aberration if the look calls for it.
6. **Sound:** use real CC0 recordings (BigSoundBank), levelled by the loudness of their *body* rather than their peak (`scripts/prepare-cola-assets.py`), over a low-passed music bed. Before rendering on Lambda, render a sound-only composition locally and check that every cue peaks at least 12 dB above the music. Synthesized effects are a fallback; start from the `make_*_sfx.py` generators (whooshes on cuts, impacts on landings, ticks on counters, pad bed). Put the WAV in `public/`.
7. **Fonts:** bundle them in `public/fonts` and load them through `promo/fonts.ts`. Never fetch Google Fonts at render time.

**Check:** `npx tsc --noEmit` passes.

## 4. QA with preview stills (local, about 1 min)
Render 6–8 stills, one per scene plus the middle of each transition:

```
npx remotion still src/index.ts <Comp> out/p<frame>.jpg --frame=<n> --scale=0.4 \
  --gl=swangle --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

Put them on a contact sheet and check:
- [ ] Nothing important is cropped, and text never collides with a 3D object.
- [ ] One key light direction per scene, and the shadows agree with it.
- [ ] Metals show reflections (not flat black), and there's a contact shadow under anything resting.
- [ ] Contrast and readability: text over busy areas gets a scrim or gradient.
- [ ] Counters and numbers aren't visible before their start frame.
- [ ] Credits are present for any real data.

Fix the problems and re-shoot only the stills that changed.

## 5. Render on Lambda (always)
```
cd remotion && FRAMES_PER_LAMBDA=<n> ./render-lambda.sh <CompositionId> out/<name>.mp4
```
- The script deploys the site, starts **one** render, polls `progress.json` **in S3** (polling through Lambda would use up concurrency slots), then downloads `out.mp4`.
- Output is **private**.
- If it's throttled: **don't retry in a loop.** Every retry leaves orphaned renderers running, which eat concurrency. Wait until CloudWatch `ConcurrentExecutions` is 0, then run once.
- **Limits:**
  - Remotion refuses more than **200 functions** per render, so `FRAMES_PER_LAMBDA ≥ frames / 200`.
  - Motion-blurred 3D frames can exceed the default 30 s per-frame limit; `start-lambda-render.mjs` allows 4 minutes.
  - Use 15 frames per Lambda for a 60 s 3D video (120 functions).
- **Every asset download retries with backoff** (`withRetry` in `cola/assets.tsx`). Hundreds of renderers fetching the same files from S3 at once will occasionally see a failed request. A bare `Error: Event` from the renderer means a download failed.

**Sound check before rendering:**
- Mix every cue into **one** mastered file (`scripts/mix_cola_audio.py`, timings from `timeline.json`) and use a single `<Audio>`.
- Confirm the mixer report shows every cue at least 6 dB over the music and the master at about −16 to −18 dBFS RMS with peaks at −1 dBFS.
- After rendering, measure the MP4's own audio track, and send the user the standalone `out/cola-soundtrack.m4a` too, so they can tell a muted player from a silent file.

**Check:** `npx remotion ffprobe out/<name>.mp4` shows the right duration, 1080×1920, the fps, and an audio stream.

## 6. Verify the final file
Extract 4 frames from the Lambda output (`npx remotion ffmpeg -ss <t> -i out.mp4 -frames:v 1 ...`) and look at them. Lambda rendering can differ from local (fonts, textures, WebGL).

## 7. Deliver
- Send the MP4.
- Summarise the beats, the techniques used, where the data came from, render time and cost, and anything not verified (for example, audio can't be listened to here).
- If the reference study taught something new, append it to `reference/breakdowns.md` or `reference/realism.md`.

---

## Long-form 16:9 explainers (Vox style)
Reference build: `remotion/src/dc/`, the "Why people hate data centres" explainer.

1. **Script first,** using `reference/vox-script-method.md`: a scene table with time, narration of 20 words or fewer per line, and what's on screen.
   - Research every number and list it in `RESEARCH.md`.
   - Get the user's approval before production.
2. **Voiceover:** use ElevenLabs, one take per chapter, with voice and model fixed for the whole film.
   - **Default narrator: Asher, voice ID `tMvyQtpCVQ0DkixuYm6J`,** on `eleven_multilingual_v2`. The user chose this voice for the data-centres explainer and asked for it to be the SOP default. Use it for every voiceover unless the user asks for a different voice.
   - Rejected voices, never to be used: "Grounded Woman Narrator" (`6eEQXEFYsrOsaQlOdxlJ`).
   - **A new voice needs the user's choice first.** If the user wants a voice other than Asher, send 3–4 voice preview links (they're free), then generate one short test line (at most about 60 s) and wait for their OK before generating anything longer. Never pick a new narrator yourself for a long script. That mistake once wasted about 10,800 credits on a voice the user rejected.
   - Check the account's credits before starting: about 1 credit per character on `eleven_multilingual_v2`.
   - A 15-minute script needs about 11k credits.
3. **Timing:** `scripts/dc_timing.py` aligns every script line to the take with local word timestamps (faster-whisper) and writes `timing.json`.
   - Chapters without a take get estimated times, so picture can be built first.
4. **Build:**
   - Scenes start at a line and run to the next scene.
   - A `Piece` gives the house choreography: directional entrance, drift, and an exit toward the viewer with blur.
   - Tokens live in `DESIGN.md` / `design.ts`.
   - Charts follow the dataviz skill.
   - **Never interpolate data points you don't have:** plot only sourced values.
5. **Sound:**
   - `make_dc_music.py` synthesises the music bed: new mood per chapter, texture change about every 20 s, stings on cards.
   - `mix_dc_audio.py` ducks the music under the voice (about 13 dB) and adds the hum and whooshes.
   - Keep big WAVs in `out/`, not `public/`, or every Lambda deploy uploads them.
6. **Render:** render one `…-partN` composition per chapter on Lambda (picture only), concatenate, then mux `out/dc-mix.wav`.

## Story films in 2D vector (the user's default for story videos)
Follow `reference/vector-story-film.md`. In short: before building, write a beat sheet and a
shot list with **one scene per script line** (shot type, place, time of day, character pose and
expression, what moves, any data shown inside the scene). Build a character rig with facial
expressions first, then the locations, then the shots. Data never sits on a bare card; it
appears inside the scene. QA a contact sheet of every line's scene.

## Daily news videos: the living-gradient background (always)
The user approved this motion (Sept 2026) and wants it on **every daily news video, whatever
design system they choose**.

- **Component:** `remotion/src/gradient/GradientLoop.tsx` → `<LivingGradient palette={…} />`.
  Put it as the bottom layer of every news scene. Do not build a different background.
- **Colours come from the chosen design system:** `paletteFrom([primary, secondary, lightAccent, optionalHaze])`.
  It softens the colours toward white (default 0.35) so headlines stay readable; use 0.45 or
  more for strong brand colours (reds, navies), and `soften: 0` only if the design system's
  own background tints are already soft. With no design system, use `REFERENCE_PALETTE`
  (periwinkle / mint / aqua, the user's reference).
- **Keep the approved motion exactly:** `SPEED = 2`, `TRAVEL = 2.2`, sway 4°, blob pulse 18 %,
  static grain at 0.16 opacity (`public/grain-1024.png`, never animated grain). Change these only
  if the user asks.
- **Seamless at any length:** the motion repeats every `loop` frames (default 450 = 15 s), so a
  news video of any duration runs continuously; no cuts or restarts in the background between stories.
- **Readability check:** after placing text, render a still and make sure body text keeps at
  least 4.5:1 contrast over the lightest part of the gradient; add a soft card behind text if not.
- **Resolution:** the component scales to any size. Render 4K (3840×2160) when the user asks for
  it; the delivered 4K file needs a two-pass encode (`-tune grain`, about 14.5 Mb/s for 15 s) to
  fit under 30 MB.
- Demo of the same motion with another palette: composition `GradientNewsDemo`.

## Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| `security token invalid` from the Remotion CLI | The AWS SDK ignores `HTTPS_PROXY`, so it bypasses the session's credential proxy | `render-lambda.sh` preloads `global-agent`. Keep it |
| `Rate Exceeded` / `TooManyRequestsException` | Concurrency limit (10) is full, often with orphaned renderers | Lower the worker count, wait for concurrency to reach 0, then run once |
| Black 3D frames | Textures weren't loaded when the frame was captured | Release `continueRender` after commit (double `requestAnimationFrame`) |
| Fonts fall back or `ERR_CERT_AUTHORITY_INVALID` | The headless browser doesn't trust the proxy CA for Google Fonts | Bundle the fonts in `public/fonts` |
| Glass looks solid white or tinted on the paper backdrop | Transmission can't see HTML behind a transparent canvas | Alpha-blended glass: `transmission 0, transparent, opacity 0.18–0.32`, clearcoat, strong environment map |
| Frames with motion come out washed-out white | three.js `autoClear` wipes the motion-blur accumulator before every add | Set `gl.autoClear = false` while accumulating (done in `MotionBlurRenderer`) |
| Liquid invisible inside a glass or bottle | A transmissive object isn't visible through another transmissive one | Make the liquid opaque (clearcoat, sheen) and keep only the glass transmissive |
| Glass looks milky or tinted on the white stage | Transmission can't see an HTML backdrop | Put the paper wall in 3D so the glass refracts it |
| Scene renders empty or black although assets loaded | The canvas never redrew after the assets arrived | `ReleaseWhenDrawn` in `cola/assets.tsx`: advance the canvas, then `continueRender` |
| Metal looks black | No environment map | PMREM `RoomEnvironment` or an HDRI |
| Seam on a planet | Texture wrap, or decals not wrapped | Sample noise on the sphere, draw decals at x ± width, rotate the seam to the back |
| `ffmpeg` can't read TIFF | Remotion's ffmpeg is a minimal build | `pip install pillow numpy` and convert with Python |
| Playwright's ffmpeg rejects MP4 | Minimal build | Use `npx remotion ffmpeg` / `ffprobe` |
| Lambda chunks never finish (render stalls at the same %) | Per-element canvas `filter: blur()` (e.g. hundreds of blurred bubbles) makes each frame ~7× slower, so chunks time out | Pre-render each blurred element once into a cached sprite and `drawImage` it; keep a frame under ~10 s locally before sending to Lambda |
| Frame edges compete with the subject | Busy motion background | Edge blur: CSS `backdropFilter: blur(8px)` layer with a radial `maskImage` (transparent centre, black edges) between canvas and text |
| ElevenLabs: "This request exceeds your quota" | The account's monthly credits ran out mid-batch | Generate chapter takes one at a time and check credits first. Failed takes aren't charged |
