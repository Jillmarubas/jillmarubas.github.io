# AI News Daily — 28 Sep 2026 (Remotion)

A 9:46 YouTube video built from `ai-news-script-2026-09-28.md`, following
`video/SOP-youtube-video.md`, in the **Settle Motion** design system
(`design-system/settle-motion/`). The design rules are in `DESIGN.md`. It was made by
copying the 26 Sep episode's pipeline and replacing its Frost Glass look.

## Status

Complete: all ten VO sections generated with Joey, Whisper-timed, and rendered on Remotion Lambda
(9:45.4, 1920×1080, 30 fps). Revised 28 Sep: glass boxes, a moving gradient, zoom on explain and a
smoother hook take (see DESIGN.md). The master stays out of git (`out/` is ignored).

## How it works
- **Every word is animated.** `src/data/timeline.json` holds every on-screen token with the time Joey
  says it. `src/components/Kinetic.tsx` sets consecutive phrases as one scrolling transcript: words
  land at word-floor and brighten as they are spoken. Numbers roll with Settle's counter tick, key
  terms get a mint marker while they are active, and long quotations rise on a paper panel.
- **Beats** (`src/beats.tsx`) pick the layout and the graphic behind each phrase, anchored to spoken
  words. The build throws if they are out of order.
- **Photos** are real, from Wikimedia Commons, graded to grey and credited on screen and in
  `public/photos/credits.json`. `scripts/fetch.py` downloads Commons' standard 1920 px thumbnails,
  because originals and non-standard sizes get HTTP 429 / 400.
- **Music and SFX** are synthesised in code (`synth/`, `npm run audio`), arranged against the running
  order: a darker progression under the sandbox-escape and UN stories. SFX are whoosh, impact,
  tick and shutter; the riser and glitch were removed as too sci-fi.
- **Sections without VO** (`est: true` in the timeline) get timings estimated at the measured speaking
  rate, so the whole cut can be reviewed before the voice exists.

## Commands
```bash
npm install
npm run audio                        # public/audio (music.mp3, sfx/*.wav, manifest.json)
node scripts/stills.mjs --every 90   # a still every 3 s → out/frames/
python3 scripts/sheets.py out/sheets # contact sheets
npx remotion still src/index.ts ThumbEscape thumbnails/ThumbEscape.png
npm run lambda:deploy && npm run lambda:render   # → out/ai-news-2026-09-28.mp4
```
