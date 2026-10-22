---
name: video-research
description: The user's own video research (explainer comprehension, motion graphics and post-production, compositing and overlays, film sound design), distilled into rules for this repo's tools. Load before planning, scripting, animating, compositing, mixing or QC-ing ANY video, alongside video-production-psychology and motion-video.
---

# Video research: the user's rules for every video

Distilled from four research reports the user wrote (October 2026):
1. *The Architecture of Comprehension* (explainer videos, cognitive load, Mayer's principles).
2. *Advanced Motion Graphics and Post-Production Workflows* (Google Doc, saved word for word in
   `references/source-motion-graphics.md`).
3. *Advanced Video Compositing and Overlays*.
4. *The Psychoacoustics and Aesthetics of Film Sound Design*.

The detail, numbers and examples live in `references/`. This file holds the rules to apply.

## Precedence
- **House styles in `motion-video` win** on look, camera, fps and rendering (it says so in CLAUDE.md).
  This skill fills in comprehension, script pacing, compositing, sound mix and accessibility.
- **The user's explicit per-format rules win over this research.** Example: news videos use no
  background music, only one short swoosh (`remotion/scripts/mix_news1003.py`).
- **Pacing:** explainers and tutorials 130–150 words per minute (this research). Documentary videos in
  the MagnatesMedia style keep the approved 145–200 wpm (CLAUDE.md).
- `video-production-psychology` covers engagement (hooks, camera, Kuleshov, color arc). This skill covers
  understanding and craft. Use both.

## 1. Plan and script (explainer comprehension)
The goal of an explainer is understanding with the least mental effort. Cut everything else.
- **One core message.** Write the single takeaway before anything else. Cut every detail that doesn't serve it.
- **Know the viewer:** prior knowledge, role, main pain point. Don't over-explain the obvious or skip the new.
- **Four beats:** hook (first 5–10 s, a pattern interrupt: pain point, surprising number or direct
  question) → problem expansion (~20 s, name the pain before the product) → solution as the remedy,
  shown with visual metaphors (benefits, not feature lists) → **one** call to action.
- **Write for the ear:** short active sentences, contractions, no jargon. Read it aloud and time it.
- **Length budget at 130–150 wpm:** 60 s ≈ 130–150 words; 90 s ≈ 195–225; 120 s ≈ 260–300.
  Over budget → cut words. **Never speed up the voice to fit.**
- **Lock the script and timing before any animation.**
- **Two-column script:** audio on the left (VO, music, SFX), visuals on the right, row by row, so every
  spoken idea has a visual at the same moment. For Remotion this becomes the timing JSON
  (`src/<film>/timing.json`): each line gets a start and end and the visual beat that matches it.
- **Pre-training:** name and show the key parts before showing the process that uses them.
- **Segment:** one idea per beat. Long continuous explanations overload memory, because what's spoken
  is gone the moment it's said (the transient information effect).
- **Fade the guidance:** heavy guidance early, lighter later.
- **Length by funnel stage:** under 60 s for social and cold audiences (~65% finish it); 1–3 min for
  homepage and email (50–60%); long demos only for motivated viewers. Put the CTA before the drop-off.

## 2. Visuals (Mayer's multimedia principles, ranked by effect)
- **Temporal contiguity (largest effect):** the visual happens on the exact frame the word is spoken.
  Drive animation from word timestamps (TTS or whisper word timings), never by eye.
- **Multimedia:** words plus relevant graphics, never words alone.
- **Coherence:** remove decorative footage, tangents and anything competing with the voice. Music
  stays only where the format allows it, and is ducked under speech (section 6).
- **Modality:** explanation goes in the voice, not in on-screen paragraphs.
- **No redundancy:** on-screen text only for keywords and numbers, never the narration word for word.
- **Spatial contiguity:** labels sit on or next to the thing they name. No legends or keys to cross-reference.
- **Signaling:** arrows, accent color, bold and vocal emphasis on the essentials only. Signaling
  everything signals nothing (the house style allows one accent at a time).
- **Personalization and voice:** conversational "you/we" script; a warm, human-sounding voice.
- **Image principle:** a talking head doesn't help learning on its own; use the screen for explanation.
- **Pick the format by subject:** 2D motion graphics for abstract or software ideas (visual metaphors);
  3D for physical products and mechanisms; screencasts for tutorials for existing users.

## 3. Motion (interpolation and timing)
- **Speed vs value curves:** an ease-in-out is a bell-shaped speed curve. Overshoot belongs on the value
  curve (the property passes its target, then settles). If a speed curve dips below zero, the object
  reverses, which is an accidental bounce.
- **Overshoot in code:** Remotion `Easing.bezier(0.34, 1.56, 0.64, 1)` or `spring()`; GSAP `back.out(1.4)`.
  The house entrances use a long soft settle with no overshoot (`motion-video`), so use overshoot only
  where the style allows it.
- **Motion blur at a 180° shutter** (exposure is half the frame time). Already built in
  `cola/motion3d.tsx` (`MotionBlurRenderer`) and `cc1003/ae.tsx` (`Layer`). Synthetic motion that is
  razor sharp during fast moves looks pasted on.
- **Slow motion:** footage at 5x the timeline fps (120 → 24) gives a clean 20% speed. Below that,
  frames have to be invented: nearest frame judders, frame blending ghosts, optical flow warps on
  occlusions. Prefer shooting or rendering at a higher fps.
- **Kinetic type:** cascade reveals as a per-character stagger with eased opacity plus a small rise
  (≈ AE Range Selector with Ramp Up and Ease High/Low at 50%, offset −100 → 100%).
  - In Remotion: per-character `<span style={{display:'inline-block'}}>` with `delay = i * k`.
  - In HyperFrames: a GSAP stagger on spans.
  - **Never animate `letter-spacing`.** It snaps to whole pixels and stutters; move each glyph's `x`
    instead (learned in the 2.5D demo).
- **Lines tied to moving objects:** compute both end points from the objects' current positions every
  frame (like AE `toComp` + `createPath`). Never keyframe them separately.
- **Audio-reactive motion:** map amplitude with clamping and smoothing, AE's
  `linear(audio, 0, peak, 100, 150)` + `clamp()` + `smooth()`. In Remotion: `visualizeAudio()` from
  `@remotion/media-utils`, averaged over 3–5 frames, then `interpolate(v, [0, peak], [1, 1.5],
  {extrapolateRight: 'clamp'})`.
- **Beat sync:** cut, shake or flash on downbeats and drops. Stack several reactions on one hit (cut +
  shake + brightness shift), never on random frames.
- **Lottie / dotLottie** for vector UI animations shipped to the web or apps (`.lottie` is a zipped
  bundle, up to 10x smaller than raw JSON).

## 4. Compositing and overlays
- **Overlay types:** atmospheric (light leaks, grain, dust, flares) use **blend modes, not alpha**;
  graphic (lower thirds, HUD, type) use **clean alpha**; transitional (match cuts); geometric
  (depth or displacement maps).
- **Blend math** (a = overlay, b = base, values 0–1). CSS `mix-blend-mode` in Remotion and HyperFrames:
  - `multiply` = a·b. Removes white: paper, ink, grunge, dirty borders.
  - `screen` = 1−(1−a)(1−b). Removes black: light leaks, flares, film burns, fire.
  - `plus-lighter` (Add) = a+b. Intense glows and lasers; clips fast.
  - `overlay` / `soft-light`: grain and texture without killing pure black or white.
  - `difference`: lining up two identical plates.
- **Gamma caveat:** CSS blends work in sRGB gamma, not linear light, so bright additive glows get dark,
  muddy fringes. For hero light effects, add them in three.js/WebGL (linear) or keep them at lower
  opacity with `screen`.
- **Alpha:** straight alpha keeps raw colors; premultiplied alpha has color already multiplied by
  alpha. Reading premultiplied as straight gives a **dark halo** on soft edges. Fix it with the
  correct interpretation (unpremultiply), never by choking the matte.
- **Transparent deliverables:**
  - ProRes 4444 for editing, e.g. Remotion
    `--codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png`.
  - WebM VP9 with alpha for web, OBS and light use. Its edges can artifact, and CapCut sometimes
    shows halos; fall back to ProRes 4444.
- **Mattes:** an alpha matte cuts with the top layer's shape (text reveals, logo wipes). A luma matte
  cuts by brightness (ink bleeds and brush transitions delivered as black-and-white video).
- **Banding:** gradients and soft glows band in 8-bit. Composite at higher precision where possible,
  and always ship dark gradients with grain or dither (the house grain layer does this). Use low CRF
  on dark, smooth scenes.
- **2.5D parallax:**
  - Separate foreground, mid and back layers, and **fill the hole behind the cut-out** so camera
    moves don't reveal gaps.
  - Spread the layers in Z and move a real camera (see `remotion/src/demo25d/` and the `motion-video`
    2.5D camera).
  - AI depth maps (white = near) can drive displacement on a single photo. For video, use a
    temporally consistent model (Video Depth Anything), otherwise the depth flickers and the image
    "boils".
- **Camera tracking** needs real parallax in the shot. A locked tripod pan can't be solved in 3D.
- **Match cuts:** carry a shape, an action or a sound across the cut (graphic match, action match,
  audio match / J- and L-cuts).

## 5. Color, HDR and safety
- Work in more than 8 bits when stacking glows and soft mattes; deliver 8-bit SDR for social unless
  HDR is requested.
- HDR overlays can spike to thousands of nits. If HDR is ever delivered, tone-map (Dolby Vision
  dynamic metadata) so flares don't blow out consumer screens.
- **Flash safety (WCAG 2.3.1), a hard rule:**
  - At most **3 flashes in any 1 second**.
  - A flash is a pair of opposite luminance changes of 10% or more, where the darker state is below
    0.80 relative luminance.
  - Saturated red flashes have a stricter limit.
  - No strobing opacity, binary on/off wiggles or fast flash transitions. Ease them.
  - Run `scripts/flash_check.py` on every render (QC below).

## 6. Sound design and mix
**Perception**
- **Synchresis:** a sound on the exact frame of a visual event welds to it (that's how a hammer on a
  guy-wire becomes a laser). Place every hit and whoosh on the frame of its visual action.
- **Sound before picture:** the brain binds sound and image in roughly the first ~220 ms, before
  conscious notice, so sound sets the feeling first. Lead mood changes with audio (also in
  `video-production-psychology`).

**Chion's tools**
- **Acousmatic** (source unseen) builds suspense and expands the world.
- **Empathetic** sound matches the mood. **Anempathetic** sound is indifferent to the action, used
  deliberately for horror or irony.
- **Rendering:** use the sound of the *feeling*, not literal realism.

**Murch's mix rules**
- **Rule of five:** at most about five simultaneous layers, and only if each is a different kind:
  - dialogue (violet)
  - "linguistic" effects like footsteps and knocks (blue)
  - hybrid "centaur" effects (yellow)
  - musical atmospheres and room tones (orange)
  - music (red)
- **Dense dialogue → drop the music.** A sixth layer means removing one.
- **Silence is a designed event.** Pulling every layer out after a full bed makes viewers lean in. Use
  it for reveals and dread.
- **Subliminal cues** (a distant bell) can shift mood without being noticed.

**Building sounds**
- **Organic sources first (Ben Burtt):** build effects from real recordings, pitched, slowed or
  layered, so they carry a "reality hook". Pure synth tones sound sterile. For abstract or digital
  events, give them physical mass: Doppler, drag, low-frequency transients.
- **Foley:** footsteps, cloth and handled objects pull the viewer into the scene. Their texture
  carries character (stealthy vs heavy).

**Fear and calm**
- **Acoustic roughness for tension:** amplitude modulation at 30–150 Hz (strongest around 40 Hz)
  sounds like screams and alarms, and the brain routes it straight to its threat response. Use it on
  drones and risers in tense beats. Keep calm explainer sections smooth (low dissonance, soft attacks).
- **Standard layering:** a whoosh under fast wipes, a riser before a big reveal, an impact or sub-boom
  on the cut frame.

**Voice-over mix chain** (ffmpeg; extends the existing `remotion/scripts/mix_*.py`)
- VO: `highpass=f=90` (80–100 Hz, removes rumble) → gentle compression → a high-shelf lift for air.
  Cut harsh room resonances with a narrow EQ dip.
- Music: dip the voice range (~1–4 kHz) a few dB, and **duck it under the voice with
  sidechain compression**: `[music][vo]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300`.
  The music swells back in the pauses.
- Master stays at the house standard: two-pass `loudnorm` to **-14 LUFS, -1 dBTP**, 48 kHz.

## 7. QC: add to the existing final QC
- [ ] The script states one core message, and the CTA is single.
- [ ] Word count fits 130–150 wpm for explainers (145–200 for documentaries); nothing sped up.
- [ ] Every spoken keyword's visual lands within about 2 frames of the word.
- [ ] No on-screen narration text; labels sit next to their objects.
- [ ] No more than ~5 different kinds of sound at once, and music is ducked or dropped under dense speech.
- [ ] Hits, whooshes and impacts sit on the exact frames of their actions.
- [ ] No dark halos on alpha overlays; no banding in dark gradients.
- [ ] `python3 .claude/skills/video-research/scripts/flash_check.py <video.mp4>` passes.
- [ ] Master measures -14 LUFS / -1 dBTP.

## References
- `references/explainer.md`: cognitive load theory, Mayer's table with effect sizes, script and
  length tables, formats and costs, completion data, case studies (Dropbox, Crazy Egg and others).
- `references/motion-and-compositing.md`: graph editor, shutter and optical flow, text animators,
  paths, Lottie, rigging (IK/FK, Duik vs Limber), depth maps, audio-reactive maps, blend formulas,
  bit depth, alpha, mattes, ACES and HDR, platform workflows (Premiere, Resolve/Fusion, AE, CapCut).
- `references/sound-design.md`: Chion's vocabulary, the ventriloquist effect, acoustic roughness, Foley,
  Burtt's source list, Murch's spectrum and rule of five, The Matrix, The Zone of Interest, A Quiet Place.
- `references/source-motion-graphics.md`: the Google Doc, word for word.
- `references/claims-to-check.md`: statements in the research that are marketing figures or that I
  could not confirm. Don't put them on screen without a primary source.
