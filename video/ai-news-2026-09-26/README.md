# AI News Daily — 26 Sep 2026 (Remotion)

A 9:58 YouTube video built from `ai-news-script-2026-09-26.md`, using the portfolio's
**Frost Glass** design system (`design-system/frost-glass/`) and Settle Motion curves.
The design rules are in `DESIGN.md`.

- **Voice:** ElevenLabs, *Joey – Upbeat Popular News Host* (`mUfWEBhcigm8YlCDbmGP`),
  `eleven_multilingual_v2`, one take per script section (`public/vo/`).
- **Every word is animated.** `src/data/timeline.json` holds each of the 1,421
  on-screen tokens with the time Joey says it. `src/components/Kinetic.tsx` chooses an
  animation by the kind of word:
  - plain words rise out of a blur;
  - names and key terms drop in letter by letter in orange, with an underline;
  - money, percentages and counts roll up to their value;
  - quoted speech types on.
- **Photos:** real photographs from Wikimedia Commons. None are AI-generated. Each is
  credited on screen and in `public/photos/credits.json`.
- **Music and SFX:** ElevenLabs Music v2 (a 600 s instrumental bed) and Sound Effects v2
  (`public/music`, `public/sfx`).

## Layout

| Path | What it is |
|---|---|
| `src/timeline.ts` | Running order: cold open, sting, preview, 5 × (card + story), recap, outro, end card |
| `src/beats.tsx` | Which layout and graphic sits behind each phrase, anchored to spoken words |
| `src/components/` | Field (aurora), Glass, Kinetic (per-word type), Panels (charts, photos), Chrome |
| `src/scenes/` | Section renderer, story cards and stings, the audio mix (`Mix.tsx`) |
| `scripts/sections.py` | The exact VO text, spoken→display merges ("sixty-six point four percent" → **66.4%**), key words |
| `scripts/align.py` | faster-whisper word timestamps for every VO file → `data/whisper-words.json` |
| `scripts/build_timeline.py` | Aligns Whisper's timings to the script text → `src/data/timeline.json` |
| `scripts/stills.mjs`, `scripts/sheets.py` | Frame-by-frame review: render any frames, tile them into timestamped sheets |
| `scripts/lambda-*.mjs` | Remotion Lambda deploy and render |
| `data/vo-raw/` | The untouched ElevenLabs takes (`public/vo/` holds the loudness-normalised copies) |

## Commands

```bash
npm install
npm run studio                      # preview in the browser
node scripts/stills.mjs --every 90  # a still every 3 s → out/frames/
python3 scripts/sheets.py out/sheets

# render locally
npx remotion render AINews out/ai-news-2026-09-26.mp4 --codec=h264 --crf=18 --audio-bitrate=320k

# render on Remotion Lambda (needs AWS credentials; see below)
npm run lambda:deploy
npm run lambda:render
```

If the voice is regenerated, re-run `scripts/align.py` and then
`scripts/build_timeline.py`. Every word, beat and SFX cue moves with it.

## Audio levels (measured with ffmpeg ebur128)

- VO sections came out of ElevenLabs between −15.1 and −26.2 LUFS. They are
  normalised two-pass to −16 LUFS / −1.5 dBTP, so the voice doesn't jump between stories.
- The music bed (−15.1 LUFS raw) is ducked to about −32 LUFS under speech and lifted to
  about −22 LUFS on cards.
- Each SFX has its own gain in `src/scenes/Mix.tsx`, from its measured loudness.

## Remotion Lambda

`scripts/lambda-deploy.mjs` and `scripts/lambda-render.mjs` read
`REMOTION_AWS_ACCESS_KEY_ID` / `REMOTION_AWS_SECRET_ACCESS_KEY` (or the standard
`AWS_*` pair) and `REMOTION_REGION` (default `us-east-1`). The IAM user needs the
policy printed by `npx remotion lambda policies user`.
