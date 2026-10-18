# Standing instructions for Claude

These load automatically in every session on this repo. The user asked for them so they
don't have to repeat themselves.

## Making any video

Before planning, scripting, building scenes, editing, sound or color for **any** video,
load and follow both skills:

1. **`video-production-psychology`** (Anthropic skill): the visual, audio and edit rules.
   The checklist below is a summary; read the skill itself for the full version.
2. **`motion-video`** (`.claude/skills/motion-video/`): the house styles, the SOP and
   rendering. **Where the two disagree, `motion-video` wins.** Its styles were approved
   by the user, for example the locked camera with whip pans in the paper style, the
   MacBook style's zooms, the frame rates, and rendering on Lambda.

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
- **The ArtCraft family of apps** (free, open-source, github.com/storytold) runs headless
  in the cloud container. Cloud sessions start empty, so install them first:
  - Run `bash scripts/install-craft-apps.sh` (about 1 minute). Name apps to install
    only some, for example `bash scripts/install-craft-apps.sh effectcraft filmcraft`.
  - It installs the latest Linux release of EffectCraft (After Effects), FilmCraft
    (Premiere), PhotoCraft (Photoshop), LightCraft (Lightroom), VectorCraft
    (Illustrator), DesignCraft (InDesign), FigCraft (Figma) and PDFCraft (Acrobat), and
    puts each `<app>-cli` command on the PATH.
  - Pin a version if a new release breaks something, for example
    `EFFECTCRAFT_VERSION=0.11.1`.
  - ArtCraft itself (AI image and video generation) ships for Windows and macOS only,
    so it runs on the user's computer, not here.
  - Last checked versions (October 2026): EffectCraft 0.11.1, FilmCraft 0.8.0,
    PhotoCraft 0.9.0, LightCraft 0.8.0, VectorCraft 0.12.0, DesignCraft 0.8.0,
    FigCraft 0.6.0, PDFCraft 0.8.0.
  - Not yet checked: whether PhotoCraft can remove backgrounds automatically for
    cut-outs. If it can't, use a separate free cut-out tool.
- **EffectCraft** is the main motion-graphics tool:
  - Use `effectcraft-cli script file.jsx` for After Effects-style scripting.
  - Use `render-frame` to check stills and `render` to export.
  - Property paths need the group, for example
    `layer.property("Transform").property("Position")` and
    `layer.property("Text").property("Source Text")`.
- **Render speed** (measured on the 4-core cloud server, 5 s parallax shot with
  effects):
  - 1080p: about 44 s.
  - 4K: about 4 min.
  - The user's laptop has 2 cores and no graphics card, so it is roughly twice as slow
    as that server.
  - So render in the cloud, work in 1080p, and upscale the final video to 4K. Use true
    4K only for a few hero shots.
