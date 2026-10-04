# SOP: making a realistic motion-graphics video

Follow the steps in order. Each step ends with a check; don't move on until it passes.

---

## 0. Set up (once per session, about 3 min)
1. `cd remotion && npm install`
2. Check Lambda access: `./render-lambda.sh --check`. It prints the function and sites. If it fails, see "Troubleshooting".
3. Check the account's Lambda concurrency (1,000 as of 3 Oct 2026). Use `FRAMES_PER_LAMBDA = ceil(frames / (concurrency - 2))`, which leaves room for the orchestrator.

**Check:** the function `remotion-render-4-0-529-...` is listed.

## 1. Brief (5 min)
Write these down before touching code:
- **Topic and one-line message.** The hook question is asked in the first 2 s and answered by the end.
- **Beats:** 4–6 scenes of 1.5–3.5 s each, plus a call-to-action scene. Total 14–24 s.
- **Look:** use the look of the user's references (white paper for this user), **or** a house design system from `design-system/` when the user names one (see "Design systems" below — e.g. **Autopilot Blue**). Only pick another from `reference/breakdowns.md` (white studio, dark cinematic, cream paper with window light, black listicle, archival grey, editorial poster). Choose **one accent colour** (a design system fixes it for you).
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
6. **Sound:** use real CC0 recordings (BigSoundBank), levelled by the loudness of their *body* rather than their peak (`scripts/prepare-cola-assets.py`). No music unless the user asks for it. If they do, keep it a low-passed bed, and before rendering on Lambda render a sound-only composition locally and check that every cue *peaks* at least 12 dB above the music. Synthesized effects are a fallback; start from the `make_*_sfx.py` generators (whooshes on cuts, impacts on landings, ticks on counters). Put the WAV in `public/`.
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
- If there is music, confirm the mixer report shows every cue's level at least 6 dB over it (a separate check from the 12 dB peak test in step 3). Confirm the master is at about −16 to −18 dBFS RMS with peaks at −1 dBFS.
- After rendering, measure the MP4's own audio track, and send the user the standalone `out/cola-soundtrack.m4a` too, so they can tell a muted player from a silent file.

**Check:** `npx remotion ffprobe out/<name>.mp4` shows the right duration, 1080×1920, the fps, and an audio stream.

## 6. Verify the final file
Extract 4 frames from the Lambda output (`npx remotion ffmpeg -ss <t> -i out.mp4 -frames:v 1 ...`) and look at them. Lambda rendering can differ from local (fonts, textures, WebGL).

## 7. Deliver
- Send the MP4.
- Summarise the beats, the techniques used, where the data came from, render time and cost, and anything not verified (for example, audio can't be listened to here).
- If the reference study taught something new, append it to `reference/breakdowns.md` or `reference/realism.md`.

## Design systems
When the brief picks a house design system, its tokens replace your own colour, type and
easing choices. Everything else in this SOP still applies.

### Autopilot Blue
Silent blue-grey ground, type that dissolves downward, a single cobalt object. Read off one
nine-second frame (Pinterest pin 1067142074228622392, Illia Holubka) — techniques only, never
the original's content.

- **Reference page:** `design-system/autopilot-blue/autopilot-blue.html` (open in a browser) · live: https://claude.ai/artifact/WSfUU9haNw5557BqXCknRc
- **CSS tokens:** `design-system/autopilot-blue/tokens.css`
- **Remotion tokens:** `remotion/src/autopilot/tokens.ts` (`AUTOPILOT`, `autopilotBackdrop`, `apEase`, `apFrames`)
- **Fonts:** `import '../autopilot/fonts';` once per composition. Instrument Sans 500/600 (display), Hanken Grotesk 400/500 (body), IBM Plex Mono 400/500 (values) are bundled in `public/fonts`.

| Token | Value | Use on video |
|---|---|---|
| Ground | `#EAEAEA` → `#DCE3ED` → `#CDDDEC`, top to floor, one low bloom at 62% / 118% | The backdrop (`autopilotBackdrop`). Never a diagonal wash. |
| Blue | core `#0571F8`, face `#2082FD`, lift `#4D8FFC`, veil `#81A2F6` | Faces of the **one** hero object: body, lit plane, overlap rim, floor bloom. |
| Blue ink | `#0A50B8` | Any blue text below display size (`#0571F8` only clears 3.7:1). |
| Ink | `#10151C` / `#4B5563` / `#7B8695` | Text, secondary text, captions. |
| Veil ramp | alpha .62 / .34 / .20 / .11 / .05 | The dissolving 5-line type stack. Doubles as the ghost-word layer. |
| Bloom | `0 18px 44px -14px` / `0 34px 80px -22px`, blue at .45 / .55 | Elevation and contact light. Never a grey shadow. |
| Radius | 8 / 14 / 22 / 34 / 52 / pill | Hero object takes 52 (or a true superellipse, n = 4). |
| Ease | swift `(.22,1,.36,1)` · morph `(.65,0,.35,1)` · settle `(.34,1.2,.64,1)` | Morph for size/shape, swift for position, settle only for physical controls. |
| Durations @ 30 fps | tap 4 f · move 7 f · morph 11 f · stage 19 f | Morph (11 f) sits inside the 11–18 frame house move length. At 24 fps (Vox-style): tap 3 · move 5 · morph 9 · stage 15. |

**Rules (check at QA, step 4):**
- [ ] One saturated object per scene. A second blue thing reads as noise, not emphasis.
- [ ] Ground runs top-to-floor; the bloom sits low, under the object.
- [ ] Only overlapping blue planes get a hard line: a 1.5 px white rim at 55 % on the upper plane's lit edges.
- [ ] Below veil-1 (.62) nothing carries information — no numbers, labels or CTAs. Repeat anything that matters at full ink.
- [ ] The signature move is the pill widening into a card under a cursor: width, height and radius on morph over 11 f, rows fading in on move after a tap-length delay.
- [ ] Nothing overshoots except a physical control (switch knob). Overshoot on a card is nausea.

---

## Thumbnails: the approved style (every video)
> **ElevenLabs is for voiceover only (the user's rule, 1 Oct 2026).** Never use ElevenLabs credits for images, video, music or sound effects. Thumbnails are built in Remotion from licensed photos, 3D logos and the film's own assets. This overrides any older step below that generates images with ElevenLabs.

The user approved this look on 29 Sep 2026 (AI News Daily, variant G) and wants it on **every video**.
Reference image: `reference/thumbnail-approved.jpg`. Component: `remotion/src/thumbs/HighlightThumb.tsx`.

1. **Lead with the most interesting story,** not the first one in the video. Put it in its own chapter so a click lands on it quickly.
2. **The image: real, licensed photos of the people named in the script** (Wikimedia Commons CC/public domain, the same photos as the video), cut out locally with `rembg` (no paid tools), in a provocative layout (versus, contrast, a stamp). No altered expressions and nothing a source doesn't support. Save them as JPG (q92) in `public/<project>/thumb/` and credit them in the description. If no licensed photo exists, use the named silhouette card.
3. **Words: three at most, and accurate** (no invented quotes), on the left third: `[key or number, word, punch word]`, e.g. `53 · PHOTOS · LEAKED`. Geist 900, tilted −3°.
   - **Default treatment, `marker`:** the key/number big in yellow `#FFD60A`, the middle word white, both with a dark outline in the design system's darkest colour; the punch word white on a slanted red `#FF2A3D` marker stroke.
   - Alternatives for A/B tests: `highlighter` (first two words dark on a yellow bar, punch word on a red bar) and `glow` (yellow words, punch word red with a white outline and red glow).
   - Yellow and red stay the same in every design system (they're the complementary pop). Only `ink` (outlines, scrim, vignette) takes the design system's darkest colour.
4. **Build:** `<HighlightThumb src="…/thumb/x.jpg" words={['53', 'PHOTOS', 'LEAKED']} style="marker" ink={darkest} />` as a 1920×1080, 1-frame composition. It adds a slight contrast/saturation lift, a left scrim, and a vignette.
5. **Deliver three variants that change one thing each.** Usually the `marker` default plus two others, differing either in word treatment (same photo) or in photo (same words). Recommend the `marker` one.
6. **Check:**
   - Shrink to 200 px wide: the face and the punch word must read at a glance.
   - Export JPG `-q:v 2` to `out/thumbs/<project>-thumb-<X>.jpg`; each must be under 2 MB (about 200 KB is typical).
   - The chat upload limit is 30 MiB, so thumbnails can be sent directly.
7. **Title and copy:**
   - The title *complements* the thumbnail text and never repeats it (thumbnail "53 PHOTOS LEAKED" ↔ title "OpenAI's Own AI Agents Went Rogue").
   - Write `YOUTUBE.md` in the same format as `remotion/src/dcc/YOUTUBE.md`, plus a table pairing each thumbnail with its title and an **Accuracy notes** section. Anything the image implies that the sources don't confirm, such as who is in the leaked photos, gets a note.

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
   - No music unless the user asks for it. If they do, `make_dc_music.py` synthesises the bed: new mood per chapter, texture change about every 20 s, stings on cards.
   - `mix_dc_audio.py` ducks any music under the voice (about 13 dB) and adds the hum and whooshes.
   - Keep big WAVs in `out/`, not `public/`, or every Lambda deploy uploads them.
6. **Render:** render one `…-partN` composition per chapter on Lambda (picture only), concatenate, then mux `out/dc-mix.wav`.

### Vox-style rules set by the user (1 Oct 2026). These override the general rules above for Vox-style videos.
1. **24 fps,** not 30. Moves are 9–14 frames at 24 fps.
2. **Verify every person and place before any production work.** Confirm each person's name, current title and quotes, and each place, against at least one primary or major outlet. Record every check in `VERIFY.md` with a ✅/⚠️/❌ status. Fix or flag every ⚠️/❌ line with the user before the voiceover is generated.
3. **Real photos of every person named.** Use photos with a reusable licence: Wikimedia Commons CC-BY/CC-BY-SA, public-domain government photos (White House, Congress, FTC), or official press-kit headshots. Record the licence and author for each photo in `ASSETS.md` and credit them on screen in small type. Never use AI-generated faces of real people. If no licensed photo exists, tell the user and offer a named silhouette card instead.
4. **3D logos with exact brand colours.** Extrude each company's official vector mark in Three.js. Take the hex values from the company's brand or press page, record them in `ASSETS.md`, and compare the render with the official mark side by side. Logos are used for editorial reference only: never altered, combined or animated into something the company didn't make.
5. **Show, don't type.** Explain with objects and real photos (a document, a phone, a chip, a building, a chart), not words on screen. On-screen text is limited to names and titles, quoted words, numbers and sources.
6. **Places get a replica of their surroundings.** When the script names a place (the White House, a headquarters, a city), build its setting in 3D or 2.5D from reference photos: the real building shape, its trees, plants, street and neighbouring buildings. Recreate the setting; never trace or reuse photos of it.
7. **No generic or sloppy generation.** No stock "AI brain", glowing circuits, random robots, purple gradients or filler B-roll. Every shot must show the specific thing the line is about.
8. **High quality:** 1920×1080, 24 fps, 4:4:4-quality source, CRF ≤ 18 H.264, loudness −14 LUFS for YouTube.
9. **Check everything before finishing:** a contact sheet of every scene, a spelling check of every name and title, every number checked against `VERIFY.md`, a full watch-through for audio sync and pops, and `ffprobe` on the final file (24 fps, 1920×1080, duration). List what was checked in the delivery message.

### Lessons from the first build under these rules (AI News, 1 Oct 2026; `remotion/src/news1001/`)
- **3D logos share one WebGL context** (`Logo3D.tsx`): each logo draws through a single shared renderer into its own 2D canvas. One `ThreeCanvas` per logo blanked logos in long sequential renders (Chrome drops contexts past ~16).
- **Exact brand colour:** logo front faces use an unlit material, so they render the file's hex pixel-exact. Sides and bevels are lit for depth. Extrusion depth follows the mark's short side, so wordmarks stay slim. Leave 22 % spare width so tilted wordmarks don't clip.
- **Join Lambda parts video-only:** strip each part's silent audio before concatenating, or every join adds a gap (it drifted 0.7 s over 10 parts). Then mux the mix with `apad` + `-shortest` and check that the last frame lands at frames/24.
- **Wikimedia rate limits:** fetch originals by md5 path from upload.wikimedia.org, fall back to standard thumbnail widths (500/1280 px), and read the licence from the file page (`licensetpl_short`, with `&#95;` unescaped).
- **Free music and effects:** FreePD is closed. For music (only when the user asks for it) use Incompetech (CC BY 4.0, credit in the description); for effects, Kenney.nl (CC0) and BigSoundBank (CC0). `scripts/mix_news1001.py` places the cues from the scene list.

### Lessons from AI News, 3 Oct 2026 (`remotion/src/news1003/`, Autopilot Blue)
- **One swoosh only (the user's rule, 3 Oct 2026; no music unless asked applies to every video).** Use the single short swoosh `public/sfx/whoosh7.mp3` (0.94 s, CC0), once per scene exit and a little louder into story cards. Never the 10.9 s `whoosh1.mp3`, and never music unless asked. Mixer: `scripts/mix_news1003.py`.
- **Key pieces to the spoken word, not just the line.** `scripts/news1003_timing.py` stores every script word's time (recognised words from faster-whisper, missing ones interpolated); scenes call `useW()('subpoenaed')` to land an object on its word.
- **Render chapters in parallel:** `SITE=<site> FRAMES_PER_LAMBDA=24 ./render-parts.sh <Prefix> <parts> <outdir>` deploys once, starts every `<Prefix>-partN`, polls S3, downloads all. The account's concurrency is now 1,000; a 9-minute film rendered in about 4 minutes.
- **Autopilot Blue at 24 fps:** tap 3 f, move 5 f, morph 9 f, stage 15 f; arrivals 13 f on `swift`. One cobalt object per view; logos keep their own colours; shadows are blue bloom.
- **Logos that don't extrude:** a mark whose compound path breaks in `SVGLoader` (Tavus) is shown flat in its exact colours (`FLAT` set in `Logo3D.tsx`). Wordmarks get `shadowOpacity` ≈ 0.08 so their contact shadow doesn't read as a doubled word.
- **No licensed photo:** if neither Commons nor an official press page has one (Steve Corfield), use the named silhouette card (`Silhouette` in `kit.tsx`) and say so in the delivery.
- **Delivery of big files:** the final MP4 (~330 MB for 9 min) is over the chat limit. Upload it to the Remotion bucket under `deliveries/`; a presigned link made here is signed by the session proxy and won't work outside, so give the S3 path (console download) too.

### Lessons from AI News 3 Oct, part 2 (`remotion/src/cc1003/`, explainer + tutorial, 60 fps)
- **The user asked for an After Effects feel at 60 fps.** `cc1003/ae.tsx` is the toolkit: keyframes with per-segment easing (`kf`, AE Easy Ease / expo out / overshoot), `Layer` with real directional motion blur (180° shutter, SVG blur along the velocity), `AText` per-character animators with a range offset (`*word*` = orange), trim paths (`Draw`), counters, a 2.5D camera with parallax and DOF. All times are in **seconds**, so the same scene code works at any fps.
- **Tutorial shots:** the dark MacBook from `src/tutorial/` on a camera rig (`cc1003/laptop.tsx`), a Claude Code terminal drawn in code (`terminal.tsx`), and `TermShot` (`shots.tsx`) for one-command shots: swing in, zoom to the prompt, a big readable command card typed in sync, callouts that track screen points (`screenToFrame`). Frame the zoom with `fxL`/`fyAt` so the terminal's left edge never crops.
- **Word cues:** `useS().w(word, n)` searches the scene's own lines first. A word said earlier in the chapter (e.g. "work" in "mods work in…") will match the wrong place; pass `n` or check the token list printed from `timing.json`.
- **Set a default text colour on the film root** (`color: C.ink`). Plain divs otherwise render black text on the dark background.
- **Voice "Joey":** ElevenLabs has many Joeys; the user's choice was `Joey - Upbeat Popular News Host` (`mUfWEBhcigm8YlCDbmGP`), 1 credit per character on `eleven_multilingual_v2`. Always pass `generations_count: 1` (the default is 4).
- **Sound:** `scripts/mix_cc1003.py` mirrors the scene windows, word lookups and keystroke times, and lays the user's own typing, Enter-key and mouse-click recordings (`public/cc1003/sfx/`) under typing, plus the one swoosh per scene change. No synthesized effects.
- **Delivery:** 1080p60 for 7 min is ~200 MB (S3 `deliveries/`, uploaded with `@aws-sdk/client-s3` through `global-agent`); a 2-pass 720p60 at 480 kb/s fits the 30 MiB chat limit and stays clean for dark flat graphics.

## Tech explainer + tutorial videos: the MacBook style (approved by the user, 3 Oct 2026)
The user's words: "it looks professional and human made, I hope it will be consistent." **Use this
look for every tutorial, explainer or tech-news video**, and any mix of the three (software, AI tools,
how-tos, product updates), unless the user asks for something else.

**When a video is tutorial + explainer + news** (like cc1003), this style wins where it clashes with
the Vox-style news rules:
- **60 fps**, not 24.
- **Typed text is allowed.** Commands, step badges and callouts are the point of a tutorial, so
  "show, don't type" applies only to the explainer scenes.

The news rules still hold:
- verify every claim against its source first (`VERIFY.md`) and fix or flag mismatches before the voiceover
- real licensed photos of people named, or a named silhouette card when none exists
- logos in their exact colours, for editorial reference
- sources credited in the video and the description
- the living-gradient background (already built in) Reference build: `remotion/src/cc1003/` ("Claude Code Just Got Mods", 7:10).
Start a new video by copying that folder; don't rebuild the pieces.

**Format and motion**
- 1920×1080, **60 fps**. Every scene uses the After Effects toolkit in `cc1003/ae.tsx`:
  - keyframes with AE easing (`kf`, `E.easy` / `E.out` / `E.back`)
  - `Layer` with real motion blur
  - `AText` per-character text, with `*word*` in the accent colour
  - `Draw` trim paths, `Count` number counters, and `Camera`/`Depth` parallax
  - timings in seconds, keyed to spoken words with `useS().w(word, n)`
- Dark living gradient (`GRADIENT` in `cc1003/design.ts`) behind everything, plus a vignette.
- **One accent colour** per video, taken from the subject's brand (Claude orange `#D97757` for Claude
  videos). Text is warm white. Default text colour is set on the film root.
- Transitions: blurred whip left/right inside a chapter, zoom between chapters (`Film.tsx` `Shot`).

**The MacBook (tutorial parts)**
- The space-black laptop from `src/tutorial/` on the `LaptopRig` camera (`cc1003/laptop.tsx`):
  - swings in in 3D, then zooms to whatever the voice is describing
  - frame zooms with `fxL`/`fyAt` so the left edge of the text never crops
- Terminal and app screens are drawn in code (`cc1003/terminal.tsx`), never fake screen recordings.
  Label illustrative numbers or settings as "illustration".
- For a one-command shot, use `TermShot` (`cc1003/shots.tsx`).

**What makes it informative (keep all of these)**
- **Part stinger:** a big numbered title that collapses into a corner tag for the rest of the chapter (`PartTag`).
- **Step badges, top right:** "STEP 1 · Check your version" (`StepBadge`).
- **Command card, bottom centre:** every command typed in sync with the terminal, large enough to read (`CmdCard`).
- **Callouts:** dot + drawn leader line + label pointing at the exact screen line (`Callout`, `screenToFrame`).
- **Explainers between tutorial steps:** glass cards, icons drawn on, bar charts of sourced numbers only, counters, before/after.

**Sound (the user's rules)**
- Voice + effects only, **no music**:
  - the one swoosh `public/sfx/whoosh7.mp3` per scene change
  - the user's own recordings in `public/cc1003/sfx/`: `typing-laptop.wav` under typed commands (bursts that loop with a crossfade), `enter-key.wav` on each submit, `mouse-click.wav` on cursor clicks
- **Never synthesize keystrokes or clicks.** The user rejected them as sounding "like static".
- Mixer: `scripts/mix_cc1003.py`. Master to −14 LUFS, −1 dBTP.

**Voice**
- Use the voice the user names in the script. The cc1003 build used ElevenLabs "Joey - Upbeat Popular News Host" (`mUfWEBhcigm8YlCDbmGP`).
- Always `generations_count: 1`.

**QA before rendering**
- Contact sheet of one still per script line (`scripts/stills.mjs`). Check for:
  - invisible black text
  - empty frames after a stinger
  - overlapping callouts or tags
  - counters showing before their moment
- Render parts on Lambda (`render-parts.sh`, `FRAMES_PER_LAMBDA=40`), join them picture-only, mux the mix, and check the frame count.

**Delivery**
- Upload the 1080p60 file to S3 `deliveries/`.
- Send a 2-pass 720p60 preview at 480 kb/s (under 30 MiB) in chat.
- Write `YOUTUBE.md`. The description must contain **no angle brackets** (YouTube rejects `<` and `>`), so write example commands in full.

**Thumbnails**
- Follow "Thumbnails: the approved style" above.
- ElevenLabs stays voiceover-only (the user's rule, confirmed 3 Oct 2026).

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
| `Rate Exceeded` / `TooManyRequestsException` | Lambda concurrency (1,000 as of 3 Oct 2026) is full, often with orphaned renderers | Lower the worker count, wait for concurrency to reach 0, then run once |
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
