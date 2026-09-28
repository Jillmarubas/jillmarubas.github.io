# AI News Daily — 28 Sep 2026 (Remotion)

A ~9:46 YouTube video built from `ai-news-script-2026-09-28.md`, following
`video/SOP-youtube-video.md`, in the **Settle Motion** design system
(`design-system/settle-motion/`). The design rules are in `DESIGN.md`. It was made by
copying the 26 Sep episode's pipeline and replacing its Frost Glass look.

## Status

| Part | State |
|---|---|
| VO 01–06 (hook, preview, stories 1–4) | ✅ Generated (Joey), normalised, Whisper-timed |
| VO 07–10 (stories 5–6, recap, outro) | ⏳ **Not generated.** The ElevenLabs account ran out of credits partway (0 of 90,088 left). These sections run on estimated timings and are silent. |
| Picture, beats, photos, thumbnails, music, SFX | ✅ Built. Stories 5–6 and the ending re-time automatically once their VO exists. |
| Final Lambda render | ⏳ After VO 07–10 |

### Finishing the last four sections
1. Top up ElevenLabs credits (about 2,700 are needed).
2. Generate `07-story5`, `08-story6`, `09-wrap` and `10-outro` from `scripts/sections.py` with Joey
   (`mUfWEBhcigm8YlCDbmGP`, `eleven_multilingual_v2`, one take each, at most 3 at a time). Save them as
   `data/vo-raw/<id>.mp3`.
3. `python3 scripts/normalize.py && python3 scripts/align.py && python3 scripts/build_timeline.py`
   (build_timeline should report "timed by whisper" for every section, with no "ESTIMATED").
4. `npm run audio`, then the QA stills (`node scripts/stills.mjs --every 90`), then
   `npm run lambda:deploy && npm run lambda:render`.
5. Update the chapter times in `youtube-metadata.md` from `public/audio/manifest.json`.

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
  order: a darker progression under the sandbox-escape and UN stories.
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
