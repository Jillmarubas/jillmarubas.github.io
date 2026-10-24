# Standing instructions for Claude

These load automatically in every session on this repo. The user asked for them so they
don't have to repeat themselves.

## Making any video

Before planning, scripting, building scenes, editing, sound or color for **any** video,
load and follow all three skills:

1. **`video-production-psychology`** (Anthropic skill): the visual, audio and edit rules.
   The checklist below is a summary; read the skill itself for the full version.
2. **`motion-video`** (`.claude/skills/motion-video/`): the house styles, the SOP and
   rendering. **Where the two disagree, `motion-video` wins.** Its styles were approved
   by the user, for example the locked camera with whip pans in the paper style, the
   MacBook style's zooms, the frame rates, and rendering on Lambda.
3. **`video-research`** (`.claude/skills/video-research/`): the user's own research on
   explainer comprehension (cognitive load, Mayer's principles, 130–150 wpm for explainers),
   motion and compositing (blend modes, alpha, banding, parallax), sound design (Murch's
   rule of five, sidechain ducking, synchresis) and flash safety. `motion-video` still wins
   on look; the user's per-format rules (such as no music in news videos) win over the research.

For the script itself, use the `script-writing` skill.

### Video psychology checklist (summary of the skill)

**Story**
- Hook first, then open loops. Plan where each loop opens and closes on screen, and
  which visual carries it.
- Set up the expectation before subverting it; a twist only lands if the viewer was
  predicting something.

**Camera and framing**
- Move the camera through 3D space (push-in, track, parallax) instead of zooming or
  scaling a flat layer. Static shots are for calm or detached beats only.
- Put the key subject, number or word near the center of the frame.
- Show actions, hands and faces where possible.
- Suspense: show the viewer the threat before the subject knows it.
- Long unbroken takes are rare, for peak moments only, followed by a breather.

**Editing**
- Cut on event boundaries: an action completing, a head turn, or a change of topic,
  place or goal.
- The shot before a face or subject sets the emotion the viewer reads into it (Kuleshov).
- Fast short shots for high-intensity beats, then longer, wider shots to recover.
  Never hold peak intensity; alternate tension and release.
- Don't stack dense visuals, fast cuts, busy audio and on-screen text at once.
- On-screen text is for keywords and numbers, never the narration word for word.

**Sound**
- Off-screen sound expands the world and builds anticipation.
- For long tension, use a Shepard tone (endlessly rising pitch), optionally with a
  ticking clock, and release it at the payoff.
- Lead a mood change with the audio a beat before the picture changes.
- One dominant sound in the voice range at a time, so the narration stays clear.

**Color**
- Brightness drops as tension builds; brighter means calm and safe.
- More saturation means more intensity; desaturated means bleak or restrained. Keep it
  natural.
- Reds and yellows grab attention; blues and greens calm.
- Plan a brightness and color curve that follows the script's tension curve.

**Review before the final render**
- Previews are free; only the final master should cost render credits. Never use cloud
  renders (such as Remotion Lambda) just to preview a cut.
- Review at phone size, because most viewers watch on phones. The skill describes a
  "review room": a private claude.ai page that plays each chapter as 960x540 H.264 parts
  (at most 120 s and under 15 MB each), with a frame-accurate timecode, so the user can
  pin notes to exact frames. Fix each note, mark it Fixed, and republish only the
  chapters that changed. If that page can't be published, send each chapter as a local
  clip instead.
- The skill names helper scripts `scripts/review_parts.py` and `scripts/review_page.py`.
  They are **not** in this repo yet (`remotion/scripts/` has none), so build them the
  first time a review room is needed.
- Render the final master once, in the cloud, only after the user approves the cut.

**Final QC**
- Key info centered in every important frame?
- Any zooms that should be camera moves?
- Cuts landing on actions or topic changes?
- Tension and release alternating?
- Screen overloaded anywhere?
- Sound and color following the script's tension curve?
- Cut approved, with every note marked Fixed, before the final render?
- Flash-safe? Run `python3 .claude/skills/video-research/scripts/flash_check.py <video>`
  (at most 3 flashes in any second, WCAG 2.3.1).
- Every visual landing on its spoken word, and no more than ~5 kinds of sound at once?

## Time-traveler cartoon channel ("history survival" stories)

Set by the user, 24 Oct 2026. Code: `remotion/src/timetraveler/` (see its README).

**Everything must be detailed.** Simple, flat "lazy" art is not acceptable for any asset:
backgrounds, props, plants, creatures or scenes. The approved benchmark is the Jurassic
monkey-puzzle tree (`remotion/scripts/vectorcraft/tree_detailed.py`,
`remotion/public/timetraveler/trees/jurassicTree.svg`). Every new asset needs at least that level:
- **Real structure:** draw how the thing is actually built, for example whorled branches, branchlets,
  scale-leaves, cones; for creatures, real anatomy and skin pattern.
- **Depth:** parts behind are darker and less saturated, parts in front lighter, with lit edges.
- **Light:** one light direction per scene (upper left by default), a shadow side with crayon
  hatching (`stylize.scribble`), and highlights.
- **Surface texture:** bark rings and scale marks, scale or fur patterns, cracks, moss, grain.
  Never a plain flat fill on a large area.
- **Variation:** no repeated, evenly spaced elements. Use random spacing, sizes, angles and
  directions, so nothing reads as a pattern or a ladder.
- **Surroundings:** ground cover, rocks, plants and props that fit the period (for example no
  grass in the Jurassic), and a soft contact shadow.
- **Hand-drawn finish:** thick ink outlines with Roughen, tapered detail strokes, and the same ink
  colour `#2a1b12` as the characters.
- **Check before showing:** render a full view and a close-up crop, and fix anything that reads as
  simple, repetitive or blob-like before sending it to the user.
- **Upgrading:** older, simpler assets (the Ice Age pieces, `trees.py`, the first creature
  pass) are below this standard. Redo them at this level before using them in a video.

**Landscapes** follow the user's references (24 Oct 2026: misty jungle with sauropods, a river valley,
a sunlit forest path), taken as principles and never copied:
- **Atmospheric perspective:** every depth band further back is paler, bluer, hazier and less contrasty.
  Fade each band as one group, so trees in a band don't show through each other.
- **Mist and light:** mist between the bands, warm light shafts and dust from one side, and a bright,
  misty middle that holds the focal point (for example a sauropod herd as soft silhouettes).
- **Framing:** a dark, dense foreground frame (fronds, a big trunk, hanging growth), and small
  figures for scale.
- **Ground:** fully covered with period plants (fern carpet, horsetails, cycads, moss, rocks).
  Never a flat lawn, and no palms or grass in the Jurassic.
- **Example:** `remotion/src/timetraveler/JurassicLandscape.tsx`, built from the detailed assets in
  `public/timetraveler/jurassic/` (`landscape.py`, plus `tree_detailed.py --bare --seed N`).

**Close-ups** (training notes from the user, 24 Oct 2026; example `remotion/src/timetraveler/CloseUpOTS.tsx`):
- **Creatures are one continuous silhouette.** The neck flows into the skull and the throat runs into the
  jaw. Never stick a head onto a separate neck shape: that leaves a seam, a collar edge or a step.
- **In a forest, frame the shot with leaves near the camera.** Big, dark, out-of-focus fronds go
  around the edges, kept clear of the subject's eye and face.
- **Forest light is dim.** Darken the scene overall and let light break through only in shafts.
  Don't use a bright, even, open-air look.
- **Scale size matches the distance.** Up close, use fine scales with soft outlines. Large, even,
  high-contrast cells read as a snake or chainmail.

**Interiors** (training note, 24 Oct 2026; example `remotion/src/timetraveler/BasementTV.tsx`):
- **Objects in a room are 3D, never flat drawings on a wall plane.** Stairs, furniture and anything that
  sticks out into the room need real perspective. Project them from 3D (see `P()` and `box_faces()`
  in `scripts/vectorcraft/basement.py`), with the faces you would really see: tops below eye level,
  undersides above it, the end facing the camera. Add thickness, and cast shadows on the wall and floor.

Other decisions for this channel:
- **Research first:** research textures, colours, anatomy, movement and surroundings before any
  art, and write it down with sources (`research/<era>.md`). Real anatomy goes in the cartoon
  style. Unknown colours are plausible guesses (countershaded), labelled "scientists think" on screen.
- **Original characters only:** no copyrighted characters or real actors' likenesses, even when
  the user shares one as a reference (for example the Jumanji cast). Make an original character
  with the same role. The squad is the Traveler, Tank, Pip and Ria.
- **Tools:**
  - Draw assets in VectorCraft.
  - Animate in Remotion with joint rigs; scene trees sway in Remotion because vectors stay sharp
    when the camera pushes in.
  - Use EffectCraft puppet pins for single flat pictures and for atmosphere passes.
- **Previews:** send stills unless the user asks for a video.

## Documentary videos in the MagnatesMedia style

Researched and tested in October 2026.

- **Script:**
  - Cold open (rise plus dark secret) → title → named chapters every 3–6 minutes.
  - Every chapter ends on a cliffhanger line.
  - A "but / however" turn roughly every 30 seconds.
  - Plain narration at about 145–200 words per minute.
- **Visuals:**
  - One color scheme taken from the subject's brand.
  - Animated text on keywords and numbers.
  - Parallax made from cut-out photos.
  - Maps, documents and counters.
  - Grain, smoke and vignette overlays.
  - 12–20 s music-only chapter cards.
- **Assets:**
  - Use public-domain or licensed material: Wikimedia Commons, Library of Congress,
    National Archives, Europeana, Flickr Commons, Chronicling America, company press
    kits, Pexels, Pixabay, Mixkit.
  - Keep a list of where every asset came from, with its license.
  - Use news and movie clips only briefly, with edits on top. That channel nearly lost
    everything to copyright strikes.
  - AI animation of real people's photos depends on the topic: ask the user at the brief
    for each video (never in Vox-style videos).
- **Effects:** the docfx kit (`remotion/src/docfx/`) and method B (`<ArchiveParallax>`) are
  available tools. References (such as reference 7) guide the principles; never imitate them.
- **EffectCraft** (free After Effects alternative, github.com/storytold/effectcraft) runs
  headless in the cloud container:
  - Download the Linux tarball from its GitHub releases. The release pages return 403 through
    the proxy, but direct downloads work:
    `https://github.com/storytold/effectcraft/releases/latest/download/SHA256SUMS.txt`, then
    `.../download/effectcraft-<ver>-linux-x86_64.tar.gz`; check it with `sha256sum -c`.
  - Verified 22 Oct 2026 with v0.14.0, no GPU: CC Particle World, Glow and a moving 3D camera
    render on the CPU (about 0.5 s per 1080p frame; a 4 s 1080p H.264 clip in 20 s).
  - It is alpha ("about 45% of the way to production"): check every effect's frames before
    relying on it. It renders ProRes 4444 with alpha and PNG sequences, so its effect passes
    (particles, glows, light, puppet) can be layered into Remotion films.
  - `effectcraft-cli mcp` is an MCP server for agents; `effectcraft-cli commands` lists every
    command.
  - A full 16 s demo was built in EffectCraft alone (`effectcraft/docfx-demo/`): 104 layers,
    rendered at 1080p in 6 min. Lessons from that build:
    - Run `effectcraft-cli script` with an absolute path, or `#include` can't find files.
    - Shape layer contents are in layer space. Set the layer's Position to `[0, 0]` (keep z)
      when drawing in comp coordinates, or everything shifts by half the comp.
    - Popup values are 1-based in scripts; for example Glow "Glow Colors" 2 = A & B Colors.
    - CC Particle World has no texture layer, so it can't do bills or coins. Use
      expression-driven 3D layers (`seedRandom(k, true)`) with motion blur instead.
    - CC Vignette darkens its own layer: put it on an adjustment layer, not a solid.
    - It reads system fonts only. Convert a repo woff2 to TTF with fontTools into `~/.fonts`.
  - v0.16.0 (24 Oct 2026, x86_64 tarball, same download route) has puppet pins with
    keyframes (`puppet.addPin`, `puppet.movePin {pin, position, time}`, `puppet.follow`).
    `effectcraft-cli exec` does **not** save its change: chain the commands and a
    `file.save {path}` in one `effectcraft-cli run ... project.ecproj`. Tree-sway test:
    `effectcraft/tree-sway/` (11 pins, 671 keyframes, 6 s 720x1080 render in 8 s).
  - Use `effectcraft-cli script file.jsx` for After Effects-style scripting.
  - Use `render-frame` to check stills and `render` to export.
  - Property paths need the group, for example
    `layer.property("Transform").property("Position")` and
    `layer.property("Text").property("Source Text")`.
- **VectorCraft** (free Illustrator alternative, github.com/storytold/vectorcraft) draws the
  cartoon art for the time-traveler channel (`remotion/src/timetraveler/README.md`):
  - Install in the cloud container (verified 23 Oct 2026, v0.16.0): `git clone --depth 50
    https://github.com/storytold/vectorcraft` (a clone works through the proxy; the GitHub
    web pages return 403), `cargo build --release -p vectorcraft-cli` (11 min on 4 cores), then
    copy `target/release/vectorcraft-cli` to `~/.cargo/bin/`.
  - Register it: `claude mcp add -s user vectorcraft -- ~/.cargo/bin/vectorcraft-cli mcp --headless`.
    The tools appear after Claude Code restarts. In the same session, drive the server with
    `remotion/scripts/vectorcraft/vc.py`, which sends the same MCP calls.
  - `remotion/scripts/vectorcraft/art.py` redraws every Ice Age piece in about 3 s.
  - Hand-drawn look: `distort.roughen` (smooth, about 1.4 pt) on outlined shapes,
    `stylize.scribble` on shade shapes, and `stroke.set {profile: "lens"}` on detail strokes.
    SVG export writes these as plain paths. Roughen needs a high `detail` (about 30) on small
    circles, or they turn into diamonds.
  - PNG export crops to the art; SVG export keeps the artboard as the viewBox.
- **Local preview renders:** the browser is now
  `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
  (the older 1194 path in the SOP is gone). `scripts/stills.mjs` reads it from `REMOTION_BROWSER`.
  Preload `global-agent` (as `render-lambda.sh` does), or the Remotion CLI fails on `remotion.media`.
- **Render speed** (measured on the 4-core cloud server, 5 s parallax shot with
  effects):
  - 1080p: about 44 s.
  - 4K: about 4 min.
  - The user's laptop has 2 cores and no graphics card, so it is roughly twice as slow
    as that server.
  - So render in the cloud, work in 1080p, and upscale the final video to 4K. Use true
    4K only for a few hero shots.
