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
- **Music and SFX are synthesised in code** (`synth/`, `npm run audio`). Nothing is
  sampled or AI-generated. The bed is a 100 BPM A-minor underscore built from FM keys,
  detuned-saw pulse, sub bass, synthesised drums, a glass arp through a ping-pong delay,
  and a Freeverb-style reverb. It is arranged against the video's running order:
  - a filtered, tense cold open;
  - a chord stab on the sting;
  - drums drop out under every story card;
  - a darker progression for the breach story;
  - an Am9 pad on the end card.
  The SFX (whoosh, tick, impact, riser, glitch, shutter) come from the same toolkit.

## Layout

| Path | What it is |
|---|---|
| `src/runningOrder.ts` | Running order, shared by the video and the synth: cold open, sting, preview, 5 × (card + story), recap, outro, end card |
| `src/timeline.ts` | Word timeline helpers and the story list |
| `synth/` | The audio synth: `dsp.mjs` (filters, reverb, delay, WAV), `instruments.mjs`, `score.mjs` (the arrangement), `sfx.mjs`, `build.mjs` |
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
npm run audio                       # synthesise public/audio/ (music.mp3, sfx/*.wav, manifest.json)
npm run studio                      # preview in the browser
node scripts/stills.mjs --every 90  # a still every 3 s → out/frames/
python3 scripts/sheets.py out/sheets

# render locally
npx remotion render AINews out/ai-news-2026-09-26.mp4 --codec=h264 --crf=18 --audio-bitrate=320k

# render on Remotion Lambda (needs AWS credentials; see below)
npm run lambda:deploy
npm run lambda:render
```

If the voice is regenerated, re-run `scripts/align.py`, then `scripts/build_timeline.py`,
then `npm run audio`. Every word, beat, SFX cue and musical break moves with it. If the
music is out of date, the composition refuses to render, so it can't drift out of sync.

## Audio levels (measured with ffmpeg ebur128)

- VO sections came out of ElevenLabs between −15.1 and −26.2 LUFS. They are
  normalised two-pass to −16 LUFS / −1.5 dBTP, so the voice doesn't jump between stories.
- The synthesised bed is normalised to −16 LUFS. It is ducked to about −32 LUFS under
  speech and lifted to about −23 LUFS on cards.
- Each SFX gain in `src/scenes/Mix.tsx` comes from its measured loudest 400 ms window:
  ticks and shutters at about −30 LUFS, the impact at about −17 on cards.
- `python3 scripts/analyze_mix.py <file>` meters any render section by section.

## Remotion Lambda

`npm run lambda:deploy` creates (or reuses) the render function
`remotion-render-4-0-529-mem3008mb-disk10240mb-900sec` and uploads the site.
`npm run lambda:render` renders on it in 8 chunks and downloads the MP4 to `out/`.

- **Credentials:** the scripts use the standard `AWS_ACCESS_KEY_ID` /
  `AWS_SECRET_ACCESS_KEY` (or `REMOTION_AWS_*`) for an IAM user with the policy from
  `npx remotion lambda policies user`. `REMOTION_REGION` defaults to `us-east-1`.
- **Cloud sandbox:** there, credentials are injected by the outbound proxy. The AWS
  SDK builds its own HTTPS agent and would skip that proxy, so the npm scripts preload
  `scripts/aws-proxy.cjs` to route agents through `HTTPS_PROXY`. The preload does
  nothing when no proxy is set.
- **Account limits:** this account caps Lambda memory at 3008 MB and allows about 10
  concurrent executions. Hence 3008 MB, and 8 chunks plus one orchestrator.
